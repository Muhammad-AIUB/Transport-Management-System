
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
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
        <span className="font-semibold text-emerald-400">{formatCurrency(value)}</span>
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
            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transport Fee Master</h1>
          <p className="text-navy-300 mt-1">Configure monthly transport fees by route</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>
      {/* Info Card */}
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-white">Important</h3>
            <p className="text-sm text-navy-300 mt-1">
              Fee structures defined here are automatically applied when students are assigned to transport routes.
              Each route should have exactly one active fee structure per academic year.
            </p>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <Table columns={columns} data={feeMasters} isLoading={loading} />
      </div>
      {}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Route <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('routeId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!editingFee}
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
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Academic Year <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('academicYear')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year} className="bg-navy-800">
                  {year}
                </option>
              ))}
            </select>
            {errors.academicYear && (
              <p className="text-red-400 text-sm mt-2">{errors.academicYear.message}</p>
            )}
          </div>
          <Input
            label="Description (Optional)"
            {...register('description')}
            error={errors.description?.message}
            placeholder="Additional notes about this fee structure"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingFee ? 'Update Fee' : 'Create Fee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default FeeMasterPage;
