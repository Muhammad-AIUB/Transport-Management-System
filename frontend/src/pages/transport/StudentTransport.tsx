// src/pages/transport/StudentTransport.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import transportApi from '@/services/transportApi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import type { Student, Route, PickupPoint, StudentTransportAssignment } from '@/types';

// Validation Schema
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
  // States
  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [filteredPickupPoints, setFilteredPickupPoints] = useState<PickupPoint[]>([]);

  // Form
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

  // Fetch initial data
  useEffect(() => {
    fetchAssignments();
    fetchRoutes();
  }, []);

  // Fetch assignments
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

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      const response = await transportApi.getRoutes({ isActive: true });
      setRoutes(response.data.routes);
    } catch (error: any) {
      toast.error('Failed to fetch routes');
    }
  };

  // Search students
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

  // Fetch pickup points when route is selected
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

  // Submit form
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

  // Deactivate assignment
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

  // Table columns
  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium">{`${row.student.firstName} ${row.student.lastName}`}</div>
          <div className="text-sm text-gray-500">{row.student.admissionNumber}</div>
          <div className="text-sm text-gray-500">{`${row.student.class} ${row.student.section || ''}`}</div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium">{row.route.routeName}</div>
          <div className="text-sm text-gray-500">{row.route.routeCode}</div>
        </div>
      ),
    },
    {
      key: 'pickupPoint',
      label: 'Pickup Point',
      render: (_: any, row: StudentTransportAssignment) => (
        <div>
          <div className="font-medium">{row.pickupPoint.name}</div>
          <div className="text-sm text-gray-500">{row.pickupPoint.address}</div>
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
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
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
            className="text-red-600 hover:text-red-800"
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Transport</h1>
          <p className="text-gray-600">Assign students to transport routes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Student
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={assignments} isLoading={loading} />
      </div>

      {/* Assignment Modal */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Student <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type admission number or name..."
                value={searchQuery}
                onChange={(e) => handleStudentSearch(e.target.value)}
              />
            </div>
            
            {/* Student Dropdown */}
            {students.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setValue('studentId', student.id);
                      setSearchQuery(
                        `${student.firstName} ${student.lastName} (${student.admissionNumber})`
                      );
                      setStudents([]);
                    }}
                  >
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.admissionNumber} | {student.class} {student.section}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
            )}
          </div>

          {/* Route Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route <span className="text-red-500">*</span>
            </label>
            <select
              {...register('routeId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName} ({route.routeCode})
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="mt-1 text-sm text-red-600">{errors.routeId.message}</p>
            )}
          </div>

          {/* Pickup Point Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Point <span className="text-red-500">*</span>
            </label>
            <select
              {...register('pickupPointId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedRouteId}
            >
              <option value="">Select Pickup Point</option>
              {filteredPickupPoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name} - {point.address}
                </option>
              ))}
            </select>
            {errors.pickupPointId && (
              <p className="mt-1 text-sm text-red-600">{errors.pickupPointId.message}</p>
            )}
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <select
              {...register('shift')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Both</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              {...register('validFrom')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> When you assign a student to transport, the system will
              automatically:
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Calculate the monthly transport fee based on the selected route</li>
              <li>Generate a fee entry for the current month in the student's billing</li>
              <li>Set the due date to the 15th of the current month</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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