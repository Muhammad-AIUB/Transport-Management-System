// src/pages/transport/Vehicle.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Bus } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600">Manage transport vehicles and drivers</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={vehicles} isLoading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vehicle Number"
              {...register('vehicleNumber')}
              error={errors.vehicleNumber?.message}
              placeholder="e.g., KA-01-AB-1234"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                {...register('vehicleType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
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

          <hr className="my-4" />
          <h4 className="font-medium text-gray-900">Driver Information</h4>

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

          <hr className="my-4" />
          <h4 className="font-medium text-gray-900">Helper Information (Optional)</h4>

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

          <hr className="my-4" />
          <h4 className="font-medium text-gray-900">Documents</h4>

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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingVehicle ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehiclePage;
