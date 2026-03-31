import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';

interface CustomerCornerHeaderProps {
  showLogout?: boolean;
}

const CustomerCornerHeader: React.FC<CustomerCornerHeaderProps> = ({ showLogout = false }) => {
  const { language } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const isRTL = language === 'ar';

  const handleLogout = () => {
    logout();
    navigate('/customer-corner');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <header className="bg-coolnet-purple shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <div className="cursor-pointer" onClick={handleGoHome}>
            {isRTL ? (
              <img src={arabicLogo} alt="Coolnet" className="h-16" />
            ) : (
              <img src={englishLogo} alt="Coolnet" className="h-16" />
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={handleGoHome}
              variant="ghost"
              size="sm"
              className={`text-white/80 hover:text-white hover:bg-white/10 ${font}`}
            >
              <Home className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الرئيسية' : 'Home'}
            </Button>

            {showLogout && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className={`border-white/30 text-white hover:bg-white/10 ${font}`}
              >
                <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerCornerHeader;
