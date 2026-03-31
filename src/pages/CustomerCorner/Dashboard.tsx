import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import { reactivateLine } from '@/services/auth/api';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Power,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LineStatus } from '@/types/authTypes';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, phoneNumber, updateUser } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const getStatusConfig = (status: LineStatus) => {
    switch (status) {
      case 'active':
        return {
          label: t('customerCorner.lineStatus.active'),
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
        };
      case 'suspended':
        return {
          label: t('customerCorner.lineStatus.suspended'),
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: AlertCircle,
        };
      case 'expired':
        return {
          label: t('customerCorner.lineStatus.expired'),
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  const handleReactivate = async () => {
    if (!phoneNumber) return;

    setReactivating(true);
    try {
      const response = await reactivateLine(phoneNumber);

      if (response.success && response.data?.newStatus) {
        updateUser({ lineStatus: response.data.newStatus });
        toast({
          title: t('customerCorner.dashboard.reactivateSuccess'),
          description: t('customerCorner.dashboard.reactivateSuccessDesc'),
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('customerCorner.dashboard.reactivateError');
      toast({
        title: t('customerCorner.dashboard.reactivateError'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setReactivating(false);
      setShowReactivateDialog(false);
    }
  };

  if (!user) {
    navigate('/customer-corner');
    return null;
  }

  const statusConfig = getStatusConfig(user.lineStatus);
  const StatusIcon = statusConfig.icon;
  const canReactivate = user.lineStatus === 'suspended' || user.lineStatus === 'expired';

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark rounded-2xl p-6 mb-8 text-white">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className={`text-white/80 text-sm ${font}`}>
                {isRTL ? 'مرحباً بك' : 'Welcome back'}
              </p>
              <h1 className={`text-2xl font-bold ${font}`}>
                {user.firstName} {user.lastName}
              </h1>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Line Status Card */}
          <Card className={`shadow-sm border ${statusConfig.borderColor}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${font}`}>
                <Wifi className="w-5 h-5 text-coolnet-purple" />
                {t('customerCorner.dashboard.lineStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Badge */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.color} animate-pulse`} />
                  <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                  <span className={`font-semibold ${statusConfig.textColor} ${font}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {canReactivate && (
                  <Button
                    onClick={() => setShowReactivateDialog(true)}
                    className={`bg-coolnet-orange hover:bg-coolnet-orange/90 text-white ${font}`}
                    disabled={reactivating}
                  >
                    {reactivating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Power className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('customerCorner.dashboard.reactivate')}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Service Details */}
              {user.serviceSpeed && (
                <div className={`mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-coolnet-purple" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className={`text-gray-500 text-sm ${font}`}>
                      {t('activateService.serviceInfo.fields.serviceSpeed')}
                    </p>
                    <p className={`text-gray-900 font-semibold ${font}`}>{user.serviceSpeed}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${font}`}>
                <Calendar className="w-5 h-5 text-coolnet-purple" />
                {isRTL ? 'معلومات سريعة' : 'Quick Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone */}
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.phone')}</p>
                  <p className="text-gray-900 font-medium" dir="ltr">{user.phoneNumber}</p>
                </div>
              </div>

              {/* Email */}
              {user.email && (
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.email')}</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information Card - Full Width */}
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${font}`}>
                <User className="w-5 h-5 text-coolnet-purple" />
                {t('customerCorner.dashboard.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-coolnet-purple" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.fullName')}</p>
                    <p className={`text-gray-900 font-medium ${font}`}>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-coolnet-purple" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.phone')}</p>
                    <p className="text-gray-900 font-medium" dir="ltr">{user.phoneNumber}</p>
                  </div>
                </div>

                {/* Email */}
                {user.email && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-coolnet-purple" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.email')}</p>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {(user.city || user.streetName) && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-coolnet-purple" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className={`text-gray-500 text-sm ${font}`}>{t('order.newLine.addressInfo')}</p>
                      <p className={`text-gray-900 font-medium ${font}`}>
                        {[user.streetName, user.houseNumber, user.city, user.zone]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={`${font}`}>
              {t('customerCorner.dashboard.reactivate')}
            </AlertDialogTitle>
            <AlertDialogDescription className={`${font}`}>
              {t('customerCorner.dashboard.reactivateConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse gap-2' : ''}>
            <AlertDialogCancel className={font}>
              {t('common.close')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={reactivating}
              className={`bg-coolnet-orange hover:bg-coolnet-orange/90 ${font}`}
            >
              {reactivating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('customerCorner.dashboard.reactivate')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
