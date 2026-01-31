// src/services/transportApi.ts

import api from './api';
import {
  ApiResponse,
  Route,
  PickupPoint,
  Vehicle,
  TransportFeeMaster,
  RoutePickupPoint,
  RouteVehicleAssignment,
  StudentTransportAssignment,
  Student,
} from '@/types';

class TransportAPI {
  // Routes
  async getRoutes(params?: any) {
    const response = await api.get<ApiResponse<{ routes: Route[]; pagination: any }>>('/transport/routes', { params });
    return response.data;
  }

  async getRouteById(id: string) {
    const response = await api.get<ApiResponse<Route>>(`/transport/routes/${id}`);
    return response.data;
  }

  async createRoute(data: Partial<Route>) {
    const response = await api.post<ApiResponse<Route>>('/transport/routes', data);
    return response.data;
  }

  async updateRoute(id: string, data: Partial<Route>) {
    const response = await api.put<ApiResponse<Route>>(`/transport/routes/${id}`, data);
    return response.data;
  }

  async deleteRoute(id: string) {
    const response = await api.delete<ApiResponse<any>>(`/transport/routes/${id}`);
    return response.data;
  }

  // Pickup Points
  async getPickupPoints(params?: any) {
    const response = await api.get<ApiResponse<{ pickupPoints: PickupPoint[]; pagination: any }>>('/transport/pickup-points', { params });
    return response.data;
  }

  async createPickupPoint(data: Partial<PickupPoint>) {
    const response = await api.post<ApiResponse<PickupPoint>>('/transport/pickup-points', data);
    return response.data;
  }

  async updatePickupPoint(id: string, data: Partial<PickupPoint>) {
    const response = await api.put<ApiResponse<PickupPoint>>(`/transport/pickup-points/${id}`, data);
    return response.data;
  }

  async deletePickupPoint(id: string) {
    const response = await api.delete<ApiResponse<any>>(`/transport/pickup-points/${id}`);
    return response.data;
  }

  // Vehicles
  async getVehicles(params?: any) {
    const response = await api.get<ApiResponse<{ vehicles: Vehicle[]; pagination: any }>>('/transport/vehicles', { params });
    return response.data;
  }

  async createVehicle(data: Partial<Vehicle>) {
    const response = await api.post<ApiResponse<Vehicle>>('/transport/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const response = await api.put<ApiResponse<Vehicle>>(`/transport/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string) {
    const response = await api.delete<ApiResponse<any>>(`/transport/vehicles/${id}`);
    return response.data;
  }

  // Fee Master
  async getFeeMasters(params?: any) {
    const response = await api.get<ApiResponse<{ feeMasters: TransportFeeMaster[]; pagination: any }>>('/transport/fee-master', { params });
    return response.data;
  }

  async createFeeMaster(data: Partial<TransportFeeMaster>) {
    const response = await api.post<ApiResponse<TransportFeeMaster>>('/transport/fee-master', data);
    return response.data;
  }

  async updateFeeMaster(id: string, data: Partial<TransportFeeMaster>) {
    const response = await api.put<ApiResponse<TransportFeeMaster>>(`/transport/fee-master/${id}`, data);
    return response.data;
  }

  async deleteFeeMaster(id: string) {
    const response = await api.delete<ApiResponse<any>>(`/transport/fee-master/${id}`);
    return response.data;
  }

  // Route Pickup Points
  async getRoutePickupPoints(routeId: string) {
    const response = await api.get<ApiResponse<RoutePickupPoint[]>>(`/transport/route-pickup-points/route/${routeId}`);
    return response.data;
  }

  async addPickupPointToRoute(data: Partial<RoutePickupPoint>) {
    const response = await api.post<ApiResponse<RoutePickupPoint>>('/transport/route-pickup-points', data);
    return response.data;
  }

  async updateRoutePickupPoint(id: string, data: Partial<RoutePickupPoint>) {
    const response = await api.put<ApiResponse<RoutePickupPoint>>(`/transport/route-pickup-points/${id}`, data);
    return response.data;
  }

  async removePickupPointFromRoute(id: string) {
    const response = await api.delete<ApiResponse<any>>(`/transport/route-pickup-points/${id}`);
    return response.data;
  }

  // Route Vehicle Assignments
  async getRouteVehicleAssignments(params?: any) {
    const response = await api.get<ApiResponse<{ assignments: RouteVehicleAssignment[]; pagination: any }>>('/transport/route-vehicles', { params });
    return response.data;
  }

  async assignVehicleToRoute(data: Partial<RouteVehicleAssignment>) {
    const response = await api.post<ApiResponse<RouteVehicleAssignment>>('/transport/route-vehicles', data);
    return response.data;
  }

  async deactivateRouteVehicle(id: string) {
    const response = await api.put<ApiResponse<any>>(`/transport/route-vehicles/${id}/deactivate`);
    return response.data;
  }

  // Student Transport
  async getStudentTransportAssignments(params?: any) {
    const response = await api.get<ApiResponse<{ assignments: StudentTransportAssignment[]; pagination: any }>>('/transport/student-transport', { params });
    return response.data;
  }

  async assignStudentToTransport(data: Partial<StudentTransportAssignment>) {
    const response = await api.post<ApiResponse<any>>('/transport/student-transport/assign', data);
    return response.data;
  }

  async updateStudentTransport(id: string, data: Partial<StudentTransportAssignment>) {
    const response = await api.put<ApiResponse<StudentTransportAssignment>>(`/transport/student-transport/${id}`, data);
    return response.data;
  }

  async deactivateStudentTransport(id: string) {
    const response = await api.put<ApiResponse<any>>(`/transport/student-transport/${id}/deactivate`);
    return response.data;
  }

  async searchStudents(query: string) {
    const response = await api.get<ApiResponse<Student[]>>('/transport/students/search', {
      params: { q: query },
    });
    return response.data;
  }
}

export default new TransportAPI();