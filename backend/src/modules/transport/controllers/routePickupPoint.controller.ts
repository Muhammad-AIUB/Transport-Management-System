import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import routePickupPointService from '../services/routePickupPoint.service';

/**
 * Add a pickup point to a route
 */
export const addPickupPointToRoute = asyncHandler(async (req: Request, res: Response) => {
  const routePickupPoint = await routePickupPointService.addPickupPointToRoute(req.body);
  
  res.status(201).json(
    new ApiResponse(201, routePickupPoint, 'Pickup point added to route successfully')
  );
});

/**
 * Get all pickup points for a specific route
 */
export const getRoutePickupPoints = asyncHandler(async (req: Request, res: Response) => {
  const pickupPoints = await routePickupPointService.getRoutePickupPoints(req.params.routeId);
  
  res.status(200).json(
    new ApiResponse(200, pickupPoints, 'Route pickup points fetched successfully')
  );
});

/**
 * Update a route pickup point (sequence order, estimated time)
 */
export const updateRoutePickupPoint = asyncHandler(async (req: Request, res: Response) => {
  const updated = await routePickupPointService.updateRoutePickupPoint(req.params.id, req.body);
  
  res.status(200).json(
    new ApiResponse(200, updated, 'Route pickup point updated successfully')
  );
});

/**
 * Remove a pickup point from a route
 */
export const removePickupPointFromRoute = asyncHandler(async (req: Request, res: Response) => {
  const result = await routePickupPointService.removePickupPointFromRoute(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Pickup point removed from route successfully')
  );
});
