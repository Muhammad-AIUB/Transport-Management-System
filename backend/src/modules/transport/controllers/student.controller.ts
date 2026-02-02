import { Request, Response } from 'express';
import studentService from '../services/student.service';
import asyncHandler from '../../../utils/asyncHandler';
import ApiResponse from '../../../utils/ApiResponse';

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json(new ApiResponse(201, student, 'Student created successfully'));
});

export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.getAllStudents({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
  });
  res.json(new ApiResponse(200, result, 'Students fetched successfully'));
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  res.json(new ApiResponse(200, student, 'Student fetched successfully'));
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  res.json(new ApiResponse(200, student, 'Student updated successfully'));
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.deleteStudent(req.params.id);
  res.json(new ApiResponse(200, result, 'Student deleted successfully'));
});
