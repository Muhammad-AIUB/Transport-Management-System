// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Route, MapPin, Users, DollarSign, TrendingUp } from 'lucide-react';
import { transportApi } from '../services/transportApi';
import { ROUTES } from '../utils/constants';

interface Stats {
  totalRoutes: number;
  totalVehicles: number;
  totalPickupPoints: number;
  totalStudentAssignments: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalRoutes: 0,
    totalVehicles: 0,
    totalPickupPoints: 0,
    totalStudentAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [routesRes, vehiclesRes, pickupRes, assignmentsRes] = await Promise.all([
          transportApi.getRoutes({ limit: 1 }),
          transportApi.getVehicles({ limit: 1 }),
          transportApi.getPickupPoints({ limit: 1 }),
          transportApi.getStudentTransportAssignments({ limit: 1 }),
        ]);

        setStats({
          totalRoutes: routesRes.data.pagination?.total || 0,
          totalVehicles: vehiclesRes.data.pagination?.total || 0,
          totalPickupPoints: pickupRes.data.pagination?.total || 0,
          totalStudentAssignments: assignmentsRes.data.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Routes',
      value: stats.totalRoutes,
      icon: Route,
      color: 'bg-blue-500',
      link: ROUTES.TRANSPORT.ROUTES,
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Bus,
      color: 'bg-green-500',
      link: ROUTES.TRANSPORT.VEHICLES,
    },
    {
      title: 'Pickup Points',
      value: stats.totalPickupPoints,
      icon: MapPin,
      color: 'bg-yellow-500',
      link: ROUTES.TRANSPORT.PICKUP_POINTS,
    },
    {
      title: 'Student Assignments',
      value: stats.totalStudentAssignments,
      icon: Users,
      color: 'bg-purple-500',
      link: ROUTES.TRANSPORT.STUDENT_TRANSPORT,
    },
  ];

  const quickLinks = [
    {
      title: 'Assign Student',
      description: 'Assign a student to a transport route',
      icon: Users,
      link: ROUTES.TRANSPORT.STUDENT_TRANSPORT,
    },
    {
      title: 'Manage Fee Structure',
      description: 'Configure transport fees for routes',
      icon: DollarSign,
      link: ROUTES.TRANSPORT.FEE_MASTER,
    },
    {
      title: 'Configure Routes',
      description: 'Add pickup points to routes',
      icon: Route,
      link: ROUTES.TRANSPORT.ROUTE_PICKUP_POINTS,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Transport Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.link}
              className="flex items-start p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                <link.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-900">Getting Started</h3>
            <p className="text-sm text-blue-700 mt-1">
              Start by setting up your routes and vehicles, then configure pickup points and fee structure.
              Once everything is set up, you can assign students to transport routes and fees will be
              automatically generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
