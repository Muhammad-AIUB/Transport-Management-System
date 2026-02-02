import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';

interface CreateStudentDTO {
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  class: string;
  section?: string;
  rollNumber?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

interface UpdateStudentDTO extends Partial<CreateStudentDTO> {
  isActive?: boolean;
}

class StudentService {
  async createStudent(data: CreateStudentDTO) {
    const existing = await prisma.student.findUnique({
      where: { admissionNumber: data.admissionNumber },
    });
    if (existing) {
      throw new ApiError(409, 'Student with this admission number already exists');
    }
    const student = await prisma.student.create({ data });
    return student;
  }

  async getAllStudents(filters: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const { page = 1, limit = 10, search, isActive } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);
    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    return student;
  }

  async updateStudent(id: string, data: UpdateStudentDTO) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    if (data.admissionNumber && data.admissionNumber !== student.admissionNumber) {
      const existing = await prisma.student.findUnique({
        where: { admissionNumber: data.admissionNumber },
      });
      if (existing) {
        throw new ApiError(409, 'Another student with this admission number already exists');
      }
    }
    const updated = await prisma.student.update({
      where: { id },
      data,
    });
    return updated;
  }

  async deleteStudent(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        transportAssignments: { where: { status: 'ACTIVE' } },
      },
    });
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    if (student.transportAssignments.length > 0) {
      throw new ApiError(400, 'Cannot delete student with active transport assignments');
    }
    await prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }
}

export default new StudentService();
