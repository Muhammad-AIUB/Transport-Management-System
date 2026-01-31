// src/types/index.ts

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  section?: string;
  rollNumber?: string;
}

export interface Route {
  id: string;
  routeName: string;
  routeCode?: string;
  startPoint: string;
  endPoint: string;
  distance?: number;
  estimatedDuration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType?: string;
  capacity?: number;
  driverName: string;
  driverPhone: string;
  driverLicense?: string;
  helperName?: string;
  helperPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransportFeeMaster {
  id: string;
  routeId?: string;
  route?: Route;
  zoneName?: string;
  monthlyFee: number;
  description?: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePickupPoint {
  id: string;
  routeId: string;
  route: Route;
  pickupPointId: string;
  pickupPoint: PickupPoint;
  sequenceOrder: number;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteVehicleAssignment {
  id: string;
  routeId: string;
  route: Route;
  vehicleId: string;
  vehicle: Vehicle;
  assignedDate: string;
  validFrom?: string;
  validTo?: string;
  shift?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  student: Student;
  routeId: string;
  route: Route;
  pickupPointId: string;
  pickupPoint: PickupPoint;
  assignedDate: string;
  validFrom: string;
  validTo?: string;
  shift?: string;
  monthlyFee: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}