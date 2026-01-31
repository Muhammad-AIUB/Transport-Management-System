import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import pickupPointService from '../services/pickupPoint.service';

/**
 * Create a new pickup point
 */
export const createPickupPoint = asyncHandler(async (req: Request, res: Response) => {
  const pickupPoint = await pickupPointService.createPickupPoint(req.body);
  
  res.status(201).json(
    new ApiResponse(201, pickupPoint, 'Pickup point created successfully')
  );
});

/**
 * Get all pickup points with optional filters
 */
export const getAllPickupPoints = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };

  const result = await pickupPointService.getAllPickupPoints(filters);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Pickup points fetched successfully')
  );
});

/**
 * Get a pickup point by ID
 */
export const getPickupPointById = asyncHandler(async (req: Request, res: Response) => {
  const pickupPoint = await pickupPointService.getPickupPointById(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, pickupPoint, 'Pickup point fetched successfully')
  );
});

/**
 * Update a pickup point
 */
export const updatePickupPoint = asyncHandler(async (req: Request, res: Response) => {
  const updated = await pickupPointService.updatePickupPoint(req.params.id, req.body);
  
  res.status(200).json(
    new ApiResponse(200, updated, 'Pickup point updated successfully')
  );
});

/**
 * Delete (deactivate) a pickup point
 */
export const deletePickupPoint = asyncHandler(async (req: Request, res: Response) => {
  const result = await pickupPointService.deletePickupPoint(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Pickup point deactivated successfully')
  );
});
