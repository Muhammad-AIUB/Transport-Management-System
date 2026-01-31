import { Request } from 'express';

// Role enum (matches Prisma schema)
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
}

/**
 * Extended Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Standard API response structure
 */
export interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>[];
}

/**
 * Fee status enum matching Prisma schema
 */
export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED'
}

/**
 * Transport assignment status
 */
export enum TransportAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * Shift types for transport
 */
export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  BOTH = 'BOTH'
}

/**
 * Route pickup point input
 */
export interface RoutePickupPointInput {
  routeId: string;
  pickupPointId: string;
  sequenceOrder: number;
  estimatedTime?: string;
  distanceFromStart?: number;
}

/**
 * Student transport assignment input
 */
export interface StudentTransportInput {
  studentId: string;
  routeId: string;
  pickupPointId: string;
  shift?: ShiftType;
  validFrom?: Date;
  remarks?: string;
}

/**
 * Route vehicle assignment input
 */
export interface RouteVehicleInput {
  routeId: string;
  vehicleId: string;
  shift?: ShiftType;
  validFrom: Date;
  validTo?: Date;
}

/**
 * Fee master input
 */
export interface FeeMasterInput {
  routeId: string;
  zoneName?: string;
  monthlyFee: number;
  academicYear: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
