import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const statusOptions = [
    { value: '', label: t('orders.allStatus') },
    { value: 'pending', label: t('orders.pending') },
    { value: 'processing', label: t('orders.processing') },
    { value: 'completed', label: t('orders.completed') },
    { value: 'cancelled', label: t('orders.cancelled') },
  ];

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadOrders();
    }
  }, [apiKey, status, page]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getOrders({ status: status || undefined, page, limit: 20 });
      setOrders(response.data || []);
    } catch (err) {
      setError(t('orders.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilter = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return styles[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('orders.pending'),
      processing: t('orders.processing'),
      completed: t('orders.completed'),
      cancelled: t('orders.cancelled'),
      verified: t('orders.verified'),
      approved: t('orders.approved'),
      installed: t('orders.installed'),
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('orders.title')}</h1>
          <p className="text-slate-400 mt-1">{t('orders.subtitle')}</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          {t('orders.refresh')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <span className="text-slate-400 text-sm">{t('orders.filter')}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  status === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>{t('orders.noOrders')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-start text-sm text-slate-400 bg-slate-750">
                  <th className="px-6 py-4 font-medium text-start">{t('orders.reference')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('orders.customer')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('orders.phone')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('orders.status')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('orders.date')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('orders.actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="px-6 py-4">
                      <span className="font-mono text-blue-400">
                        {order.reference_number || order.referenceNumber || `#${order.id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {order.full_name || order.fullName}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {order.phone_number || order.phoneNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Eye size={16} />
                        {t('orders.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">
              {t('orders.showing')} {orders.length} {t('orders.ordersCount')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(Math.max(1, page - 1)));
                  setSearchParams(params);
                }}
                disabled={page === 1}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className="text-sm text-white px-3">{t('orders.page')} {page}</span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page + 1));
                  setSearchParams(params);
                }}
                disabled={orders.length < 20}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
