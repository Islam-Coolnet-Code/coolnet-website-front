import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFont } from '@/hooks/use-font';
import HeaderDesktop from './HeaderDesktop';
import HeaderMobile from './HeaderMobile';
import MobileMenu from './MobileMenu';
import { useNavigation, useSiteSettings } from '@/services/cms/hooks';
import { convertCmsNavItems, NavItem } from './shared/navConfig';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useIsMobile();
  const isRTL = language === 'ar';
  const { data: siteSettings } = useSiteSettings();

  const contactPhone = (() => {
    if (!siteSettings) return '';
    const s = siteSettings.find((s: any) => s.key === 'contact_phone');
    return s?.valueEn || '';
  })();

  const isHomePage = location.pathname === "/";
  const { font } = useFont();

  // Fetch navigation from CMS
  const { data: cmsNavItems } = useNavigation('header');

  // Convert CMS nav items (no fallback - CMS only)
  const navItems: NavItem[] = useMemo(() => {
    if (cmsNavItems && cmsNavItems.length > 0) {
      return convertCmsNavItems(cmsNavItems, language);
    }
    return [];
  }, [cmsNavItems, language]);


  // Section detection for active navigation highlighting
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('');
      return;
    }

    const handleScrollForSections = () => {
      const sections = ['home', 'plans', 'features', 'business']; // Removed 'speedtest'
      const headerOffset = isMobile ? 112 : 120;
      let currentSection = 'home';

      // Check each section to see which one is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.pageYOffset;
          const elementBottom = elementTop + rect.height;
          const scrollPosition = window.pageYOffset + headerOffset;

          // If we're within this section (with some buffer)
          if (scrollPosition >= elementTop - 100 && scrollPosition < elementBottom - 100) {
            currentSection = sectionId;
          }
        }
      }

      // Special case: if we're at the very top, always show home as active
      if (window.pageYOffset < 100) {
        currentSection = 'home';
      }

      setActiveSection(currentSection);
    };

    // Add scroll listener for section detection
    window.addEventListener('scroll', handleScrollForSections);

    // Call immediately to set initial state
    handleScrollForSections();

    return () => {
      window.removeEventListener('scroll', handleScrollForSections);
    };
  }, [isHomePage, isMobile]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Save current scroll position
      const scrollPosition = window.pageYOffset;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPosition}px`;

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        // Restore scroll position
        window.scrollTo(0, scrollPosition);
      };
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = React.useCallback((id: string) => {
    // Close menu first
    setIsMenuOpen(false);

    // Wait for menu close animation to complete
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = isMobile ? 112 : 80; // Mobile header is taller (h-28 = 7rem = 112px)
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300); // Match the menu animation duration
  }, [isMobile]);

  function handleNavClick(id: string): void {
    // Handle URL-style linkValues from CMS (e.g., "/speed-test", "/dealers")
    if (id.startsWith('/')) {
      // Special case: home page
      if (id === '/') {
        if (!isHomePage) {
          setIsMenuOpen(false);
          setTimeout(() => {
            navigate('/');
          }, 300);
        }
        return;
      }

      // Navigate to the URL path
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate(id);
        window.scrollTo(0, 0);
      }, 300);
      return;
    }

    // Legacy ID-based navigation (for backwards compatibility)
    if (id === 'order') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/new-line');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'speed-test') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/speed-test');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'business' || id === 'plans-business') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/business');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'activate-service') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/activate-service');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'home' && !isHomePage) {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/');
      }, 300);
    }
    else if (id === 'dealers') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/dealers');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'clientArea') {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate('/customer-corner');
        window.scrollTo(0, 0);
      }, 300);
    }
    else if (id === 'plans-personal') {
      // Handle personal plans - scroll to plans section on home page
      if (!isHomePage) {
        setIsMenuOpen(false);
        setTimeout(() => {
          navigate('/?section=plans');
        }, 300);
      } else {
        scrollToSection('plans');
      }
    }
    else if (!isHomePage) {
      setIsMenuOpen(false);
      setTimeout(() => {
        navigate(`/?section=${id}`);
      }, 300);
    }
    else {
      // We're on home page, just scroll to section
      scrollToSection(id);
    }
  }

  // Handle dropdown item clicks
  function handleDropdownClick(dropdownItem: { id: string; label: string; targetId?: string; navigate?: string }): void {
    if (dropdownItem.navigate) {
      navigate(dropdownItem.navigate);
      window.scrollTo(0, 0);
    } else if (dropdownItem.targetId) {
      if (!isHomePage) {
        navigate(`/?section=${dropdownItem.targetId}`);
      } else {
        scrollToSection(dropdownItem.targetId);
      }
    }
  }

  // Handle section scrolling on page load
  useEffect(() => {
    if (isHomePage && location.search) {
      const params = new URLSearchParams(location.search);
      const section = params.get('section');
      if (section) {
        setTimeout(() => {
          scrollToSection(section);
          navigate('/', { replace: true });
        }, 100);
      }
    }
  }, [location, isHomePage, navigate, scrollToSection]);

  // Calculate background color based on scroll progress
  // const headerBackground =
  //   `linear-gradient(to right, #432b8c)`



  return (
    <>
      <header
        className="bg-coolnet-purple top-0 z-50 sticky w-full backdrop-blur-md transition-colors duration-500 ease-in-out overflow-hidden"
        // style={{ background: headerBackground }}
      >
        {/* Desktop Header */}
        <HeaderDesktop
          t={t}
          navigate={navigate}
          isHomePage={isHomePage}
          language={language}
          setLanguage={setLanguage}
          font={font}
          isRTL={isRTL}
          activeSection={activeSection}
          handleNavClick={handleNavClick}
          onDropdownClick={handleDropdownClick}
          navItems={navItems}
          contactPhone={contactPhone}
        />

        {/* Mobile Header */}
        <HeaderMobile isMenuOpen={isMenuOpen} isRTL={isRTL} language={language} t={t} onToggleMenu={toggleMenu} contactPhone={contactPhone}/>
      </header>

      {/* Mobile Full-Screen Menu */}
      <MobileMenu
          t={t}
          isHomePage={isHomePage}
          language={language}
          setLanguage={setLanguage}
          font={font}
          isRTL={isRTL}
          activeSection={activeSection}
          handleNavClick={handleNavClick}
          onDropdownClick={handleDropdownClick}
          onToggleMenu={toggleMenu}
          setIsMenuOpen={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
          navItems={navItems}
          contactPhone={contactPhone}
      />
    </>
  );
};

export default Header;