import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { GamesPage } from './components/GamesPage';
import { TeamPage } from './components/TeamPage';
import { PartnersPage } from './components/PartnersPage';
import { DmitryDonationPage } from './components/DmitryDonationPage';
import { PortalHub } from './components/PortalHub';
import { AuctionsPage } from './components/AuctionsPage';
import { INITIAL_DMITRY_PROFILE, INITIAL_TRANSFERS } from './data/mockData';
import { DmitryProfile, DmitryTransfer, DeviceViewMode } from './types/donation';
import { NavTab } from './types/navigation';
import { PortalSite } from './types/auction';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { refreshGlassRain } from './utils/glassRain';
import { isFirebaseConfigured, subscribeToSiteChat } from './firebase/chat';

const VALID_TABS: NavTab[] = ['home', 'about', 'games', 'team', 'partners', 'donate'];

// Восстанавливаем SPA-маршрут после редиректа из /404.html (для статического хостинга)
function consumeSavedSpaPath(): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = window.sessionStorage.getItem('sotik_spa_path');
    if (saved) {
      window.sessionStorage.removeItem('sotik_spa_path');
      const normalized = saved.startsWith('/') ? saved : `/${saved}`;
      window.history.replaceState(null, '', normalized);
    }
  } catch {}
}

consumeSavedSpaPath();

function hasPaymentReturnFlag(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    const payment = q.get('payment') || q.get('yookassa') || q.get('donation') || q.get('status');
    const paid = q.get('paid');
    return payment === 'success' || payment === 'paid' || payment === 'succeeded' || paid === '1' || paid === 'true';
  } catch {
    return false;
  }
}

function readSiteFromUrl(): PortalSite {
  try {
    const path = (window.location.pathname || '/').replace(/\/+$/, '').toLowerCase();
    if (!path || path === '' || path === '/' || path === '/portal' || path === '/index.html') {
      // Check query/hash before defaulting
      const q = new URLSearchParams(window.location.search);
      const p = q.get('site') || q.get('page');
      if (p === 'site') return 'site';
      if (p === 'donations' || p === 'donate') return 'donations';
      if (p === 'auctions') return 'auctions';
      if (window.location.hash.toLowerCase().includes('donate')) return 'donations';
      return 'portal';
    }
    if (path.startsWith('/site')) return 'site';
    if (path === '/donations' || path === '/donate') return 'donations';
    if (path === '/auctions') return 'auctions';
  } catch {}
  return 'portal';
}

function readTabFromUrl(): NavTab {
  try {
    const segments = (window.location.pathname || '/').toLowerCase().split('/').filter(Boolean);
    if (segments[0] === 'site' && segments.length >= 2) {
      const candidate = segments[segments.length - 1] as NavTab;
      if (VALID_TABS.includes(candidate)) return candidate;
    }
  } catch {}
  return 'home';
}

function buildRoutePath(site: PortalSite, tab: NavTab): string {
  switch (site) {
    case 'site':
      return tab && tab !== 'home' ? `/site/${tab}` : '/site';
    case 'donations':
      return '/donations';
    case 'auctions':
      return '/auctions';
    default:
      return '/';
  }
}

/**
 * Real-time automatic device orientation and screen mode detector.
 * Automatically switches between:
 * - 'mobile' (vertical portrait position, height > width, or small screen < 768px)
 * - 'laptop' (horizontal landscape position, width >= height and 768px <= width < 1280px)
 * - 'desktop' (horizontal landscape position, width >= height and width >= 1280px)
 * Operates 100% automatically without any manual buttons.
 */
