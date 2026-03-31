import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { ServiceData } from '@/types/activateServiceTypes';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface ServiceInfoDisplayProps {
  serviceData: ServiceData;
}

export const ServiceInfoDisplay: React.FC<ServiceInfoDisplayProps> = ({ serviceData }) => {
  const { t } = useLanguage();
  const { font } = useFont();

  const InfoField: React.FC<{ label: string; value: string | boolean; isBoolean?: boolean }> = ({ 
    label, 
    value, 
    isBoolean = false 
  }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg">
      <p className={`text-sm text-white/70 ${font}`}>{label}</p>
      <p className={`font-semibold text-white ${font}`}>
        {isBoolean ? (value ? t('activateService.serviceInfo.status.yes') : t('activateService.serviceInfo.status.no')) : value}
      </p>
    </div>
  );

  const StatusField: React.FC<{ label: string; value: boolean }> = ({ label, value }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg">
      <p className={`text-sm text-white/70 ${font}`}>{label}</p>
      <p className={`font-semibold ${value ? 'text-green-400' : 'text-orange-400'} ${font}`}>
        {value ? t('activateService.serviceInfo.status.approved') : t('activateService.serviceInfo.status.pending')}
      </p>
    </div>
  );

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${font} text-white`}>
          <CheckCircle className="h-5 w-5 text-green-400" />
          {t('activateService.serviceInfo.title')}
        </CardTitle>
        <CardDescription className={`${font} text-white/80`}>
          {t('activateService.serviceInfo.serviceDetails')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={["personal"]} className="w-full">
          <AccordionItem value="personal">
            <AccordionTrigger className={`font-semibold text-lg text-white ${font}`}>
              {t('activateService.serviceInfo.personalInfo')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label={t('activateService.serviceInfo.fields.firstName')} value={serviceData.first_name} />
                <InfoField label={t('activateService.serviceInfo.fields.lastName')} value={serviceData.last_name} />
                <InfoField label={t('activateService.serviceInfo.fields.identityNumber')} value={serviceData.identity_number} />
                <InfoField label={t('activateService.serviceInfo.fields.phoneNumber')} value={serviceData.phone_number} />
                <div className="sm:col-span-2">
                  <InfoField label={t('activateService.serviceInfo.fields.email')} value={serviceData.email} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="address">
            <AccordionTrigger className={`font-semibold text-lg text-white ${font}`}>{t('activateService.serviceInfo.addressInfo')}</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label={t('activateService.serviceInfo.fields.city')} value={serviceData.city} />
                <InfoField label={t('activateService.serviceInfo.fields.streetName')} value={serviceData.street_name} />
                <InfoField label={t('activateService.serviceInfo.fields.zone')} value={serviceData.zone} />
                <InfoField label={t('activateService.serviceInfo.fields.houseNumber')} value={serviceData.house_number} />
                <InfoField label={t('activateService.serviceInfo.fields.streetNumber')} value={serviceData.street_number} />
                <InfoField label={t('activateService.serviceInfo.fields.addressNotes')} value={serviceData.address_notes} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="service">
            <AccordionTrigger className={`font-semibold text-lg text-white ${font}`}>{t('activateService.serviceInfo.serviceDetailsSection')}</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label={t('activateService.serviceInfo.fields.serviceSpeed')} value={serviceData.service_speed} />
                <InfoField label={t('activateService.serviceInfo.fields.withTV')} value={serviceData.withTV} isBoolean />
                <InfoField label={t('activateService.serviceInfo.fields.withFixedIp')} value={serviceData.with_fixed_ip} isBoolean />
                <InfoField label={t('activateService.serviceInfo.fields.withApService')} value={serviceData.with_ap_service} isBoolean />
                <InfoField label={t('activateService.serviceInfo.fields.reference')} value={serviceData.reference} />
                <InfoField label={t('activateService.serviceInfo.fields.routerType')} value={serviceData.router_type} />
                <InfoField label={t('activateService.serviceInfo.fields.routerIsRent')} value={serviceData.router_is_rent} isBoolean />
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="payment">
            <AccordionTrigger className={`font-semibold text-lg text-white ${font}`}>{t('activateService.serviceInfo.paymentDetailsSection')}</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label={t('activateService.serviceInfo.fields.isPay')} value={serviceData.is_pay} isBoolean />
                <InfoField label={t('activateService.serviceInfo.fields.payPrice')} value={`₪${serviceData.pay_price}`} />
                <InfoField label={t('activateService.serviceInfo.fields.rentPrice')} value={`₪${serviceData.rent_price}`} />
                <StatusField label={t('activateService.serviceInfo.fields.approved')} value={serviceData.approved} />
                <InfoField label={t('activateService.serviceInfo.fields.comingFrom')} value={serviceData.coming_from} />
                <InfoField label={t('activateService.serviceInfo.fields.fromId')} value={serviceData.from_id} />
              </div>
            </AccordionContent>
          </AccordionItem> */}
        </Accordion>
      </CardContent>
    </Card>
  );
};
