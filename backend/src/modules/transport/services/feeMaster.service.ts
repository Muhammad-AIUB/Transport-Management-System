
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';
interface CreateFeeMasterDTO {
  routeId?: string;
  zoneName?: string;
  monthlyFee: number;
  description?: string;
  academicYear: string;
}
class TransportFeeMasterService {
  async createFeeMaster(data: CreateFeeMasterDTO) {
    
    if (!data.routeId && !data.zoneName) {
      throw new ApiError(400, 'Either routeId or zoneName must be provided');
    }
    
    if (data.routeId) {
      const route = await prisma.route.findUnique({
        where: { id: data.routeId },
      });
      if (!route) {
        throw new ApiError(404, 'Route not found');
      }
      
      const existing = await prisma.transportFeeMaster.findFirst({
        where: {
          routeId: data.routeId,
          academicYear: data.academicYear,
          isActive: true,
        },
      });
      if (existing) {
        throw new ApiError(409, 'Fee master already exists for this route and academic year');
      }
    }
    const feeMaster = await prisma.transportFeeMaster.create({
      data,
      include: { route: true },
    });
    return feeMaster;
  }
  async getAllFeeMasters(filters: {
    routeId?: string;
    academicYear?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.routeId) where.routeId = filters.routeId;
    if (filters.academicYear) where.academicYear = filters.academicYear;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    const [feeMasters, total] = await Promise.all([
      prisma.transportFeeMaster.findMany({
        where,
        skip,
        take: limit,
        include: { route: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transportFeeMaster.count({ where }),
    ]);
    return {
      feeMasters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getFeeMasterById(id: string) {
    const feeMaster = await prisma.transportFeeMaster.findUnique({
      where: { id },
      include: { route: true },
    });
    if (!feeMaster) {
      throw new ApiError(404, 'Fee master not found');
    }
    return feeMaster;
  }
  async updateFeeMaster(id: string, data: Partial<CreateFeeMasterDTO>) {
    await this.getFeeMasterById(id);
    const updated = await prisma.transportFeeMaster.update({
      where: { id },
      data,
      include: { route: true },
    });
    return updated;
  }
  async deleteFeeMaster(id: string) {
    await this.getFeeMasterById(id);
    await prisma.transportFeeMaster.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Fee master deactivated successfully' };
  }
}
export default new TransportFeeMasterService();