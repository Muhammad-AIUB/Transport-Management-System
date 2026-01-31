
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';
interface CreateRouteDTO {
  routeName: string;
  routeCode?: string;
  startPoint: string;
  endPoint: string;
  distance?: number;
  estimatedDuration?: number;
}
class RouteService {
  async createRoute(data: CreateRouteDTO) {
    const existing = await prisma.route.findUnique({
      where: { routeName: data.routeName },
    });
    if (existing) {
      throw new ApiError(409, 'Route with this name already exists');
    }
    if (data.routeCode) {
      const existingCode = await prisma.route.findUnique({
        where: { routeCode: data.routeCode },
      });
      if (existingCode) {
        throw new ApiError(409, 'Route with this code already exists');
      }
    }
    const route = await prisma.route.create({
      data: {
        routeName: data.routeName,
        routeCode: data.routeCode,
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        distance: data.distance,
        estimatedDuration: data.estimatedDuration,
      },
    });
    return route;
  }
  async getAllRoutes(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.search) {
      where.OR = [
        { routeName: { contains: filters.search, mode: 'insensitive' } },
        { routeCode: { contains: filters.search, mode: 'insensitive' } },
        { startPoint: { contains: filters.search, mode: 'insensitive' } },
        { endPoint: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              pickupPoints: true,
              vehicleAssignments: true,
              studentAssignments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.route.count({ where }),
    ]);
    return {
      routes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getRouteById(id: string) {
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        pickupPoints: {
          include: {
            pickupPoint: true,
          },
          orderBy: { sequenceOrder: 'asc' },
        },
        vehicleAssignments: {
          include: {
            vehicle: true,
          },
          where: { isActive: true },
        },
        transportFees: {
          where: { isActive: true },
        },
      },
    });
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }
    return route;
  }
  async updateRoute(id: string, data: Partial<CreateRouteDTO>) {
    const route = await this.getRouteById(id);
    if (data.routeName && data.routeName !== route.routeName) {
      const existing = await prisma.route.findUnique({
        where: { routeName: data.routeName },
      });
      if (existing) {
        throw new ApiError(409, 'Route with this name already exists');
      }
    }
    const updated = await prisma.route.update({
      where: { id },
      data,
    });
    return updated;
  }
  async deleteRoute(id: string) {
    await this.getRouteById(id);
    const activeAssignments = await prisma.studentTransportAssignment.count({
      where: {
        routeId: id,
        status: 'ACTIVE',
      },
    });
    if (activeAssignments > 0) {
      throw new ApiError(
        400,
        'Cannot delete route with active student assignments'
      );
    }
    await prisma.route.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Route deactivated successfully' };
  }
}
export default new RouteService();