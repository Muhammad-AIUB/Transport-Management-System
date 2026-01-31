import { Request } from 'express';

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>[];
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED'
}

export enum TransportAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  BOTH = 'BOTH'
}

export interface RoutePickupPointInput {
  routeId: string;
  pickupPointId: string;
  sequenceOrder: number;
  estimatedTime?: string;
  distanceFromStart?: number;
}

export interface StudentTransportInput {
  studentId: string;
  routeId: string;
  pickupPointId: string;
  shift?: ShiftType;
  validFrom?: Date;
  remarks?: string;
}

export interface RouteVehicleInput {
  routeId: string;
  vehicleId: string;
  shift?: ShiftType;
  validFrom: Date;
  validTo?: Date;
}

export interface FeeMasterInput {
  routeId: string;
  zoneName?: string;
  monthlyFee: number;
  academicYear: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
