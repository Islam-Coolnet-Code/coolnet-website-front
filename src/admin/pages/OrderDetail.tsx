import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  QrCode,
} from 'lucide-react';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();

  const statusOptions = [
    { value: 'pending', label: t('orders.pending'), icon: Clock, color: 'text-yellow-400' },
    { value: 'verified', label: t('orders.verified'), icon: CheckCircle, color: 'text-blue-400' },
    { value: 'approved', label: t('orders.approved'), icon: CheckCircle, color: 'text-green-400' },
    { value: 'installed', label: t('orders.installed'), icon: CheckCircle, color: 'text-emerald-400' },
    { value: 'cancelled', label: t('orders.cancelled'), icon: XCircle, color: 'text-red-400' },
  ];

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (apiKey && id) {
      adminApi.setApiKey(apiKey);
      loadOrder();
    }
  }, [apiKey, id]);

  const loadOrder = async () => {
    try {
      const response = await adminApi.getOrder(parseInt(id!));
      setOrder(response.data);
    } catch (err) {
      setError(t('orderDetail.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await adminApi.updateOrderStatus(parseInt(id!), newStatus, notes || undefined);
      setOrder({ ...order, status: newStatus });
      setNotes('');
    } catch (err) {
      setError(t('orderDetail.error'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
        <AlertCircle size={20} />
        <span>{error || t('orderDetail.notFound')}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('orderDetail.order')} {order.reference_number || order.referenceNumber || `#${order.id}`}
          </h1>
          <p className="text-slate-400 mt-1">
            {t('orderDetail.createdOn')} {new Date(order.created_at || order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('orderDetail.customerInfo')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">{t('orderDetail.fullName')}</div>
                  <div className="text-white">{order.full_name || order.fullName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">{t('orderDetail.phone')}</div>
                  <div className="text-white">{order.phone_number || order.phoneNumber}</div>
                </div>
              </div>
              {(order.email) && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-400">{t('orderDetail.email')}</div>
                    <div className="text-white">{order.email}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-400">{t('orderDetail.address')}</div>
                  <div className="text-white">
                    {order.address}, {order.city}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('orderDetail.orderDetails')}</h2>
            <div className="space-y-4">
              {order.plan && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-blue-400" />
                    <div>
                      <div className="text-white font-medium">
                        {order.plan.title?.en || order.plan.title || t('orderDetail.plan')}
                      </div>
                      <div className="text-sm text-slate-400">{t('orderDetail.internetPlan')}</div>
                    </div>
                  </div>
                  <div className="text-white font-semibold">
                    ₪{order.plan.price}
                  </div>
                </div>
              )}

              {order.router && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{order.router.name}</div>
                    <div className="text-sm text-slate-400">{t('orderDetail.router')}</div>
                  </div>
                  <div className="text-white font-semibold">
                    ₪{order.router.price}
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">{t('orderDetail.customerNotes')}</div>
                  <div className="text-white">{order.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Referral Source */}
          {(order.coming_from || order.comingFrom) && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <QrCode size={20} className="text-purple-400" />
                {t('orderDetail.referralSource')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('orderDetail.referralSource')}</div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                    {(() => {
                      const source = order.coming_from || order.comingFrom;
                      const sourceMap: Record<string, string> = {
                        dealer: t('orderDetail.dealer'),
                        employee: t('orderDetail.employee'),
                        social_media: t('orderDetail.socialMedia'),
                        friends: t('orderDetail.friends'),
                        ads: t('orderDetail.ads'),
                        qr: t('orderDetail.qr'),
                      };
                      return sourceMap[source] || source;
                    })()}
                  </span>
                </div>
                {(order.from_id || order.fromId) && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">{t('orderDetail.referralId')}</div>
                    <div className="text-white font-mono">{order.from_id || order.fromId}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Location */}
          {(order.lat && order.lng) && (
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-green-400" />
                {t('orderDetail.customerLocation')}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400 font-mono">
                  {parseFloat(order.lat).toFixed(6)}, {parseFloat(order.lng).toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  {t('orderDetail.openInMaps')}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('orderDetail.orderStatus')}</h2>
            <div className="space-y-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isActive = order.status === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusUpdate(option.value)}
                    disabled={isUpdating || isActive}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:cursor-not-allowed`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : option.color} />
                    <span>{option.label}</span>
                    {isActive && (
                      <CheckCircle size={16} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Notes */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('orderDetail.addNotes')}</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('orderDetail.addNotesPlaceholder')}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
            <p className="text-xs text-slate-400 mt-2">
              {t('orderDetail.notesHint')}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t('orderDetail.timeline')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <div className="text-sm text-white">{t('orderDetail.orderCreated')}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(order.created_at || order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              {order.updated_at && order.updated_at !== order.created_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="text-sm text-white">{t('orderDetail.lastUpdated')}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(order.updated_at || order.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
