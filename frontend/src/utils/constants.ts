// src/utils/constants.ts

/**
 * Application-wide constants
 */

export const APP_NAME = 'Transport Management System';

export const SHIFTS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'BOTH', label: 'Both' },
] as const;

export const TRANSPORT_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'red' },
] as const;

export const FEE_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'PAID', label: 'Paid', color: 'green' },
  { value: 'PARTIAL', label: 'Partial', color: 'blue' },
  { value: 'OVERDUE', label: 'Overdue', color: 'red' },
  { value: 'WAIVED', label: 'Waived', color: 'gray' },
] as const;

export const VEHICLE_TYPES = [
  { value: 'BUS', label: 'Bus' },
  { value: 'VAN', label: 'Van' },
  { value: 'MINI_BUS', label: 'Mini Bus' },
  { value: 'CAR', label: 'Car' },
] as const;

export const ACADEMIC_YEARS = [
  '2023-2024',
  '2024-2025',
  '2025-2026',
  '2026-2027',
];

export const CURRENT_ACADEMIC_YEAR = '2024-2025';

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 10,
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TRANSPORT: {
    ROUTES: '/transport/routes',
    VEHICLES: '/transport/vehicles',
    PICKUP_POINTS: '/transport/pickup-points',
    FEE_MASTER: '/transport/fee-master',
    ROUTE_PICKUP_POINTS: '/transport/route-pickup-points',
    ASSIGN_VEHICLE: '/transport/assign-vehicle',
    STUDENT_TRANSPORT: '/transport/student-transport',
  },
} as const;

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    name: 'Routes',
    path: ROUTES.TRANSPORT.ROUTES,
    icon: 'Route',
  },
  {
    name: 'Vehicles',
    path: ROUTES.TRANSPORT.VEHICLES,
    icon: 'Bus',
  },
  {
    name: 'Pickup Points',
    path: ROUTES.TRANSPORT.PICKUP_POINTS,
    icon: 'MapPin',
  },
  {
    name: 'Fee Master',
    path: ROUTES.TRANSPORT.FEE_MASTER,
    icon: 'DollarSign',
  },
  {
    name: 'Route Pickup Points',
    path: ROUTES.TRANSPORT.ROUTE_PICKUP_POINTS,
    icon: 'GitBranch',
  },
  {
    name: 'Assign Vehicle',
    path: ROUTES.TRANSPORT.ASSIGN_VEHICLE,
    icon: 'Link',
  },
  {
    name: 'Student Transport',
    path: ROUTES.TRANSPORT.STUDENT_TRANSPORT,
    icon: 'Users',
  },
] as const;

/**
 * Status badge color classes
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-blue-100 text-blue-800',
    OVERDUE: 'bg-red-100 text-red-800',
    WAIVED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
