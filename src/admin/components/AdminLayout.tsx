import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  MapPin,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageSquareQuote,
  LayoutGrid,
  Navigation,
  Languages,
  Store,
  Building2,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { t, language, setLanguage, isRTL } = useAdminLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('nav.orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('nav.plans'), href: '/admin/plans', icon: Package },
    { name: t('nav.posts'), href: '/admin/posts', icon: FileText },
    { name: t('nav.zones'), href: '/admin/zones', icon: MapPin },
    { name: t('nav.media'), href: '/admin/media', icon: Image },
    { name: t('nav.partners'), href: '/admin/partners', icon: Users },
    { name: t('nav.features'), href: '/admin/features', icon: Sparkles },
    { name: t('nav.testimonials'), href: '/admin/testimonials', icon: MessageSquareQuote },
    { name: t('nav.homepageLayout'), href: '/admin/homepage-layout', icon: LayoutGrid },
    { name: t('nav.navigation'), href: '/admin/navigation', icon: Navigation },
    { name: t('nav.dealers'), href: '/admin/dealers', icon: Store },
    { name: t('nav.cities'), href: '/admin/cities', icon: Building2 },
    { name: t('nav.settings'), href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-900" style={isRTL ? { fontFamily: '"Cairo", sans-serif' } : undefined}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-50 h-full w-64 bg-slate-800 transform transition-transform duration-200 ease-in-out ${
          isRTL ? 'lg:translate-x-0' : 'lg:translate-x-0'
        } ${
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-white font-semibold">{t('header.adminPanel')}</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 128px)' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>{t('header.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={isRTL ? 'lg:pr-64' : 'lg:pl-64'}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Languages size={16} />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {t('header.viewSite')} →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
