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
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalPlans: number;
  totalPosts: number;
  totalZones: number;
  recentOrders: any[];
}

type DateRange = '7d' | '30d' | '90d' | 'custom';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    if (dateRange === '7d') start.setDate(end.getDate() - 7);
    else if (dateRange === '30d') start.setDate(end.getDate() - 30);
    else if (dateRange === '90d') start.setDate(end.getDate() - 90);
    else if (dateRange === 'custom' && startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    return { start, end };
  };

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

      {/* Order Status Charts */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (() => {
        // Compute order status data from all orders
        const statusCounts: Record<string, number> = {};
        const allOrders = stats.recentOrders || [];
        allOrders.forEach((o: any) => {
          const s = o.status || 'unknown';
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
        const statusLabels: Record<string, string> = {
          pending: t('orders.pending'),
          processing: t('orders.processing'),
          verified: t('orders.verified'),
          approved: t('orders.approved'),
          installed: t('orders.installed'),
          completed: t('orders.completed'),
          cancelled: t('orders.cancelled'),
        };

        const pieData = Object.entries(statusCounts).map(([status, count]) => ({
          name: statusLabels[status] || status,
          value: count,
        }));

        // Build daily order trend (last 7 days)
        const now = new Date();
        const dailyData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const dayOrders = allOrders.filter((o: any) => {
            const d = (o.created_at || o.createdAt || '').split('T')[0];
            return d === dateStr;
          });
          return {
            date: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            orders: dayOrders.length,
            pending: dayOrders.filter((o: any) => o.status === 'pending').length,
            completed: dayOrders.filter((o: any) => o.status === 'completed' || o.status === 'approved' || o.status === 'installed').length,
          };
        });

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Area Chart - Orders Trend */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">{t('dashboard.title')} - {t('orders.title')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#colorOrders)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Pending vs Completed */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">{t('orders.pending')} vs {t('orders.completed')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name={t('orders.pending')} />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name={t('orders.completed')} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Status Distribution */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">{t('dashboard.status')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

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
