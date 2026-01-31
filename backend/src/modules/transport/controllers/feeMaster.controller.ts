import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import feeMasterService from '../services/feeMaster.service';

/**
 * Create a new transport fee master record
 */
export const createFeeMaster = asyncHandler(async (req: Request, res: Response) => {
  const feeMaster = await feeMasterService.createFeeMaster(req.body);
  
  res.status(201).json(
    new ApiResponse(201, feeMaster, 'Transport fee master created successfully')
  );
});

/**
 * Get all fee masters with optional filters
 */
export const getAllFeeMasters = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    routeId: req.query.routeId as string,
    academicYear: req.query.academicYear as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };

  const result = await feeMasterService.getAllFeeMasters(filters);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Fee masters fetched successfully')
  );
});

/**
 * Get a fee master by ID
 */
export const getFeeMasterById = asyncHandler(async (req: Request, res: Response) => {
  const feeMaster = await feeMasterService.getFeeMasterById(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, feeMaster, 'Fee master fetched successfully')
  );
});

/**
 * Update a fee master
 */
export const updateFeeMaster = asyncHandler(async (req: Request, res: Response) => {
  const updated = await feeMasterService.updateFeeMaster(req.params.id, req.body);
  
  res.status(200).json(
    new ApiResponse(200, updated, 'Fee master updated successfully')
  );
});

/**
 * Delete (deactivate) a fee master
 */
export const deleteFeeMaster = asyncHandler(async (req: Request, res: Response) => {
  const result = await feeMasterService.deleteFeeMaster(req.params.id);
  
  res.status(200).json(
    new ApiResponse(200, result, 'Fee master deactivated successfully')
  );
});
