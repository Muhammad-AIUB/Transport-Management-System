
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, X, Bus, Route as RouteIcon, Calendar } from 'lucide-react';
import { transportApi } from '../../services/transportApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { SHIFTS } from '../../utils/constants';
import type { Route, Vehicle, RouteVehicleAssignment } from '../../types';
const assignVehicleSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  shift: z.string().optional(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validTo: z.string().optional(),
});
type AssignVehicleFormData = z.infer<typeof assignVehicleSchema>;
const AssignVehiclePage: React.FC = () => {
  const [assignments, setAssignments] = useState<RouteVehicleAssignment[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignVehicleFormData>({
    resolver: zodResolver(assignVehicleSchema),
    defaultValues: {
      validFrom: new Date().toISOString().split('T')[0],
    },
  });
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, routesRes, vehiclesRes] = await Promise.all([
        transportApi.getRouteVehicleAssignments({ isActive: true }),
        transportApi.getRoutes({ isActive: true, limit: 100 }),
        transportApi.getVehicles({ isActive: true, limit: 100 }),
      ]);
      setAssignments(assignmentsRes.data.assignments || []);
      setRoutes(routesRes.data.routes || []);
      setVehicles(vehiclesRes.data.vehicles || []);
    } catch (error: any) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data: AssignVehicleFormData) => {
    try {
      await transportApi.assignVehicleToRoute({
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        shift: data.shift || undefined,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: data.validTo ? new Date(data.validTo).toISOString() : undefined,
      });
      toast.success('Vehicle assigned to route successfully');
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign vehicle');
    }
  };
  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this assignment?')) return;
    try {
      await transportApi.deactivateRouteVehicle(id);
      toast.success('Assignment deactivated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate');
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    reset({
      routeId: '',
      vehicleId: '',
      shift: '',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '',
    });
  };
  const columns = [
    {
      key: 'route',
      label: 'Route',
      render: (_: any, row: RouteVehicleAssignment) => (
        <div className="flex items-center">
          <RouteIcon className="w-4 h-4 text-primary-400 mr-2" />
          <div>
            <p className="font-medium text-white">{row.route?.routeName}</p>
            <p className="text-xs text-navy-400">
              {row.route?.startPoint} → {row.route?.endPoint}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (_: any, row: RouteVehicleAssignment) => (
        <div className="flex items-center">
          <Bus className="w-4 h-4 text-emerald-400 mr-2" />
          <div>
            <p className="font-medium text-white">{row.vehicle?.vehicleNumber}</p>
            <p className="text-xs text-navy-400">{row.vehicle?.driverName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (value: string) => value || 'All',
    },
    {
      key: 'validFrom',
      label: 'Valid From',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'validTo',
      label: 'Valid To',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Ongoing',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${value ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-navy-500/20 text-navy-300 border border-navy-500/30'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: RouteVehicleAssignment) => (
        <button
          onClick={() => handleDeactivate(row.id)}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Deactivate"
        >
          <X className="w-4 h-4" />
        </button>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assign Vehicles to Routes</h1>
          <p className="text-navy-300 mt-1">Manage vehicle assignments for transport routes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Vehicle
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <div className="flex items-center">
            <div className="bg-primary-500/20 p-3 rounded-xl mr-4">
              <RouteIcon className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-navy-300">Total Routes</p>
              <p className="text-2xl font-bold text-white">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <div className="flex items-center">
            <div className="bg-emerald-500/20 p-3 rounded-xl mr-4">
              <Bus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-navy-300">Total Vehicles</p>
              <p className="text-2xl font-bold text-white">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
          <div className="flex items-center">
            <div className="bg-violet-500/20 p-3 rounded-xl mr-4">
              <Calendar className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-navy-300">Active Assignments</p>
              <p className="text-2xl font-bold text-white">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <Table columns={columns} data={assignments} isLoading={loading} />
      </div>
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Assign Vehicle to Route"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Route <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('routeId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id} className="bg-navy-800">
                  {route.routeName} ({route.startPoint} → {route.endPoint})
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="text-red-400 text-sm mt-2">{errors.routeId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Vehicle <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('vehicleId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id} className="bg-navy-800">
                  {vehicle.vehicleNumber} - {vehicle.driverName} ({vehicle.capacity || 'N/A'} seats)
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-red-400 text-sm mt-2">{errors.vehicleId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Shift
            </label>
            <select
              {...register('shift')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">All shifts</option>
              {SHIFTS.map((shift) => (
                <option key={shift.value} value={shift.value} className="bg-navy-800">
                  {shift.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              {...register('validFrom')}
              error={errors.validFrom?.message}
              required
            />
            <Input
              label="Valid To (Optional)"
              type="date"
              {...register('validTo')}
              error={errors.validTo?.message}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Assign Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AssignVehiclePage;
