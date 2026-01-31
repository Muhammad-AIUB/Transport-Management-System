// backend/src/modules/transport/services/vehicle.service.ts

import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';

interface CreateVehicleDTO {
  vehicleNumber: string;
  vehicleType?: string;
  capacity?: number;
  driverName: string;
  driverPhone: string;
  driverLicense?: string;
  helperName?: string;
  helperPhone?: string;
  registrationNumber?: string;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
}

class VehicleService {
  async createVehicle(data: CreateVehicleDTO) {
    const existing = await prisma.vehicle.findUnique({
      where: { vehicleNumber: data.vehicleNumber },
    });

    if (existing) {
      throw new ApiError(409, 'Vehicle with this number already exists');
    }

    const vehicle = await prisma.vehicle.create({
      data,
    });

    return vehicle;
  }

  async getAllVehicles(filters: {
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
        { vehicleNumber: { contains: filters.search, mode: 'insensitive' } },
        { driverName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { routeAssignments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        routeAssignments: {
          include: { route: true },
          where: { isActive: true },
        },
      },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    return vehicle;
  }

  async updateVehicle(id: string, data: Partial<CreateVehicleDTO>) {
    await this.getVehicleById(id);

    if (data.vehicleNumber) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          vehicleNumber: data.vehicleNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ApiError(409, 'Vehicle with this number already exists');
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteVehicle(id: string) {
    await this.getVehicleById(id);

    const activeAssignments = await prisma.routeVehicleAssignment.count({
      where: { vehicleId: id, isActive: true },
    });

    if (activeAssignments > 0) {
      throw new ApiError(400, 'Cannot delete vehicle with active route assignments');
    }

    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Vehicle deactivated successfully' };
  }
}

export default new VehicleService();