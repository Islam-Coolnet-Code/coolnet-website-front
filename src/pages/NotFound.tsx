import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-coolnet-purple">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">{t('notFound.title')}</h1>
        <p className="text-xl text-white/80 mb-6">{t('notFound.message')}</p>
        <a href="/" className="inline-block bg-coolnet-orange hover:bg-coolnet-orange-dark text-white font-bold px-6 py-3 rounded-full transition-all">
          {t('notFound.returnHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
