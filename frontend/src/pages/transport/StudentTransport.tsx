
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Search, Plus, X } from 'lucide-react';
import transportApi from '@/services/transportApi';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import type { Student, Route, PickupPoint, StudentTransportAssignment } from '@/types';

const assignmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  routeId: z.string().min(1, 'Route is required'),
  pickupPointId: z.string().min(1, 'Pickup point is required'),
  shift: z.string().optional(),
  validFrom: z.string().optional(),
  remarks: z.string().optional(),
});
type AssignmentFormData = z.infer<typeof assignmentSchema>;
const StudentTransportPage: React.FC = () => {

  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredPickupPoints, setFilteredPickupPoints] = useState<PickupPoint[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });
  const selectedRouteId = watch('routeId');

  useEffect(() => {
    fetchAssignments();
    fetchRoutes();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await transportApi.getStudentTransportAssignments({
        page: 1,
        limit: 100,
      });
      setAssignments(response.data.assignments);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await transportApi.getRoutes({ isActive: true });
      setRoutes(response.data.routes);
    } catch (error: any) {
      toast.error('Failed to fetch routes');
    }
  };

  const handleStudentSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setStudents([]);
      return;
    }
    try {
      const response = await transportApi.searchStudents(query);
      setStudents(response.data);
    } catch (error: any) {
      toast.error('Failed to search students');
    }
  };

  useEffect(() => {
    if (selectedRouteId) {
      fetchRoutePickupPoints(selectedRouteId);
    } else {
      setFilteredPickupPoints([]);
    }
  }, [selectedRouteId]);
  const fetchRoutePickupPoints = async (routeId: string) => {
    try {
      const response = await transportApi.getRoutePickupPoints(routeId);
      const points = response.data.map((rpp: any) => rpp.pickupPoint);
      setFilteredPickupPoints(points);
    } catch (error: any) {
      toast.error('Failed to fetch pickup points');
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      await transportApi.assignStudentToTransport(data);
      toast.success('✅ Student assigned successfully! Fee automatically generated.');
      setIsModalOpen(false);
      reset();
      setStudents([]);
      setSearchQuery('');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign student');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this assignment?')) {
      return;
    }
    try {
      await transportApi.deactivateStudentTransport(id);
      toast.success('Assignment deactivated successfully');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate');
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium text-white">{`${row.student.firstName} ${row.student.lastName}`}</div>
          <div className="text-sm text-navy-400">{row.student.admissionNumber}</div>
          <div className="text-sm text-navy-400">{`${row.student.class} ${row.student.section || ''}`}</div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium text-white">{row.route.routeName}</div>
          <div className="text-sm text-navy-400">{row.route.routeCode}</div>
        </div>
      ),
    },
    {
      key: 'pickupPoint',
      label: 'Pickup Point',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium text-white">{row.pickupPoint.name}</div>
          <div className="text-sm text-navy-400">{row.pickupPoint.address}</div>
        </div>
      ),
    },
    {
      key: 'monthlyFee',
      label: 'Monthly Fee',
      render: (value: number) => `৳${value.toFixed(2)}`,
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (value: string) => value || 'Both',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            value === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: StudentTransportAssignment) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeactivate(row.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Deactivate"
            disabled={row.status !== 'ACTIVE'}
          >
            <X className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Transport</h1>
          <p className="text-navy-300 mt-1">Assign students to transport routes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Student
        </Button>
      </div>
      {/* Table */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <Table columns={columns} data={assignments} isLoading={loading} />
      </div>
      {}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setStudents([]);
          setSearchQuery('');
        }}
        title="Assign Student to Transport"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student Search */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Search Student <span className="text-primary-400">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-navy-400" />
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                placeholder="Type admission number or name..."
                value={searchQuery}
                onChange={(e) => handleStudentSearch(e.target.value)}
              />
            </div>
            {/* Student dropdown */}
            {students.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-xl">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
                    onClick={() => {
                      setValue('studentId', student.id);
                      setSearchQuery(
                        `${student.firstName} ${student.lastName} (${student.admissionNumber})`
                      );
                      setStudents([]);
                    }}
                  >
                    <div className="font-medium text-white">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-navy-400">
                      {student.admissionNumber} | {student.class} {student.section}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errors.studentId && (
              <p className="mt-2 text-sm text-red-400">{errors.studentId.message}</p>
            )}
          </div>
          {/* Route Select */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Route <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('routeId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id} className="bg-navy-800">
                  {route.routeName} ({route.routeCode})
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="mt-2 text-sm text-red-400">{errors.routeId.message}</p>
            )}
          </div>
          {/* Pickup Point Select */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Pickup Point <span className="text-primary-400">*</span>
            </label>
            <select
              {...register('pickupPointId')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedRouteId}
            >
              <option value="" className="bg-navy-800">Select Pickup Point</option>
              {filteredPickupPoints.map((point) => (
                <option key={point.id} value={point.id} className="bg-navy-800">
                  {point.name} - {point.address}
                </option>
              ))}
            </select>
            {errors.pickupPointId && (
              <p className="mt-2 text-sm text-red-400">{errors.pickupPointId.message}</p>
            )}
          </div>
          {/* Shift Select */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Shift
            </label>
            <select
              {...register('shift')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            >
              <option value="" className="bg-navy-800">Both</option>
              <option value="Morning" className="bg-navy-800">Morning</option>
              <option value="Evening" className="bg-navy-800">Evening</option>
            </select>
          </div>
          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Valid From
            </label>
            <input
              type="date"
              {...register('validFrom')}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            />
          </div>
          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-2">
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              className="w-full px-4 py-3 bg-navy-800/50 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
              placeholder="Optional notes..."
            />
          </div>
          {/* Info Card */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
            <p className="text-sm text-white">
              <strong>Note:</strong> When you assign a student to transport, the system will
              automatically:
            </p>
            <ul className="mt-2 text-sm text-navy-300 list-disc list-inside space-y-1">
              <li>Calculate the monthly transport fee based on the selected route</li>
              <li>Generate a fee entry for the current month in the student's billing</li>
              <li>Set the due date to the 15th of the current month</li>
            </ul>
          </div>
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Assign Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StudentTransportPage;
