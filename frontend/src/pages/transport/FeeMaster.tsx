// src/pages/transport/FeeMaster.tsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import { transportApi } from '../../services/transportApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { ACADEMIC_YEARS, CURRENT_ACADEMIC_YEAR } from '../../utils/constants';
import type { TransportFeeMaster, Route } from '../../types';

const feeMasterSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  zoneName: z.string().optional(),
  monthlyFee: z.number().positive('Fee must be greater than 0'),
  description: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
});

type FeeMasterFormData = z.infer<typeof feeMasterSchema>;

const FeeMasterPage: React.FC = () => {
  const [feeMasters, setFeeMasters] = useState<TransportFeeMaster[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<TransportFeeMaster | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FeeMasterFormData>({
    resolver: zodResolver(feeMasterSchema),
    defaultValues: {
      academicYear: CURRENT_ACADEMIC_YEAR,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, routesRes] = await Promise.all([
        transportApi.getFeeMasters({ isActive: true }),
        transportApi.getRoutes({ isActive: true }),
      ]);
      setFeeMasters(feesRes.data.feeMasters || []);
      setRoutes(routesRes.data.routes || []);
    } catch (error: any) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FeeMasterFormData) => {
    try {
      if (editingFee) {
        await transportApi.updateFeeMaster(editingFee.id, data);
        toast.success('Fee structure updated successfully');
      } else {
        await transportApi.createFeeMaster(data);
        toast.success('Fee structure created successfully');
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (fee: TransportFeeMaster) => {
    setEditingFee(fee);
    reset({
      routeId: fee.routeId || '',
      zoneName: fee.zoneName || '',
      monthlyFee: fee.monthlyFee,
      description: fee.description || '',
      academicYear: fee.academicYear,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this fee structure?')) return;

    try {
      await transportApi.deleteFeeMaster(id);
      toast.success('Fee structure deactivated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    reset({
      routeId: '',
      zoneName: '',
      monthlyFee: 0,
      description: '',
      academicYear: CURRENT_ACADEMIC_YEAR,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'route',
      label: 'Route',
      render: (_: any, row: TransportFeeMaster) =>
        row.route ? row.route.routeName : row.zoneName || 'N/A',
    },
    { key: 'zoneName', label: 'Zone' },
    {
      key: 'monthlyFee',
      label: 'Monthly Fee',
      render: (value: number) => (
        <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
      ),
    },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'description', label: 'Description' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: TransportFeeMaster) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Fee Master</h1>
          <p className="text-gray-600">Configure monthly transport fees by route</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">Important</h3>
            <p className="text-sm text-blue-700 mt-1">
              Fee structures defined here are automatically applied when students are assigned to transport routes.
              Each route should have exactly one active fee structure per academic year.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={feeMasters} isLoading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route <span className="text-red-500">*</span>
            </label>
            <select
              {...register('routeId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!!editingFee}
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName} ({route.startPoint} → {route.endPoint})
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="text-red-500 text-sm mt-1">{errors.routeId.message}</p>
            )}
          </div>

          <Input
            label="Zone Name (Optional)"
            {...register('zoneName')}
            error={errors.zoneName?.message}
            placeholder="e.g., Zone A, City Center"
          />

          <Input
            label="Monthly Fee"
            type="number"
            {...register('monthlyFee', { valueAsNumber: true })}
            error={errors.monthlyFee?.message}
            placeholder="Enter monthly fee amount"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              {...register('academicYear')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.academicYear && (
              <p className="text-red-500 text-sm mt-1">{errors.academicYear.message}</p>
            )}
          </div>

          <Input
            label="Description (Optional)"
            {...register('description')}
            error={errors.description?.message}
            placeholder="Additional notes about this fee structure"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingFee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeMasterPage;
