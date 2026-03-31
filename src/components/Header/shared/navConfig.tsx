// File: src/components/Header/shared/navConfig.tsx
import React from 'react';
import {
  Home,
  Zap,
  Users,
  CircleUserRound,
  Gauge,
  Settings,
  ShoppingCart,
  Info,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  HelpCircle,
  Star,
  LucideIcon
} from 'lucide-react';
import { NavItem as CmsNavItem, MultiLangText } from '@/services/cms/api';

// Helper to get localized text from MultiLangText object
const getLocalizedText = (text: MultiLangText | null | undefined, language: string): string => {
  if (!text) return '';
  const langKey = language as keyof MultiLangText;
  return text[langKey] || text.en || text.ar || '';
};

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  hasDropdown?: boolean;
  dropdownItems?: { id: string; label: string; targetId?: string; navigate?: string }[];
  linkType?: 'url' | 'anchor' | 'page';
  linkValue?: string;
  target?: '_self' | '_blank';
};

// Icon name to Lucide component mapping
const iconMap: Record<string, LucideIcon> = {
  home: Home,
  zap: Zap,
  features: Zap,
  users: Users,
  dealers: Users,
  user: CircleUserRound,
  'client-area': CircleUserRound,
  gauge: Gauge,
  'speed-test': Gauge,
  settings: Settings,
  cart: ShoppingCart,
  order: ShoppingCart,
  info: Info,
  phone: Phone,
  mail: Mail,
  'map-pin': MapPin,
  globe: Globe,
  'file-text': FileText,
  help: HelpCircle,
  star: Star,
};

// Get icon component from icon name
export const getIconComponent = (iconName: string | null): React.ReactNode => {
  if (!iconName) return <Home className="h-5 w-5" />;
  const IconComponent = iconMap[iconName.toLowerCase()] || Home;
  return <IconComponent className="h-5 w-5" />;
};

// Convert CMS NavItems to component NavItems
export const convertCmsNavItems = (
  cmsItems: CmsNavItem[],
  language: string
): NavItem[] => {
  return cmsItems.map(item => ({
    id: `nav-${item.id}`,
    label: getLocalizedText(item.label, language) || '',
    icon: getIconComponent(item.icon),
    linkType: item.linkType,
    linkValue: item.linkValue,
    target: item.target,
    hasDropdown: item.children && item.children.length > 0,
    dropdownItems: item.children?.map(child => ({
      id: `nav-child-${child.id}`,
      label: getLocalizedText(child.label, language) || '',
      targetId: child.linkType === 'anchor' ? child.linkValue : undefined,
      navigate: child.linkType === 'url' || child.linkType === 'page' ? child.linkValue : undefined,
    })),
  }));
};