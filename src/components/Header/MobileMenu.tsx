// File: src/components/Header/parts/MobileMenu.tsx
import React, { useState } from 'react';
import { X, Phone, ChevronRight, ChevronDown } from 'lucide-react';
import { NavItem } from './shared/navConfig';

import type { DropdownItem } from '@/types/nav-types';
import englishLogo from '@/assets/logos/englishMobile.png';
import arabicLogo from '@/assets/logos/arabicMobile.png'

interface MobileMenuProps {
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
  isHomePage: boolean;
  font: string;
  isRTL: boolean;
  activeSection: string;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleMenu: () => void;
  onDropdownClick: (item: DropdownItem) => void;
  handleNavClick: (id: string) => void;
  navItems: NavItem[];
  contactPhone?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ t, language, setLanguage, isHomePage, font, isRTL, onDropdownClick, handleNavClick, activeSection, onToggleMenu, setIsMenuOpen, isMenuOpen, navItems, contactPhone }) => {
  const [expandedMobileDropdown, setExpandedMobileDropdown] = useState<string | null>(null);
  
  return (
    <div className={`
        xl:hidden fixed inset-0 bg-white z-[100] transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'}
      `}>
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          {isRTL ? 
              <img src={arabicLogo} alt="Cool net" className="h-[110px]" />
              : 
              <img src={englishLogo} alt="Cool net" className="h-[110px]" /> 
          }
          <button
            onClick={onToggleMenu}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 active:scale-95 transition-transform"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Keep the rest of the menu unchanged */}
        <div className="flex flex-col h-[calc(100%-4rem)]">
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const navId = item.linkValue || item.id;
                // Check if current item should be highlighted based on current page
                // Handle both URL-style paths (e.g., "/speed-test") and legacy IDs
                const isCurrentPage =
                  (navId === location.pathname) ||
                  (navId === '/' && isHomePage) ||
                  (navId === 'order' && location.pathname === '/new-line') ||
                  (navId === '/new-line' && location.pathname === '/new-line') ||
                  (navId === 'plans' && (location.pathname === '/business' || (isHomePage && activeSection === 'plans')));

                // For home page sections, check if this section is currently active
                const isActiveSection = isHomePage && (activeSection === navId || (navId === '/' && activeSection === 'home'));
                const shouldHighlightAsActive = isCurrentPage || isActiveSection;
                const shouldHighlight = item.highlight && location.pathname !== '/new-line';

                // If item has dropdown, render as expandable section
                if (item.hasDropdown && item.dropdownItems) {
                  const isExpanded = expandedMobileDropdown === item.id;

                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Dropdown Toggle Button */}
                      <button
                        onClick={() => setExpandedMobileDropdown(isExpanded ? null : item.id)}
                        className={`
                          w-full p-4 rounded-xl transition-all ${isRTL ? 'text-right' : 'text-left'}
                          ${shouldHighlight
                            ? 'bg-coolnet-orange text-white shadow-lg shadow-orange-200'
                            : shouldHighlightAsActive
                              ? 'bg-coolnet-orange/10 text-coolnet-orange border-2 border-coolnet-orange/20'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          } ${font}
                        `}
                      >
                        <div className={`flex items-center w-full ${isRTL ? 'justify-end' : 'justify-between'}`}>
                          {isRTL && <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${shouldHighlight ? 'text-white' : shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-gray-400'} mr-3`} />}
                          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} min-w-0 flex-1`}>
                            <div className={`flex-shrink-0 ${shouldHighlight ? 'text-white' : shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-coolnet-purple'}`}>
                              {item.icon}
                            </div>
                            <span className={`font-medium text-sm leading-tight truncate ${isRTL ? 'font-jazeera text-lg text-right' : 'text-left'} ${font}`}>
                              {item.label}
                            </span>
                          </div>
                          {!isRTL && <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${shouldHighlight ? 'text-white' : shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-gray-400'}`} />}
                        </div>
                      </button>

                      {/* Dropdown Items */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className={`space-y-2 pt-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                          {item.dropdownItems.map((dropdownItem) => {
                            const isDropdownActive =
                              (dropdownItem.id === 'plans-personal' && isHomePage && activeSection === 'plans') ||
                              (dropdownItem.id === 'plans-business' && location.pathname === '/business');

                            return (
                              <button
                                key={dropdownItem.id}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setExpandedMobileDropdown(null);
                                  setTimeout(() => onDropdownClick(dropdownItem), 300);
                                }}
                                className={`
                                  w-full p-3 rounded-lg transition-all ${isRTL ? 'text-right' : 'text-left'}
                                  ${isDropdownActive
                                    ? 'bg-coolnet-purple/10 text-coolnet-purple border border-coolnet-purple/20'
                                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-200'
                                  } ${font}
                                `}
                              >
                                <div className={`flex items-center w-full ${isRTL ? 'justify-end' : 'justify-between'}`}>
                                  {isRTL && <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isDropdownActive ? 'text-coolnet-purple' : 'text-gray-400'} mr-3`} />}
                                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} min-w-0 flex-1`}>
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${dropdownItem.id === 'plans-personal' ? 'from-coolnet-purple to-coolnet-purple/70' : 'from-coolnet-orange to-coolnet-orange/70'} flex-shrink-0`}></div>
                                    <span className={`font-medium text-sm leading-tight truncate ${isRTL ? 'font-jazeera text-lg text-right' : 'text-left'} ${font}`}>
                                      {dropdownItem.label}
                                    </span>
                                  </div>
                                  {!isRTL && <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isDropdownActive ? 'text-coolnet-purple' : 'text-gray-400'}`} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Regular menu item
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(navId)}
                    className={`
                      w-full p-4 rounded-xl transition-all ${isRTL ? 'text-right' : 'text-left'}
                      ${shouldHighlight
                        ? 'bg-coolnet-orange text-white shadow-lg shadow-orange-200'
                        : shouldHighlightAsActive
                          ? 'bg-coolnet-orange/10 text-coolnet-orange border-2 border-coolnet-orange/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      } ${font}
                    `}
                  >
                    <div className={`flex items-center w-full ${isRTL ? 'justify-end' : 'justify-between'}`}>
                      {isRTL && <ChevronRight className={`h-5 w-5 flex-shrink-0 ${shouldHighlight ? 'text-white' :
                        shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-gray-400'
                        } mr-3`} />}
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} min-w-0 flex-1`}>
                        <div className={`flex-shrink-0 ${shouldHighlight ? 'text-white' :
                          shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-coolnet-purple'
                          }`}>
                          {item.icon}
                        </div>
                        <span className={`font-medium text-sm leading-tight truncate ${isRTL ? 'font-jazeera text-lg text-right' : 'text-left'} ${font} ${shouldHighlight ? 'text-white' :
                          shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-gray-700'
                          }`}>
                          {item.label}
                        </span>
                      </div>
                      {!isRTL && <ChevronRight className={`h-5 w-5 flex-shrink-0 ${shouldHighlight ? 'text-white' :
                        shouldHighlightAsActive ? 'text-coolnet-orange' : 'text-gray-400'
                        }`} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-4 rounded-xl">
              <a
                href={`tel:${contactPhone}`}
                className={`flex items-center justify-between p-3 bg-white rounded-lg shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-coolnet-orange" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'} ${font}`}>
                    <div className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{t('contact.callUs')}</div>
                    <div className="font-bold text-lg" dir="ltr">{contactPhone}</div>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
              </a>
            </div>
          </div>

          {/* Menu Footer */}
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* Language Selector - Mobile Optimized */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-lg border-2 transition-all ${language === 'en'
                    ? 'border-coolnet-purple bg-coolnet-purple/10 text-coolnet-purple'
                    : 'border-gray-200 hover:border-gray-300'
                    } ${font}`}
                >
                  <span className="font-medium">English</span>
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`p-3 rounded-lg border-2 transition-all ${language === 'ar'
                    ? 'border-coolnet-purple bg-coolnet-purple/10 text-coolnet-purple'
                    : 'border-gray-200 hover:border-gray-300'
                    } ${font}`}
                >
                  <span className="font-medium">العربية</span>
                </button>
                <button
                  onClick={() => setLanguage('he')}
                  className={`p-3 rounded-lg border-2 transition-all ${language === 'he'
                    ? 'border-coolnet-purple bg-coolnet-purple/10 text-coolnet-purple'
                    : 'border-gray-200 hover:border-gray-300'
                    } ${font}`}
                >
                  <span className="font-medium">עברית</span>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
  );
};

export default MobileMenu;