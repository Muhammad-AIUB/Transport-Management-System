import { Request, Response } from 'express';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';
import studentTransportService from '../services/studentTransport.service';

/** Ensure Prisma gets full ISO-8601 DateTime; date-only strings (e.g. "2026-03-05") cause "premature end of input". */
function toISOOrUndefined(value: string | Date | null | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  const d = typeof value === 'string' ? new Date(value) : value;
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export const assignStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const payload = {
    studentId: body.studentId as string,
    routeId: body.routeId as string,
    pickupPointId: body.pickupPointId as string,
    validFrom: toISOOrUndefined(body.validFrom as string) ?? new Date().toISOString(),
    validTo: toISOOrUndefined(body.validTo as string),
    shift: typeof body.shift === 'string' && body.shift.trim() ? body.shift.trim() : undefined,
    createdBy: typeof body.createdBy === 'string' && body.createdBy.trim() ? body.createdBy.trim() : undefined,
  };
  const result = await studentTransportService.assignStudentToTransport(payload);
  res.status(201).json(
    new ApiResponse(201, result, 'Student assigned to transport successfully')
  );
});
export const getAllAssignments = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    studentId: req.query.studentId as string,
    routeId: req.query.routeId as string,
    status: req.query.status as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
  };
  const result = await studentTransportService.getAllAssignments(filters);
  res.status(200).json(
    new ApiResponse(200, result, 'Assignments fetched successfully')
  );
});
export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await studentTransportService.getAssignmentById(req.params.id);
  res.status(200).json(
    new ApiResponse(200, assignment, 'Assignment fetched successfully')
  );
});
export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const updated = await studentTransportService.updateAssignment(req.params.id, req.body);
  res.status(200).json(
    new ApiResponse(200, updated, 'Assignment updated successfully')
  );
});
export const deactivateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentTransportService.deactivateAssignment(req.params.id);
  res.status(200).json(
    new ApiResponse(200, result, 'Assignment deactivated successfully')
  );
});
export const searchStudents = asyncHandler(async (req: Request, res: Response) => {
  const students = await studentTransportService.searchStudents(req.query.q as string);
  res.status(200).json(
    new ApiResponse(200, students, 'Students fetched successfully')
  );
});