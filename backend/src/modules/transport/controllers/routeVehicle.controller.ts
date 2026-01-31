import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import routeVehicleService from '../services/routeVehicle.service';

/**
 * Assign a vehicle to a route
 */
export const assignVehicleToRoute = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await routeVehicleService.assignVehicleToRoute(req.body);
  
  res.status(201).json(
    new ApiResponse(201, assignment, 'Vehicle assigned to route successfully')
  );
});

/**
 * Get all vehicle-route assignments with optional filters
 */
export const getAllAssignments = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    routeId: req.query.routeId as string,
    vehicleId: req.query.vehicleId as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };

  const result = await routeVehicleService.getAllAssignments(filters);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Assignments fetched successfully')
  );
});

/**
 * Deactivate a vehicle-route assignment
 */
export const deactivateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await routeVehicleService.deactivateAssignment(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Assignment deactivated successfully')
  );
});
