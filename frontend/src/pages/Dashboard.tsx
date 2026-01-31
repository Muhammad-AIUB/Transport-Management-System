
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Route, MapPin, Users, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
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
      gradient: 'from-primary-500 to-primary-600',
      bgGlow: 'bg-primary-500/20',
      link: ROUTES.TRANSPORT.ROUTES,
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Bus,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/20',
      link: ROUTES.TRANSPORT.VEHICLES,
    },
    {
      title: 'Pickup Points',
      value: stats.totalPickupPoints,
      icon: MapPin,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/20',
      link: ROUTES.TRANSPORT.PICKUP_POINTS,
    },
    {
      title: 'Student Assignments',
      value: stats.totalStudentAssignments,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20',
      link: ROUTES.TRANSPORT.STUDENT_TRANSPORT,
    },
  ];
  const quickLinks = [
    {
      title: 'Assign Student',
      description: 'Assign a student to a transport route',
      icon: Users,
      link: ROUTES.TRANSPORT.STUDENT_TRANSPORT,
      color: 'primary',
    },
    {
      title: 'Manage Fee Structure',
      description: 'Configure transport fees for routes',
      icon: DollarSign,
      link: ROUTES.TRANSPORT.FEE_MASTER,
      color: 'emerald',
    },
    {
      title: 'Configure Routes',
      description: 'Add pickup points to routes',
      icon: Route,
      link: ROUTES.TRANSPORT.ROUTE_PICKUP_POINTS,
      color: 'violet',
    },
  ];
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-navy-300 mt-1">Welcome to the Transport Management System</p>
        </div>
        <div className="text-sm text-navy-400">
          Last updated: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="group relative bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all duration-300 hover:shadow-glass-lg overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 ${stat.bgGlow} rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`} />
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-navy-300">{stat.title}</p>
                <p className="text-4xl font-bold text-white mt-2 tracking-tight">
                  {loading ? (
                    <span className="inline-block w-16 h-10 bg-navy-700/50 rounded-lg animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`bg-linear-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Link indicator */}
            <div className="mt-4 flex items-center text-sm text-navy-400 group-hover:text-primary-400 transition-colors">
              <span>View details</span>
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <span className="text-xs text-navy-400 uppercase tracking-wider">Shortcuts</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.link}
              className="group flex items-start p-5 bg-navy-900/50 border border-white/5 rounded-xl hover:border-primary-500/30 hover:bg-navy-800/50 transition-all duration-200"
            >
              <div className="bg-primary-500/10 p-3 rounded-xl mr-4 group-hover:bg-primary-500/20 transition-colors">
                <link.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{link.title}</h3>
                <p className="text-sm text-navy-400 mt-1">{link.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-navy-500 group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Card */}
      <div className="relative bg-linear-to-r from-primary-500/10 to-violet-500/10 border border-primary-500/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start">
          <div className="bg-primary-500/20 p-3 rounded-xl mr-4">
            <Sparkles className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg">Getting Started</h3>
            <p className="text-navy-300 mt-2 leading-relaxed">
              Start by setting up your routes and vehicles, then configure pickup points and fee structure.
              Once everything is set up, you can assign students to transport routes and fees will be
              automatically generated.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link 
                to={ROUTES.TRANSPORT.ROUTES}
                className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
              >
                <Route className="w-4 h-4 mr-2" />
                Setup Routes
              </Link>
              <Link 
                to={ROUTES.TRANSPORT.VEHICLES}
                className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
              >
                <Bus className="w-4 h-4 mr-2" />
                Add Vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
