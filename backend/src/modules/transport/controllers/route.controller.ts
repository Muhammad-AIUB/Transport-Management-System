import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import routeService from '../services/route.service';

export const createRoute = asyncHandler(async (req: Request, res: Response) => {
  const route = await routeService.createRoute(req.body);
  res.status(201).json(
    new ApiResponse(201, route, 'Route created successfully')
  );
});

export const getAllRoutes = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };
  const result = await routeService.getAllRoutes(filters);
  res.status(200).json(
    new ApiResponse(200, result, 'Routes fetched successfully')
  );
});

export const getRouteById = asyncHandler(async (req: Request, res: Response) => {
  const route = await routeService.getRouteById(req.params.id);
  res.status(200).json(
    new ApiResponse(200, route, 'Route fetched successfully')
  );
});

export const updateRoute = asyncHandler(async (req: Request, res: Response) => {
  const updated = await routeService.updateRoute(req.params.id, req.body);
  res.status(200).json(
    new ApiResponse(200, updated, 'Route updated successfully')
  );
});

export const deleteRoute = asyncHandler(async (req: Request, res: Response) => {
  const result = await routeService.deleteRoute(req.params.id);
  res.status(200).json(
    new ApiResponse(200, result, 'Route deactivated successfully')
  );
});