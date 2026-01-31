
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';

interface CreatePickupPointDTO {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

class PickupPointService {
  async createPickupPoint(data: CreatePickupPointDTO) {
    const pickupPoint = await prisma.pickupPoint.create({
      data,
    });
    return pickupPoint;
  }

  async getAllPickupPoints(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [pickupPoints, total] = await Promise.all([
      prisma.pickupPoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pickupPoint.count({ where }),
    ]);

    return {
      pickupPoints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPickupPointById(id: string) {
    const pickupPoint = await prisma.pickupPoint.findUnique({
      where: { id },
    });

    if (!pickupPoint) {
      throw new ApiError(404, 'Pickup point not found');
    }

    return pickupPoint;
  }

  async updatePickupPoint(id: string, data: Partial<CreatePickupPointDTO>) {
    await this.getPickupPointById(id);

    const updated = await prisma.pickupPoint.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deletePickupPoint(id: string) {
    await this.getPickupPointById(id);

    
    const usage = await prisma.routePickupPoint.count({
      where: { pickupPointId: id },
    });

    if (usage > 0) {
      throw new ApiError(400, 'Cannot delete pickup point that is assigned to routes');
    }

    await prisma.pickupPoint.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Pickup point deactivated successfully' };
  }
}

export default new PickupPointService();