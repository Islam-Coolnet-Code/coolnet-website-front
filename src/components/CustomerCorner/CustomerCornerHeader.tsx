import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';

interface CustomerCornerHeaderProps {
  showLogout?: boolean;
}

const CustomerCornerHeader: React.FC<CustomerCornerHeaderProps> = ({ showLogout = false }) => {
  const { language, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const isRTL = language === 'ar';

  const handleLogout = () => {
    logout();
    navigate('/customer-corner');
  };

  return (
    <header className="bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo — stays within the customer zone */}
          <button
            onClick={() => navigate(showLogout ? '/customer-corner/dashboard' : '/customer-corner')}
            className="shrink-0"
            aria-label="Customer Zone"
          >
            <img src={isRTL ? arabicLogo : englishLogo} alt="Coolnet" className="h-12 sm:h-14" />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showLogout && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className={`border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white ${font}`}
              >
                <LogOut className="w-4 h-4 me-2" />
                <span className="hidden sm:inline">{t('customerCorner.header.logout')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerCornerHeader;
