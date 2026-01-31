
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

    const nextOrder = routePickupPoints.length > 0
      ? Math.max(...routePickupPoints.map(rp => rp.sequenceOrder)) + 1
      : 1;
    setValue('sequenceOrder', nextOrder);
    setIsModalOpen(true);
  };

  const availablePickupPoints = pickupPoints.filter(
    pp => !routePickupPoints.some(rpp => rpp.pickupPointId === pp.id)
  );
  const selectedRouteData = routes.find(r => r.id === selectedRoute);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Route Pickup Points</h1>
        <p className="text-navy-300 mt-1">Assign and order pickup points for each route</p>
      </div>
      {/* Route Selection Card */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
        <label className="block text-sm font-medium text-navy-200 mb-2">
          Select Route
        </label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full md:w-96 px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
        >
          <option value="" className="bg-navy-800">-- Select a route --</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id} className="bg-navy-800">
              {route.routeName} ({route.startPoint} → {route.endPoint})
            </option>
          ))}
        </select>
      </div>
      {/* Route Pickup Points Card */}
      {selectedRoute && (
        <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
          {/* Route Info Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center">
                <div className="bg-primary-500/20 p-3 rounded-xl mr-4">
                  <RouteIcon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedRouteData?.routeName}
                  </h2>
                  <p className="text-navy-300">
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
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-500/20"></div>
                  <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
                </div>
                <p className="mt-4 text-sm text-navy-400">Loading...</p>
              </div>
            ) : routePickupPoints.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-navy-700/50 w-fit mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-navy-500" />
                </div>
                <p className="text-navy-300 font-medium">No pickup points assigned to this route yet.</p>
                <p className="text-sm text-navy-500 mt-1">
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
                      className="flex items-center justify-between p-4 bg-navy-900/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold mr-4 text-sm shadow-lg">
                          {rpp.sequenceOrder}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {rpp.pickupPoint.name}
                          </p>
                          <p className="text-sm text-navy-400">
                            {rpp.pickupPoint.address}
                          </p>
                          {rpp.estimatedTime && (
                            <p className="text-xs text-navy-500 mt-1">
                              Est. time: {rpp.estimatedTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            onClick={() => handleUpdateSequence(rpp.id, rpp.sequenceOrder - 1)}
                            className="p-2 text-navy-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < routePickupPoints.length - 1 && (
                          <button
                            onClick={() => handleUpdateSequence(rpp.id, rpp.sequenceOrder + 1)}
                            className="p-2 text-navy-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(rpp.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
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
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Pickup Point to Route"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Pickup Point <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('pickupPointId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">Select pickup point</option>
              {availablePickupPoints.map((pp) => (
                <option key={pp.id} value={pp.id} className="bg-navy-800">
                  {pp.name} - {pp.address}
                </option>
              ))}
            </select>
            {errors.pickupPointId && (
              <p className="text-red-400 text-sm mt-2">{errors.pickupPointId.message}</p>
            )}
            {availablePickupPoints.length === 0 && (
              <p className="text-amber-400 text-sm mt-2">
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
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
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
