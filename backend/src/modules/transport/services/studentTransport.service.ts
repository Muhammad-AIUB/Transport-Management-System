
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';
/** Normalize date input (string or Date) to Date for Prisma. Date-only strings (e.g. "2026-02-20") become midnight UTC. */
function toDate(value: string | Date | null | undefined): Date | undefined {
  if (value == null || value === '') return undefined;
  const d = value instanceof Date ? value : new Date(value as string);
  return isNaN(d.getTime()) ? undefined : d;
}

interface AssignStudentTransportDTO {
  studentId: string;
  routeId: string;
  pickupPointId: string;
  validFrom?: string | Date;
  validTo?: string | Date | null;
  shift?: string | null;
  createdBy?: string | null;
}
class StudentTransportService {
  async assignStudentToTransport(data: AssignStudentTransportDTO) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    if (!student.isActive) {
      throw new ApiError(400, 'Student is not active');
    }
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
      include: {
        pickupPoints: {
          where: { pickupPointId: data.pickupPointId },
        },
      },
    });
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }
    if (!route.isActive) {
      throw new ApiError(400, 'Route is not active');
    }
    if (route.pickupPoints.length === 0) {
      throw new ApiError(
        400,
        'Selected pickup point is not part of this route'
      );
    }
    const existingAssignment = await prisma.studentTransportAssignment.findFirst({
      where: {
        studentId: data.studentId,
        status: 'ACTIVE',
      },
    });
    if (existingAssignment) {
      throw new ApiError(
        400,
        'Student already has an active transport assignment. Please deactivate it first.'
      );
    }
    const currentAcademicYear = process.env.CURRENT_ACADEMIC_YEAR || '2024-2025';
    const transportFee = await prisma.transportFeeMaster.findFirst({
      where: {
        routeId: data.routeId,
        academicYear: currentAcademicYear,
        isActive: true,
      },
    });
    if (!transportFee) {
      throw new ApiError(
        404,
        'No transport fee structure found for this route and academic year'
      );
    }
    let transportFeeType = await prisma.feeType.findFirst({
      where: { name: 'Transport Fee' },
    });
    if (!transportFeeType) {
      transportFeeType = await prisma.feeType.create({
        data: {
          name: 'Transport Fee',
          description: 'Monthly transport fee',
          category: 'Transport',
        },
      });
    }
    const result = await prisma.$transaction(async (tx: any) => {
      // Prisma expects full ISO-8601 DateTime; date-only strings (e.g. "2026-02-19") cause "premature end of input".
      // Always pass Date instances so the client serializes them correctly.
      const validFrom = toDate(data.validFrom) ?? new Date();
      const validTo = toDate(data.validTo) ?? undefined;
      const shift = data.shift?.trim() || undefined;
      const createdBy = data.createdBy?.trim() || undefined;

      const assignment = await tx.studentTransportAssignment.create({
        data: {
          studentId: data.studentId,
          routeId: data.routeId,
          pickupPointId: data.pickupPointId,
          validFrom,
          validTo,
          shift,
          monthlyFee: transportFee.monthlyFee,
          status: 'ACTIVE',
          createdBy,
        },
        include: {
          student: true,
          route: true,
          pickupPoint: true,
        },
      });
      let feeMaster = await tx.feeMaster.findFirst({
        where: {
          feeTypeId: transportFeeType!.id,
          academicYear: currentAcademicYear,
          isActive: true,
        },
      });
      if (!feeMaster) {
        feeMaster = await tx.feeMaster.create({
          data: {
            feeTypeId: transportFeeType!.id,
            amount: transportFee.monthlyFee,
            academicYear: currentAcademicYear,
            isActive: true,
          },
        });
      }
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const existingFee = await tx.studentFeeAssignment.findFirst({
        where: {
          studentId: data.studentId,
          feeMasterId: feeMaster.id,
          month: currentMonth,
          year: currentYear,
        },
      });
      let feeAssignment;
      if (!existingFee) {
        const dueDate = new Date(currentYear, currentMonth - 1, 15);
        feeAssignment = await tx.studentFeeAssignment.create({
          data: {
            studentId: data.studentId,
            feeMasterId: feeMaster.id,
            amount: transportFee.monthlyFee,
            month: currentMonth,
            year: currentYear,
            dueDate: dueDate,
            status: 'PENDING',
            createdBy: data.createdBy,
          },
        });
      }
      return {
        assignment,
        feeAssignment,
        message: 'Student assigned to transport and fee generated successfully',
      };
    });
    return result;
  }
  async getAllAssignments(filters: {
    studentId?: string;
    routeId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.routeId) where.routeId = filters.routeId;
    if (filters.status) where.status = filters.status;
    const [assignments, total] = await Promise.all([
      prisma.studentTransportAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true,
              class: true,
              section: true,
            },
          },
          route: {
            select: {
              id: true,
              routeName: true,
              routeCode: true,
            },
          },
          pickupPoint: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentTransportAssignment.count({ where }),
    ]);
    return {
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getAssignmentById(id: string) {
    const assignment = await prisma.studentTransportAssignment.findUnique({
      where: { id },
      include: {
        student: true,
        route: true,
        pickupPoint: true,
      },
    });
    if (!assignment) {
      throw new ApiError(404, 'Transport assignment not found');
    }
    return assignment;
  }
  async updateAssignment(id: string, data: Partial<AssignStudentTransportDTO>) {
    await this.getAssignmentById(id);
    const updated = await prisma.studentTransportAssignment.update({
      where: { id },
      data: {
        pickupPointId: data.pickupPointId,
        shift: data.shift,
        validTo: data.validTo,
      },
      include: {
        student: true,
        route: true,
        pickupPoint: true,
      },
    });
    return updated;
  }
  async deactivateAssignment(id: string) {
    await this.getAssignmentById(id);
    const updated = await prisma.studentTransportAssignment.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        validTo: new Date(),
      },
    });
    return updated;
  }
  async searchStudents(query: string) {
    const students = await prisma.student.findMany({
      where: {
        isActive: true,
        OR: [
          { admissionNumber: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        class: true,
        section: true,
        rollNumber: true,
      },
      take: 10,
    });
    return students;
  }
}
export default new StudentTransportService();