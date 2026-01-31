// src/pages/transport/RoutePickupPoint.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, ArrowUp, ArrowDown, MapPin, Route as RouteIcon } from 'lucide-react';
import { transportApi } from '../../services/transportApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import type { Route, PickupPoint, RoutePickupPoint } from '../../types';

const addPickupSchema = z.object({
  pickupPointId: z.string().min(1, 'Pickup point is required'),
  sequenceOrder: z.number().min(1, 'Sequence order must be at least 1'),
  estimatedTime: z.string().optional(),
});

type AddPickupFormData = z.infer<typeof addPickupSchema>;

const RoutePickupPointPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [routePickupPoints, setRoutePickupPoints] = useState<RoutePickupPoint[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddPickupFormData>({
    resolver: zodResolver(addPickupSchema),
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      fetchRoutePickupPoints(selectedRoute);
    } else {
      setRoutePickupPoints([]);
    }
  }, [selectedRoute]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [routesRes, pickupRes] = await Promise.all([
        transportApi.getRoutes({ isActive: true, limit: 100 }),
        transportApi.getPickupPoints({ isActive: true, limit: 100 }),
      ]);
      setRoutes(routesRes.data.routes || []);
      setPickupPoints(pickupRes.data.pickupPoints || []);
    } catch (error: any) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutePickupPoints = async (routeId: string) => {
    try {
      setLoading(true);
      const response = await transportApi.getRoutePickupPoints(routeId);
      setRoutePickupPoints(response.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch route pickup points');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddPickupFormData) => {
    if (!selectedRoute) {
      toast.error('Please select a route first');
      return;
    }

    try {
      await transportApi.addPickupPointToRoute({
        routeId: selectedRoute,
        pickupPointId: data.pickupPointId,
        sequenceOrder: data.sequenceOrder,
        estimatedTime: data.estimatedTime,
      });
      toast.success('Pickup point added to route');
      closeModal();
      fetchRoutePickupPoints(selectedRoute);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add pickup point');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this pickup point from the route?')) return;

    try {
      await transportApi.removePickupPointFromRoute(id);
      toast.success('Pickup point removed from route');
      fetchRoutePickupPoints(selectedRoute);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove pickup point');
    }
  };

  const handleUpdateSequence = async (id: string, newOrder: number) => {
    try {
      await transportApi.updateRoutePickupPoint(id, { sequenceOrder: newOrder });
      fetchRoutePickupPoints(selectedRoute);
    } catch (error: any) {
      toast.error('Failed to update sequence');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset({});
  };

  const openModal = () => {
    // Set next sequence order
    const nextOrder = routePickupPoints.length > 0 
      ? Math.max(...routePickupPoints.map(rp => rp.sequenceOrder)) + 1 
      : 1;
    setValue('sequenceOrder', nextOrder);
    setIsModalOpen(true);
  };

  // Get pickup points not already assigned to the selected route
  const availablePickupPoints = pickupPoints.filter(
    pp => !routePickupPoints.some(rpp => rpp.pickupPointId === pp.id)
  );

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Route Pickup Points</h1>
        <p className="text-gray-600">Assign and order pickup points for each route</p>
      </div>

      {/* Route Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Route
        </label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a route --</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.routeName} ({route.startPoint} → {route.endPoint})
            </option>
          ))}
        </select>
      </div>

      {/* Route Details & Pickup Points */}
      {selectedRoute && (
        <div className="bg-white rounded-lg shadow">
          {/* Route Info Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <RouteIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedRouteData?.routeName}
                  </h2>
                  <p className="text-gray-600">
                    {selectedRouteData?.startPoint} → {selectedRouteData?.endPoint}
                  </p>
                </div>
              </div>
              <Button onClick={openModal} disabled={availablePickupPoints.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pickup Point
              </Button>
            </div>
          </div>

          {/* Pickup Points List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : routePickupPoints.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pickup points assigned to this route yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Pickup Point" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {routePickupPoints
                  .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                  .map((rpp, index) => (
                    <div
                      key={rpp.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                          {rpp.sequenceOrder}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {rpp.pickupPoint.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {rpp.pickupPoint.address}
                          </p>
                          {rpp.estimatedTime && (
                            <p className="text-xs text-gray-400 mt-1">
                              Est. time: {rpp.estimatedTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => handleUpdateSequence(rpp.id, rpp.sequenceOrder - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < routePickupPoints.length - 1 && (
                          <button
                            onClick={() => handleUpdateSequence(rpp.id, rpp.sequenceOrder + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(rpp.id)}
                          className="p-1 text-red-400 hover:text-red-600 ml-2"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Pickup Point Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Pickup Point to Route"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Point <span className="text-red-500">*</span>
            </label>
            <select
              {...register('pickupPointId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select pickup point</option>
              {availablePickupPoints.map((pp) => (
                <option key={pp.id} value={pp.id}>
                  {pp.name} - {pp.address}
                </option>
              ))}
            </select>
            {errors.pickupPointId && (
              <p className="text-red-500 text-sm mt-1">{errors.pickupPointId.message}</p>
            )}
            {availablePickupPoints.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                All pickup points are already assigned to this route.
              </p>
            )}
          </div>

          <Input
            label="Stop Order"
            type="number"
            min={1}
            {...register('sequenceOrder', { valueAsNumber: true })}
            error={errors.sequenceOrder?.message}
            required
          />

          <Input
            label="Estimated Time (Optional)"
            {...register('estimatedTime')}
            error={errors.estimatedTime?.message}
            placeholder="e.g., 8:00 AM"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add to Route
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoutePickupPointPage;
