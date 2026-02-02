import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import transportApi from '@/services/transportApi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import type { Student } from '@/types';

const studentSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  class: z.string().min(1, 'Class is required'),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search?: string) => {
    try {
      setLoading(true);
      const response = await transportApi.getStudents({ page: 1, limit: 100, search });
      setStudents(response.data.students);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    reset({
      admissionNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      rollNumber: '',
      parentName: '',
      parentPhone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    reset({
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phone: student.phone || '',
      class: student.class,
      section: student.section || '',
      rollNumber: student.rollNumber || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        await transportApi.updateStudent(editingStudent.id, data);
        toast.success('Student updated successfully');
      } else {
        await transportApi.createStudent(data);
        toast.success('Student created successfully');
      }
      setIsModalOpen(false);
      reset();
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await transportApi.deleteStudent(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const columns = [
    {
      key: 'admissionNumber',
      label: 'Admission No',
      render: (value: string) => <span className="font-mono text-primary-400">{value}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      render: (_: any, row: Student) => (
        <div>
          <div className="font-medium text-white">{row.firstName} {row.lastName}</div>
          {row.email && <div className="text-sm text-navy-400">{row.email}</div>}
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (_: any, row: Student) => (
        <span className="text-white">{row.class} {row.section && `- ${row.section}`}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => value || '-',
    },
    {
      key: 'parentName',
      label: 'Parent',
      render: (_: any, row: Student) => (
        <div>
          <div className="text-white">{row.parentName || '-'}</div>
          {row.parentPhone && <div className="text-sm text-navy-400">{row.parentPhone}</div>}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          value
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Student) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Students</h1>
          <p className="text-navy-300 mt-1">Manage student records</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search by name, admission number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-navy-800/50 border border-white/10 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <Table columns={columns} data={students} isLoading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admission Number"
              {...register('admissionNumber')}
              error={errors.admissionNumber?.message}
              placeholder="e.g., STD001"
              required
            />
            <Input
              label="Roll Number"
              {...register('rollNumber')}
              error={errors.rollNumber?.message}
              placeholder="e.g., 01"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
              placeholder="e.g., Muhammad"
              required
            />
            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
              placeholder="e.g., Ali"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Class"
              {...register('class')}
              error={errors.class?.message}
              placeholder="e.g., Class 10"
              required
            />
            <Input
              label="Section"
              {...register('section')}
              error={errors.section?.message}
              placeholder="e.g., A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="e.g., student@example.com"
            />
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="e.g., 01712345678"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Parent Name"
              {...register('parentName')}
              error={errors.parentName?.message}
              placeholder="e.g., Mr. Ali"
            />
            <Input
              label="Parent Phone"
              {...register('parentPhone')}
              error={errors.parentPhone?.message}
              placeholder="e.g., 01812345678"
            />
          </div>

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="e.g., House 10, Road 5, Dhanmondi, Dhaka"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingStudent ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentPage;
