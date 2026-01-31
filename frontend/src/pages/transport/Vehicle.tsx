
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { transportApi } from '../../services/transportApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { VEHICLE_TYPES } from '../../utils/constants';
import type { Vehicle } from '../../types';
const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  vehicleType: z.string().optional(),
  capacity: z.number().positive('Capacity must be positive').optional().or(z.literal('')),
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().min(10, 'Valid phone number required'),
  driverLicense: z.string().optional(),
  helperName: z.string().optional(),
  helperPhone: z.string().optional(),
  registrationNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  fitnessExpiry: z.string().optional(),
});
type VehicleFormData = z.infer<typeof vehicleSchema>;
const VehiclePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });
  useEffect(() => {
    fetchVehicles();
  }, []);
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await transportApi.getVehicles({ isActive: true });
      setVehicles(response.data.vehicles || []);
    } catch (error: any) {
      toast.error('Failed to fetch vehicles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data: VehicleFormData) => {
    try {
      const payload = {
        ...data,
        capacity: data.capacity ? Number(data.capacity) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry).toISOString() : undefined,
        fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry).toISOString() : undefined,
      };
      if (editingVehicle) {
        await transportApi.updateVehicle(editingVehicle.id, payload);
        toast.success('Vehicle updated successfully');
      } else {
        await transportApi.createVehicle(payload);
        toast.success('Vehicle created successfully');
      }
      closeModal();
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    reset({
      ...vehicle,
      insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
      fitnessExpiry: vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this vehicle?')) return;
    try {
      await transportApi.deleteVehicle(id);
      toast.success('Vehicle deactivated successfully');
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    reset({});
  };
  const columns = [
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'vehicleType', label: 'Type' },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value: number) => value ? `${value} seats` : 'N/A',
    },
    { key: 'driverName', label: 'Driver' },
    { key: 'driverPhone', label: 'Driver Phone' },
    { key: 'helperName', label: 'Helper' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Vehicle) => (
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicles</h1>
          <p className="text-navy-300 mt-1">Manage transport vehicles and drivers</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <Table columns={columns} data={vehicles} isLoading={loading} />
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vehicle Number"
              {...register('vehicleNumber')}
              error={errors.vehicleNumber?.message}
              placeholder="e.g., KA-01-AB-1234"
              required
            />
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">
                Vehicle Type
              </label>
              <select
                {...register('vehicleType')}
                className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
              >
                <option value="" className="bg-navy-800">Select type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-navy-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Seating Capacity"
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              error={errors.capacity?.message}
              placeholder="e.g., 40"
            />
            <Input
              label="Registration Number"
              {...register('registrationNumber')}
              error={errors.registrationNumber?.message}
            />
          </div>

          {/* Section Divider */}
          <div className="border-t border-white/5 pt-6">
            <h4 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
              Driver Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Driver Name"
                {...register('driverName')}
                error={errors.driverName?.message}
                required
              />
              <Input
                label="Driver Phone"
                {...register('driverPhone')}
                error={errors.driverPhone?.message}
                placeholder="10-digit phone number"
                required
              />
              <Input
                label="Driver License"
                {...register('driverLicense')}
                error={errors.driverLicense?.message}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t border-white/5 pt-6">
            <h4 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
              Helper Information
              <span className="ml-2 text-xs text-navy-400 font-normal">(Optional)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Helper Name"
                {...register('helperName')}
                error={errors.helperName?.message}
              />
              <Input
                label="Helper Phone"
                {...register('helperPhone')}
                error={errors.helperPhone?.message}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t border-white/5 pt-6">
            <h4 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
              Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Insurance Expiry"
                type="date"
                {...register('insuranceExpiry')}
                error={errors.insuranceExpiry?.message}
              />
              <Input
                label="Fitness Expiry"
                type="date"
                {...register('fitnessExpiry')}
                error={errors.fitnessExpiry?.message}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default VehiclePage;
