// src/pages/transport/PickupPoint.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { transportApi } from '../../services/transportApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import type { PickupPoint } from '../../types';

const pickupPointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  landmark: z.string().optional(),
  latitude: z.number().optional().or(z.literal('')),
  longitude: z.number().optional().or(z.literal('')),
});

type PickupPointFormData = z.infer<typeof pickupPointSchema>;

const PickupPointPage: React.FC = () => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PickupPointFormData>({
    resolver: zodResolver(pickupPointSchema),
  });

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const fetchPickupPoints = async () => {
    try {
      setLoading(true);
      const response = await transportApi.getPickupPoints({ isActive: true });
      setPickupPoints(response.data.pickupPoints || []);
    } catch (error: any) {
      toast.error('Failed to fetch pickup points');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PickupPointFormData) => {
    try {
      const payload = {
        ...data,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
      };

      if (editingPoint) {
        await transportApi.updatePickupPoint(editingPoint.id, payload);
        toast.success('Pickup point updated successfully');
      } else {
        await transportApi.createPickupPoint(payload);
        toast.success('Pickup point created successfully');
      }
      closeModal();
      fetchPickupPoints();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (point: PickupPoint) => {
    setEditingPoint(point);
    reset(point);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this pickup point?')) return;

    try {
      await transportApi.deletePickupPoint(id);
      toast.success('Pickup point deactivated successfully');
      fetchPickupPoints();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete pickup point');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPoint(null);
    reset({});
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          {value}
        </div>
      ),
    },
    { key: 'address', label: 'Address' },
    { key: 'landmark', label: 'Landmark' },
    {
      key: 'coordinates',
      label: 'Coordinates',
      render: (_: any, row: PickupPoint) =>
        row.latitude && row.longitude
          ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
          : 'Not set',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: PickupPoint) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Pickup Points</h1>
          <p className="text-gray-600">Manage transport pickup/drop locations</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Pickup Point
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={pickupPoints} isLoading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPoint ? 'Edit Pickup Point' : 'Add Pickup Point'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Main Gate, Bus Stand"
            required
          />

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Full address"
            required
          />

          <Input
            label="Landmark"
            {...register('landmark')}
            error={errors.landmark?.message}
            placeholder="Nearby landmark (optional)"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              error={errors.latitude?.message}
              placeholder="e.g., 12.9716"
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              error={errors.longitude?.message}
              placeholder="e.g., 77.5946"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingPoint ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PickupPointPage;
