
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';

interface AssignVehicleToRouteDTO {
  routeId: string;
  vehicleId: string;
  validFrom?: Date;
  validTo?: Date;
  shift?: string;
}

class RouteVehicleService {
  async assignVehicleToRoute(data: AssignVehicleToRouteDTO) {
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    });

    if (!route) {
      throw new ApiError(404, 'Route not found');
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    const existing = await prisma.routeVehicleAssignment.findFirst({
      where: {
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        shift: data.shift || null,
        isActive: true,
      },
    });

    if (existing) {
      throw new ApiError(409, 'This vehicle is already assigned to this route for this shift');
    }

    const assignment = await prisma.routeVehicleAssignment.create({
      data: {
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        validFrom: data.validFrom,
        validTo: data.validTo,
        shift: data.shift,
      },
      include: {
        route: true,
        vehicle: true,
      },
    });

    return assignment;
  }

  async getAllAssignments(filters: {
    routeId?: string;
    vehicleId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.routeId) where.routeId = filters.routeId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [assignments, total] = await Promise.all([
      prisma.routeVehicleAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          route: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.routeVehicleAssignment.count({ where }),
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

  async deactivateAssignment(id: string) {
    const assignment = await prisma.routeVehicleAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    const updated = await prisma.routeVehicleAssignment.update({
      where: { id },
      data: {
        isActive: false,
        validTo: new Date(),
      },
    });

    return updated;
  }
}

export default new RouteVehicleService();