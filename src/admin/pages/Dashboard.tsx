import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  ShoppingCart,
  Package,
  FileText,
  MapPin,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalPlans: number;
  totalPosts: number;
  totalZones: number;
  recentOrders: any[];
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadStats();
    }
  }, [apiKey]);

  const loadStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(t('dashboard.title'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const statCards = [
    {
      title: t('dashboard.totalOrders'),
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/admin/orders',
    },
    {
      title: t('dashboard.pendingOrders'),
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-orange-500',
      link: '/admin/orders?status=pending',
    },
    {
      title: t('dashboard.activePlans'),
      value: stats?.totalPlans || 0,
      icon: Package,
      color: 'bg-green-500',
      link: '/admin/plans',
    },
    {
      title: t('dashboard.publishedPosts'),
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/admin/posts',
    },
    {
      title: t('dashboard.coverageZones'),
      value: stats?.totalZones || 0,
      icon: MapPin,
      color: 'bg-pink-500',
      link: '/admin/zones',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-slate-400 mt-1">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.link}
              to={stat.link}
              className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <TrendingUp
                  size={16}
                  className="text-slate-500 group-hover:text-green-400 transition-colors"
                />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.title}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.recentOrders')}</h2>
          <Link to="/admin/orders" className="text-sm text-blue-400 hover:text-blue-300">
            {t('dashboard.viewAll')} →
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium text-start">{t('dashboard.reference')}</th>
                  <th className="pb-3 font-medium text-start">{t('dashboard.customer')}</th>
                  <th className="pb-3 font-medium text-start">{t('dashboard.status')}</th>
                  <th className="pb-3 font-medium text-start">{t('dashboard.date')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-700/50">
                    <td className="py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {order.reference_number || order.referenceNumber || `#${order.id}`}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-300">
                      {order.full_name || order.fullName}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : order.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('dashboard.noOrders')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
