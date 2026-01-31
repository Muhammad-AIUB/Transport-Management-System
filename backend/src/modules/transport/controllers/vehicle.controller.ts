import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import vehicleService from '../services/vehicle.service';

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json(
    new ApiResponse(201, vehicle, 'Vehicle created successfully')
  );
});

export const getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };
  const result = await vehicleService.getAllVehicles(filters);
  res.status(200).json(
    new ApiResponse(200, result, 'Vehicles fetched successfully')
  );
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  res.status(200).json(
    new ApiResponse(200, vehicle, 'Vehicle fetched successfully')
  );
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const updated = await vehicleService.updateVehicle(req.params.id, req.body);
  res.status(200).json(
    new ApiResponse(200, updated, 'Vehicle updated successfully')
  );
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const result = await vehicleService.deleteVehicle(req.params.id);
  res.status(200).json(
    new ApiResponse(200, result, 'Vehicle deactivated successfully')
  );
});