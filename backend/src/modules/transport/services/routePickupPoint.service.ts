
import prisma from '../../../config/database';
import ApiError from '../../../utils/ApiError';
interface AddPickupPointToRouteDTO {
  routeId: string;
  pickupPointId: string;
  sequenceOrder: number;
  estimatedTime?: string;
}
class RoutePickupPointService {
  async addPickupPointToRoute(data: AddPickupPointToRouteDTO) {
    
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    });
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }
    
    const pickupPoint = await prisma.pickupPoint.findUnique({
      where: { id: data.pickupPointId },
    });
    if (!pickupPoint) {
      throw new ApiError(404, 'Pickup point not found');
    }
    
    const existing = await prisma.routePickupPoint.findFirst({
      where: {
        routeId: data.routeId,
        pickupPointId: data.pickupPointId,
      },
    });
    if (existing) {
      throw new ApiError(409, 'This pickup point is already added to this route');
    }
    const routePickupPoint = await prisma.routePickupPoint.create({
      data,
      include: {
        route: true,
        pickupPoint: true,
      },
    });
    return routePickupPoint;
  }
  async getRoutePickupPoints(routeId: string) {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
    });
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }
    const pickupPoints = await prisma.routePickupPoint.findMany({
      where: { routeId },
      include: { pickupPoint: true },
      orderBy: { sequenceOrder: 'asc' },
    });
    return pickupPoints;
  }
  async updateRoutePickupPoint(id: string, data: { sequenceOrder?: number; estimatedTime?: string }) {
    const routePickupPoint = await prisma.routePickupPoint.findUnique({
      where: { id },
    });
    if (!routePickupPoint) {
      throw new ApiError(404, 'Route pickup point not found');
    }
    const updated = await prisma.routePickupPoint.update({
      where: { id },
      data,
      include: {
        route: true,
        pickupPoint: true,
      },
    });
    return updated;
  }
  async removePickupPointFromRoute(id: string) {
    const routePickupPoint = await prisma.routePickupPoint.findUnique({
      where: { id },
    });
    if (!routePickupPoint) {
      throw new ApiError(404, 'Route pickup point not found');
    }
    const studentUsage = await prisma.studentTransportAssignment.count({
      where: {
        routeId: routePickupPoint.routeId,
        pickupPointId: routePickupPoint.pickupPointId,
        status: 'ACTIVE',
      },
    });
    if (studentUsage > 0) {
      throw new ApiError(400, 'Cannot remove pickup point with active student assignments');
    }
    await prisma.routePickupPoint.delete({
      where: { id },
    });
    return { message: 'Pickup point removed from route successfully' };
  }
}
export default new RoutePickupPointService();