function detectDeviceViewMode(): DeviceViewMode {
  if (typeof window === 'undefined') return 'desktop';

  const w = window.innerWidth;
  const h = window.innerHeight;

  let isPortrait = false;
  let isLandscape = false;

  const orientType = window.screen?.orientation?.type;
  if (orientType) {
    if (orientType.startsWith('portrait')) {
      isPortrait = true;
    } else if (orientType.startsWith('landscape')) {
      isLandscape = true;
    }
  }

  if (!isPortrait && !isLandscape && typeof window.matchMedia === 'function') {
    try {
      if (window.matchMedia('(orientation: portrait)').matches) {
        isPortrait = true;
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        isLandscape = true;
      }
    } catch {}
  }

  if (!isPortrait && !isLandscape) {
    if (h > w) {
      isPortrait = true;
    } else {
      isLandscape = true;
    }
  }

  if (isPortrait || w < 768) {
    return 'mobile';
  }
  if (w < 1280) {
    return 'laptop';
  }
  return 'desktop';
}

export default function App() {
  const [portalSite, setPortalSiteState] = useState<PortalSite>(() => readSiteFromUrl());
  const [currentTab, setCurrentTabState] = useState<NavTab>(() => readTabFromUrl());
  const [paymentReturnBanner, setPaymentReturnBanner] = useState<boolean>(() => hasPaymentReturnFlag());

  const pushRoute = (site: PortalSite, tab: NavTab) => {
    try {
      const targetPath = buildRoutePath(site, tab);
      const currentPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
      if (currentPath !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {}
  };

  const setPortalSite = (site: PortalSite) => {
    setPortalSiteState(site);
    pushRoute(site, currentTab);
  };

  const setCurrentTab = (tab: NavTab) => {
    setCurrentTabState(tab);
    pushRoute(portalSite, tab);
  };

  useEffect(() => {
    const handlePopState = () => {
      setPortalSiteState(readSiteFromUrl());
      setCurrentTabState(readTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!paymentReturnBanner) return;
    try {
      const url = new URL(window.location.href);
      ['payment', 'yookassa', 'donation', 'status', 'paid'].forEach((k) => url.searchParams.delete(k));
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
    } catch {}
  }, [paymentReturnBanner]);

  const [profile, setProfile] = useState<DmitryProfile>(() => {
    try {
      localStorage.removeItem('dmitry_profile');
      localStorage.removeItem('yoodonate_streamer');
      localStorage.removeItem('dmitry_profile_v3');
      localStorage.removeItem('dmitry_profile_v4');
      localStorage.removeItem('dmitry_profile_v5');

      const saved = localStorage.getItem('dmitry_profile_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sberCard === INITIAL_DMITRY_PROFILE.sberCard) {
          return { ...INITIAL_DMITRY_PROFILE, ...parsed };
        }
      }
    } catch {}
    return INITIAL_DMITRY_PROFILE;
  });

  // Синхронизируем актуальные банковские реквизиты при загрузке
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      sbpPhone: INITIAL_DMITRY_PROFILE.sbpPhone,
      sberCard: INITIAL_DMITRY_PROFILE.sberCard,
      tbankCard: INITIAL_DMITRY_PROFILE.tbankCard,
      vtbCard: INITIAL_DMITRY_PROFILE.vtbCard,
    }));
  }, []);

  const [transfers, setTransfers] = useState<DmitryTransfer[]>(() => {
    try {
      const saved = localStorage.getItem('dmitry_transfers_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSFERS;
  });

  const [viewMode, setViewMode] = useState<DeviceViewMode>(() => detectDeviceViewMode());

  useEffect(() => {
    const handleOrientationOrResize = () => {
      setViewMode(detectDeviceViewMode());
    };

    handleOrientationOrResize();

    const delayedCheck = () => {
      handleOrientationOrResize();
      setTimeout(handleOrientationOrResize, 150);
      setTimeout(handleOrientationOrResize, 350);
    };

    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('orientationchange', delayedCheck);

    let mqlPortrait: MediaQueryList | null = null;
    let mqlLandscape: MediaQueryList | null = null;
    if (typeof window.matchMedia === 'function') {
      try {
        mqlPortrait = window.matchMedia('(orientation: portrait)');
        mqlPortrait.addEventListener?.('change', handleOrientationOrResize);
        mqlLandscape = window.matchMedia('(orientation: landscape)');
        mqlLandscape.addEventListener?.('change', handleOrientationOrResize);
      } catch {}
    }

    if (window.screen?.orientation?.addEventListener) {
      window.screen.orientation.addEventListener('change', delayedCheck);
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleOrientationOrResize);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('orientationchange', delayedCheck);
      mqlPortrait?.removeEventListener?.('change', handleOrientationOrResize);
      mqlLandscape?.removeEventListener?.('change', handleOrientationOrResize);
      window.screen?.orientation?.removeEventListener?.('change', delayedCheck);
      window.visualViewport?.removeEventListener('resize', handleOrientationOrResize);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sotik_portal_site', portalSite);
    } catch {}
  }, [portalSite]);

  useEffect(() => {
    const id = requestAnimationFrame(() => refreshGlassRain());
    const t = setTimeout(refreshGlassRain, 120);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
    };
  }, [portalSite, currentTab]);

  useEffect(() => {
    try {
      localStorage.setItem('dmitry_profile_v6', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('dmitry_transfers_v3', JSON.stringify(transfers));
    } catch {}
  }, [transfers]);

  const handleAddTransfer = (newTransfer: DmitryTransfer) => {
    setTransfers((prev) => {
      if (prev.some((t) => t.id === newTransfer.id)) return prev;
      return [newTransfer, ...prev];
    });
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeToSiteChat(40, (msgs) => {
      const remoteDonations = msgs.filter((m) => !!m.donation && !!m.text);
      if (remoteDonations.length === 0) return;
      setTransfers((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const additions: DmitryTransfer[] = [];
        for (let i = remoteDonations.length - 1; i >= 0; i--) {
          const m = remoteDonations[i];
          if (!m.id || existingIds.has(m.id)) continue;
          additions.push({
            id: m.id,
            senderName: m.author || 'Зритель',
            isAnonymous: m.author === 'Аноним',
            amount: m.donation!.amount,
            message: m.text,
            timestamp: m.time || 'В эфире',
            status: 'completed',
          });
        }
        if (additions.length === 0) return prev;
        return [...additions, ...prev].slice(0, 50);
      });
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleUpdateWallet = (newWallet: string) => {
    setProfile((prev) => ({
      ...prev,
      yoomoneyWallet: newWallet,
    }));
  };

  if (portalSite === 'portal') {
    return (
      <div
        className={
          viewMode === 'mobile'
            ? 'min-h-screen w-full bg-[#f4f6fb] text-slate-900 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-950 relative'
            : 'h-screen w-screen overflow-hidden bg-[#f4f6fb] text-slate-900 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-950 relative select-none'
        }
      >
        {paymentReturnBanner && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/95 backdrop-blur-md px-4 py-3 text-emerald-950 flex items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Спасибо за поддержку! Если оплата прошла через ЮKassa, благодарность автоматически появится в «ЧатикСотика».
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentReturnBanner(false)}
                className="p-1 rounded-lg hover:bg-emerald-200/70 text-emerald-800 cursor-pointer shrink-0"
                title="Скрыть уведомление"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <PortalHub
          profile={profile}
          viewMode={viewMode}
          onSelectSite={(site) => {
            setPortalSite(site);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-950 relative overflow-x-hidden">
      {/* Full-viewport Liquid Glass scene backdrop from archive */}
      <div
        className="scene"
        style={{ '--scene-img': 'url(/images/forza_racing_car_1794261906314.jpg)' } as React.CSSProperties}
      />

      {/* Sticky Liquid Glass Header on site / Fixed Close button on donations & auctions */}
      <Header
        portalSite={portalSite}
        onSelectPortalSite={setPortalSite}
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        wallet={profile.yoomoneyWallet}
        viewMode={viewMode}
      />

      {/* Main Content Area for Sub-Sites */}
      <main className="flex-1 pb-16 z-10 relative">
        {paymentReturnBanner && (
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-4">
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/95 backdrop-blur-md px-4 py-3 text-emerald-950 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Спасибо за поддержку! Если оплата прошла через ЮKassa, благодарность автоматически появится в «ЧатикСотика».
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentReturnBanner(false)}
                className="p-1 rounded-lg hover:bg-emerald-200/70 text-emerald-800 cursor-pointer shrink-0"
                title="Скрыть уведомление"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. АУКЦИОНЫСОТИКА */}
        {portalSite === 'auctions' && (
          <div className="space-y-4">
            <div style={{ height: 56 }} />
            <AuctionsPage
              onNavigateToDonations={() => {
                setPortalSite('donations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToSite={() => {
                setPortalSite('site');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              yoomoneyWallet={profile.yoomoneyWallet}
            />
          </div>
        )}

        {/* 3. ДОНАТЫСОТИКА */}
        {portalSite === 'donations' && (
          <div className="space-y-4">
            <div style={{ height: 56 }} />
            <DmitryDonationPage
              profile={profile}
              transfers={transfers}
              viewMode={viewMode}
              onAddTransfer={handleAddTransfer}
              onUpdateWallet={handleUpdateWallet}
            />
          </div>
        )}

        {/* 4. САЙТСОТИКА */}
        {portalSite === 'site' && (
          <>
            {currentTab === 'home' && (
              <HomePage
                profile={profile}
                transfers={transfers}
                onNavigate={setCurrentTab}
                onAddTransfer={handleAddTransfer}
              />
            )}

            {currentTab === 'about' && (
              <AboutPage
                profile={profile}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'games' && <GamesPage />}

            {currentTab === 'team' && <TeamPage onNavigate={setCurrentTab} />}

            {currentTab === 'partners' && <PartnersPage onNavigate={setCurrentTab} />}

            {currentTab === 'donate' && (
              <div className="space-y-4">
                <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-6">
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-amber-950 bg-white/85 hover:bg-amber-100/90 px-4 py-2.5 rounded-2xl border-[2px] border-amber-400/50 cursor-pointer shadow-sm backdrop-blur-md transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 text-amber-600" />
                    <span>← На главную СайтСотика</span>
                  </button>
                </div>

                <DmitryDonationPage
                  profile={profile}
                  transfers={transfers}
                  viewMode={viewMode}
                  onAddTransfer={handleAddTransfer}
                  onUpdateWallet={handleUpdateWallet}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-[5px] border-amber-400/70 bg-white/90 backdrop-blur-2xl py-10 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 text-xs text-slate-600 shadow-[0_-10px_35px_rgba(245,158,11,0.12)] z-10 relative">
        <div className="w-full space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md border-2 border-amber-400/50">
                🌐
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 font-mono text-base block">
                  ПорталСотика · СайтСотика · ДонатыСотика · АукционыСотика
                </span>
                <span className="text-xs text-slate-500">
                  Официальный хаб Дмитрия Переднего (FSB Sotik) · Стримера Forza Motorsport и лидера FSB Racing
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
              <button
                onClick={() => { setPortalSite('portal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-amber-600 transition-colors cursor-pointer"
              >
                🌐 ПорталСотика
              </button>
              <span>·</span>
              <button
                onClick={() => { setPortalSiteState('site'); setCurrentTabState('home'); pushRoute('site', 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-amber-600 transition-colors cursor-pointer"
              >
                📱 СайтСотика
              </button>
              <span>·</span>
              <button
                onClick={() => { setPortalSite('donations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
              >
                💳 ДонатыСотика
              </button>
              <span>·</span>
              <button
                onClick={() => { setPortalSite('auctions'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
              >
                🔨 АукционыСотика
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
            <div>
              © 2024–2026 ПорталСотика · Авторская экосистема Дмитрия Переднего (FSB Sotik) · Команда FSB Racing · Нижегородская область
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <a
                href="https://www.twitch.tv/fsbsotik"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9146FF] transition-colors font-bold"
              >
                Twitch: fsbsotik
              </a>
              <span>·</span>
              <a
                href={`https://yoomoney.ru/quickpay/confirm?receiver=${profile.yoomoneyWallet}&quickpay-form=shop&targets=Поддержка+проекта`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-600 transition-colors"
              >
                ЮMoney: 4100117753597226
              </a>
              <span>·</span>
              <a href="mailto:sotikdima@gmail.com" className="hover:text-amber-600 transition-colors">
                sotikdima@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
