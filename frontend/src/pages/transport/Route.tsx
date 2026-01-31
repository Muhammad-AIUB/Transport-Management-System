import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2 } from 'lucide-react';
import transportApi from '@/services/transportApi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import type { Route } from '@/types';
const routeSchema = z.object({
  routeName: z.string().min(1, 'Route name is required'),
  routeCode: z.string().optional(),
  startPoint: z.string().min(1, 'Start point is required'),
  endPoint: z.string().min(1, 'End point is required'),
  distance: z.number().positive().optional(),
  estimatedDuration: z.number().positive().optional(),
});
type RouteFormData = z.infer<typeof routeSchema>;
const RoutePage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
  });
  useEffect(() => {
    fetchRoutes();
  }, []);
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await transportApi.getRoutes({ isActive: true });
      setRoutes(response.data.routes);
    } catch (error: any) {
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data: RouteFormData) => {
    try {
      if (editingRoute) {
        await transportApi.updateRoute(editingRoute.id, data);
        toast.success('Route updated successfully');
      } else {
        await transportApi.createRoute(data);
        toast.success('Route created successfully');
      }
      setIsModalOpen(false);
      reset();
      setEditingRoute(null);
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    reset(route);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await transportApi.deleteRoute(id);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };
  const columns = [
    { key: 'routeName', label: 'Route Name' },
    { key: 'routeCode', label: 'Code' },
    { key: 'startPoint', label: 'Start Point' },
    { key: 'endPoint', label: 'End Point' },
    {
      key: 'distance',
      label: 'Distance',
      render: (value: number) => value ? `${value} km` : 'N/A',
    },
    {
      key: 'estimatedDuration',
      label: 'Duration',
      render: (value: number) => value ? `${value} min` : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Route) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Routes</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={routes} isLoading={loading} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setEditingRoute(null);
        }}
        title={editingRoute ? 'Edit Route' : 'Add Route'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Route Name"
            {...register('routeName')}
            error={errors.routeName?.message}
            required
          />
          <Input
            label="Route Code"
            {...register('routeCode')}
            error={errors.routeCode?.message}
          />
          <Input
            label="Start Point"
            {...register('startPoint')}
            error={errors.startPoint?.message}
            required
          />
          <Input
            label="End Point"
            {...register('endPoint')}
            error={errors.endPoint?.message}
            required
          />
          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            {...register('distance', { valueAsNumber: true })}
            error={errors.distance?.message}
          />
          <Input
            label="Estimated Duration (minutes)"
            type="number"
            {...register('estimatedDuration', { valueAsNumber: true })}
            error={errors.estimatedDuration?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingRoute ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default RoutePage;
