import React from 'react';
import {
  Smartphone,
  Heart,
  Gavel,
  ArrowRight,
  Tv,
  Users,
  CreditCard,
  Flame,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Radio,
} from 'lucide-react';
import { PortalSite } from '../types/auction';
import { DmitryProfile, DeviceViewMode } from '../types/donation';

interface PortalHubProps {
  profile: DmitryProfile;
  viewMode: DeviceViewMode;
  onSelectSite: (site: PortalSite) => void;
}

export const PortalHub: React.FC<PortalHubProps> = ({ profile, viewMode, onSelectSite }) => {
  const isMobileView = viewMode === 'mobile';

  return (
    <div
      className={
        isMobileView
          ? 'min-h-screen w-full overflow-y-auto bg-[#f4f6fb] text-slate-900 flex flex-col justify-between items-center p-4 py-8 relative font-sans'
          : 'h-screen w-screen overflow-hidden bg-[#f4f6fb] text-slate-900 flex flex-col justify-between items-center p-3 sm:p-5 lg:p-6 select-none relative font-sans'
      }
    >
      {/* Subtle ambient crystal reflections in the background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-300/25 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-sky-200/25 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[140px]" />
      </div>

      {/* Compact luxury Portal Brand Header (No navigation menus, strictly fullscreen header banner) */}
      <div className="z-10 shrink-0 text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-400/50 text-[11px] font-bold font-mono text-amber-900 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isMobileView
              ? '📱 Вертикальный режим (Телефон / Планшет · Авто)'
              : '💻 Горизонтальный режим (3 окна 9:16 в ряд · Авто)'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 font-mono flex items-center justify-center gap-2">
          <span>Портал</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-slate-900">
            Сотика
          </span>
        </h1>
        {isMobileView && (
          <p className="text-xs text-slate-600 font-medium">
            Полноэкранный хаб проектов Дмитрия Переднего (FSB Sotik)
          </p>
        )}
      </div>

      {/* CONTENT: THREE 9:16 WINDOWS (HORIZONTAL ROW ON LAPTOP/DESKTOP, VERTICAL STACK ON MOBILE) */}
      <div
        className={
          isMobileView
            ? 'z-10 w-full max-w-sm sm:max-w-md flex flex-col gap-6 my-6 px-1'
            : 'z-10 flex-1 w-full flex flex-row flex-nowrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-h-[calc(100vh-110px)] overflow-hidden my-auto px-2'
        }
      >
        {/* ======================================================== */}
        {/* WINDOW 1: «СайтСотика» (9:16 ASPECT RATIO) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectSite('site')}
          data-rain="10"
          className={
            isMobileView
              ? 'group relative w-full overflow-hidden rounded-[28px] border-[5px] border-amber-400/75 bg-white/90 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.07),0_0_20px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between gap-4'
              : 'group relative h-full max-h-[720px] aspect-[9/16] shrink min-w-0 max-w-[calc((100vw-48px)/3.15)] rounded-[26px] sm:rounded-[32px] border-[5px] border-amber-400/75 bg-white/85 backdrop-blur-2xl p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_25px_rgba(251,191,36,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_35px_rgba(251,191,36,0.32)] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover:scale-[1.01]'
          }
        >
          <div className="glass-rain" />
          {/* Top Window Bar */}
          <div className="relative z-10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-purple-600 to-indigo-600 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                  📱
                </div>
              </div>
              <span className="text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ОКНО 1 · 9:16
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-950 font-mono tracking-tight group-hover:text-amber-700 transition-colors">
                СайтСотика
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-amber-800 leading-tight">
                Главный портал стримера & Команда FSB Racing
              </p>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="relative z-10 my-2 sm:my-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-300/60 space-y-2.5 text-[11px] sm:text-xs text-slate-700 overflow-hidden flex-1 flex flex-col justify-center">
            {/* Live stream preview badge */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>Twitch: fsbsotik</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                Forza Motorsport 7 & Forza Motorsport
              </p>
            </div>

            {/* Dual chats preview */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Два онлайн-чата</span>
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-2">
                «ТвичатикСотика» (официальный чат на Twitch) и «ЧатикСотика» (живой чат сайта с донатами через ЮMoney).
              </p>
            </div>

            {/* FSB Racing team pilots */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Пилоты FSB Racing</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">
                FSB Sotik (Нижний), FSB Bosfor (Волжский), FSB Forest (Германия), FSB Sensei (Ирландия).
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => onSelectSite('site')}
            className="relative z-10 w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-400/25 transition-all cursor-pointer shrink-0"
          >
            <span>Войти на СайтСотика</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* WINDOW 2: «ДонатыСотика» (9:16 ASPECT RATIO) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectSite('donations')}
          data-rain="10"
          className={
            isMobileView
              ? 'group relative w-full overflow-hidden rounded-[28px] border-[5px] border-amber-400/75 bg-white/90 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.07),0_0_20px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between gap-4'
              : 'group relative h-full max-h-[720px] aspect-[9/16] shrink min-w-0 max-w-[calc((100vw-48px)/3.15)] rounded-[26px] sm:rounded-[32px] border-[5px] border-amber-400/75 bg-white/85 backdrop-blur-2xl p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_25px_rgba(251,191,36,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_35px_rgba(251,191,36,0.32)] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover:scale-[1.01]'
          }
        >
          <div className="glass-rain" />
          {/* Top Window Bar */}
          <div className="relative z-10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-600 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                  💳
                </div>
              </div>
              <span className="text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                ОКНО 2 · 9:16
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-950 font-mono tracking-tight group-hover:text-purple-700 transition-colors">
                ДонатыСотика
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-purple-700 leading-tight">
                Шлюз прямой поддержки без посредников
              </p>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="relative z-10 my-2 sm:my-3 p-3 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-2.5 text-[11px] sm:text-xs text-slate-700 overflow-hidden flex-1 flex flex-col justify-center">
            {/* Wallet info */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>ЮMoney 0%</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                  0% БЕЗ КОМИССИИ
                </span>
              </div>
              <div className="font-mono font-bold text-xs text-slate-900 truncate">
                4100117753597226
              </div>
              <p className="text-[10px] text-slate-500">
                СБП: +7 (987) 392-79-02 (Сбер, Т-Банк)
              </p>
            </div>

            {/* Active Services */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Банки и сервисы</span>
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-2">
                ЮMoney, Сбербанк, Т-Банк, DonationAlerts, CloudTips.
              </p>
            </div>

            {/* Stream Alert */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="font-bold text-purple-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-600" />
                <span>Голосовые стрим-алерты</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                Оповещения и озвучка сообщения в прямом эфире!
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => onSelectSite('donations')}
            className="relative z-10 w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer shrink-0"
          >
            <span>Открыть ДонатыСотика</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* WINDOW 3: «АукционыСотика» (9:16 ASPECT RATIO) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectSite('auctions')}
          data-rain="10"
          className={
            isMobileView
              ? 'group relative w-full overflow-hidden rounded-[28px] border-[5px] border-amber-400/75 bg-white/90 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.07),0_0_20px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between gap-4'
              : 'group relative h-full max-h-[720px] aspect-[9/16] shrink min-w-0 max-w-[calc((100vw-48px)/3.15)] rounded-[26px] sm:rounded-[32px] border-[5px] border-amber-400/75 bg-white/85 backdrop-blur-2xl p-3.5 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_25px_rgba(251,191,36,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] hover:border-amber-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_35px_rgba(251,191,36,0.32)] transition-all cursor-pointer flex flex-col justify-between overflow-hidden hover:scale-[1.01]'
          }
        >
          <div className="glass-rain" />
          {/* Top Window Bar */}
          <div className="relative z-10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                  🔨
                </div>
              </div>
              <span className="text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-200">
                ОКНО 3 · 9:16
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-950 font-mono tracking-tight group-hover:text-amber-700 transition-colors">
                АукционыСотика
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-amber-800 leading-tight">
                Интерактивные аукционы зрителей стримов
              </p>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="relative z-10 my-2 sm:my-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-300/60 space-y-2.5 text-[11px] sm:text-xs text-slate-700 overflow-hidden flex-1 flex flex-col justify-center">
            {/* Live Lot 1 */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate">
                  🏎️ Выбор болида для стрима
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                  АКТИВЕН
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Текущая ставка: <strong className="text-slate-950 font-mono">3 500 ₽</strong> (Лидер: ForzaFan_99)
              </p>
            </div>

            {/* Live Lot 2 */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate">
                  ⚔️ Гонка 1 на 1 против Дмитрия
                </span>
                <span className="text-[9px] font-mono text-amber-800 font-bold">
                  ТАЙМЕР ИДЕТ
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Текущая ставка: <strong className="text-slate-950 font-mono">5 200 ₽</strong> на Nordschleife
              </p>
            </div>

            {/* Quick action info */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <div className="font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Быстрые ставки & Таймеры</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                Повышение ставок: +100₽, +500₽, +1000₽ в реальном времени!
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => onSelectSite('auctions')}
            className="relative z-10 w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer shrink-0"
          >
            <span>Перейти на АукционыСотика</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Discreet bottom status label without any scrolling or links */}
      <div className="z-10 shrink-0 text-center text-[11px] text-slate-500 font-mono">
        © 2024–2026 ПорталСотика · Авторский проект Дмитрия Переднего (FSB Sotik) · Команда FSB Racing
      </div>
    </div>
  );
};
