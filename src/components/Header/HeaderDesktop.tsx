import React from 'react';
import { NavItem } from './shared/navConfig';

import { Button } from '@/components/ui/button';
import { Globe, Phone, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png'

import type { DropdownItem } from '@/types/nav-types';

interface HeaderDesktopProps {
  t: (key: string) => string;
  navigate: (to: string) => void;
  isHomePage: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  font: string;
  isRTL: boolean;
  activeSection: string;
  handleNavClick: (id: string) => void;
  onDropdownClick: (item: DropdownItem) => void;
  navItems: NavItem[];
  contactPhone?: string;
}

const HeaderDesktop: React.FC<HeaderDesktopProps> = ({ t, navigate, isHomePage, language, setLanguage, font, isRTL, activeSection, handleNavClick, onDropdownClick, navItems, contactPhone }) => {

  {/* Desktop Header - Unchanged */}
  return (
    <>
        <div className="container mx-auto px-4 py-10 hidden xl:block">
          <div className="flex items-center justify-between h-12">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              {isRTL ? 
                <img src={arabicLogo} alt="Cool net" className="h-[160px]" />
                : 
                <img src={englishLogo} alt="Cool net" className="h-[160px]" /> 
              }
            </div>

            <div className="flex-grow flex justify-center">
              <nav className="flex items-center">
                {navItems.map((item, index) => {
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
                  const shouldHighlight = isCurrentPage || isActiveSection;

                  return (
                    <div key={item.id}>
                      {item.hasDropdown ? (
                        <DropdownMenu  modal={false}>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`transition-colors duration-500 font-medium px-3 py-2 flex items-center gap-1 ${shouldHighlight
                                ? 'text-coolnet-orange'
                                : 'text-white hover:text-coolnet-orange group-hover:text-coolnet-orange'
                                } ${isRTL ? 'font-jazeera text-xl flex-row-reverse' : 'text-lg text-nowrap'} ${font}`}
                            >
                              {item.label}
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            side="bottom"
                            sideOffset={8}
                            align={isRTL ? 'end' : 'start'}
                            className="w-40 bg-white rounded-lg shadow-xl border border-gray-100 p-0 z-[60]"
                          >

                            <div className={`absolute -top-1 ${isRTL ? 'right-4' : 'left-4'} w-2 h-2 bg-white border-l border-t border-gray-100 rotate-45`} />

                            <div className="py-2">
                              {item.dropdownItems?.map((d, idx) => (
                                <div key={d.id}>
                                  {/* If you're using react-router: */}
                                  <DropdownMenuItem
                                    onClick={() => onDropdownClick(d)}
                                    className={`px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-coolnet-purple/5 hover:to-coolnet-orange/5 focus:bg-gradient-to-r focus:from-coolnet-purple/5 focus:to-coolnet-orange/5 ${font}`}
                                  >
                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'} w-full`}>
                                      {!isRTL && (
                                        <span
                                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                                            d.id === 'plans-personal'
                                              ? 'from-coolnet-purple to-coolnet-purple/70'
                                              : 'from-coolnet-orange to-coolnet-orange/70'
                                          } opacity-60 transition-opacity flex-shrink-0`}
                                        />
                                      )}

                                      <span className={`text-gray-700 font-medium ${isRTL ? 'text-right' : 'text-left'} flex-1`}>
                                        {d.label}
                                      </span>

                                      {isRTL && (
                                        <span
                                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                                            d.id === 'plans-personal'
                                              ? 'from-coolnet-purple to-coolnet-purple/70'
                                              : 'from-coolnet-orange to-coolnet-orange/70'
                                          } opacity-60 transition-opacity flex-shrink-0`}
                                        />
                                      )}
                                    </div>
                                  </DropdownMenuItem>

                                  {idx < (item.dropdownItems?.length || 0) - 1 && (
                                    <DropdownMenuSeparator className="mx-4 bg-gray-100" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                      ) : (
                        <button
                          onClick={() => handleNavClick(navId)}
                          className={`transition-colors duration-500 font-medium px-3 py-2 ${shouldHighlight
                            ? 'text-coolnet-orange'
                            : 'text-white hover:text-coolnet-orange'
                            } ${isRTL ? 'font-jazeera text-xl' : 'text-lg text-nowrap'} ${font}`}
                        >
                          {item.label}
                        </button>
                      )}
                      {index < navItems.length - 1 && <div className="w-2"></div>}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden xl:flex items-center ${isRTL ? 'pl-2 border-l' : 'pr-2 border-r'} border-white/30`}>
                <a href="tel:*3164" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} text-white`}>
                  <div className="backdrop-blur-sm rounded-full p-2 bg-white/20">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} ${font}`}>
                    <span className="text-xs text-white/80">{t('contact.callUs')}</span>
                    <span className="font-bold text-white" dir="ltr">{contactPhone}</span>
                  </div>
                </a>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={`backdrop-blur-sm bg-white/10 border-white/30 text-white hover:text-white hover:bg-coolnet-purple ${font}`}>
                    <Globe className="h-4 w-4 me-2" />
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className={font}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className={font}>العربية</DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => setLanguage('he')} className={font}>עברית</DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* <Button
                className={`bg-coolnet-purple hover:bg-coolnet-purple/80 px-4 text-white ${font}`}
                onClick={() => window.open(`https://my.jet.net.il?language=${language}`, "_blank")}
              >
                <User className="h-4 w-4 me-2" />
                {t('navigation.clientArea')}
              </Button> */}
            </div>
          </div>
        </div>
    </>
  );
};

export default HeaderDesktop;