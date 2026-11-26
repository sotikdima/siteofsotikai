import React, { useState } from 'react';
import {
  Users,
  Heart,
  ArrowRight,
  RefreshCw,
  Flag,
} from 'lucide-react';
import { DmitryProfile, DmitryTransfer } from '../types/donation';
import { NavTab } from '../types/navigation';
import { DONATION_SERVICES_LIST } from '../data/mockData';
import { formatRubles } from '../utils/yoomoney';
import { StreamAndChats } from './StreamAndChats';

interface HomePageProps {
  profile: DmitryProfile;
  transfers: DmitryTransfer[];
  onNavigate: (tab: NavTab) => void;
  onAddTransfer?: (transfer: DmitryTransfer) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  transfers,
  onNavigate,
  onAddTransfer,
}) => {
  const [statusIdx, setStatusIdx] = useState(0);

  const streamerStatuses = [
    'В прямом эфире Forza Motorsport 🎮',
    'Тренирует круги на Nürburgring Nordschleife 🏎️',
    'Настраивает телеметрию с FSB Bosfor 🔧',
    'Тестирует болид Porsche 911 GT3 R 🏁',
    'Планирует заезд с FSB Forest и FSB Sensei 🌍',
    'Спасибо всем за донаты и тёплые слова! 💜',
  ];

  const handleNextStatus = () => {
    setStatusIdx((prev) => (prev + 1) % streamerStatuses.length);
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* HERO SECTION — Liquid Glass Hero with siteofsotik_logo.jpg & FSB RACING LIVE widget */}
      <div className="glass" data-rain="22">
        <div className="glass-rain" />
        <div className="glass-body !p-6 sm:!p-10 lg:!p-12 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-8 lg:gap-12">
          <div className="space-y-6 lg:space-y-7">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-xl border border-amber-400/50 rounded-full px-4 py-2 text-xs shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-slate-500 font-mono">Статус стрима:</span>
              <span className="font-bold text-amber-800">
                {streamerStatuses[statusIdx]}
              </span>
              <button
                onClick={handleNextStatus}
                title="Сменить статус"
                className="ml-1 text-slate-400 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Flag className="w-4 h-4 text-red-600" />
                <span>Официальный сайт Дмитрия Переднего (FSB Sotik) · Команда FSB Racing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight text-slate-950">
                Добро пожаловать на{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-slate-900">
                  «СайтСотика»
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed max-w-4xl font-normal">
                Я инвалид без пальцев на обеих руках после обморожения в 2006 году. В 2017 году купил Xbox с диском Forza Motorsport 7 и заболел этой игрой. Сегодня я стримлю Forza Motorsport 7 и новую Forza Motorsport, управляя машинами на геймпаде, и руковожу международной гоночной командой{' '}
                <strong className="text-amber-700 font-bold">FSB Racing</strong>!
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-1">
              <button
                onClick={() => onNavigate('donate')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-purple-600/25 border border-amber-300/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-current text-amber-200 animate-pulse" />
                <span>Поддержать стримера</span>
              </button>

              <button
                onClick={() => onNavigate('team')}
                className="px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-amber-50 text-slate-800 font-bold text-sm sm:text-base flex items-center gap-2.5 border-[2px] border-amber-400/60 backdrop-blur-xl shadow-sm transition-all cursor-pointer"
              >
                <Users className="w-5 h-5 text-amber-600" />
                <span>Команда FSB Racing</span>
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer py-2"
              >
                <span>История преодоления</span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 group-hover:text-amber-600 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right side: SайтСотика logo + FSB RACING LIVE bar */}
          <div className="w-full select-none">
            <div className="relative overflow-hidden rounded-[24px] border-[3px] border-amber-400/60 bg-white shadow-2xl shadow-slate-900/20">
              <img
                src="/images/siteofsotik_logo.jpg"
                alt="СайтСотика — FSB Sotik · Racing & Music"
                className="w-full h-auto object-contain"
                draggable={false}
              />
            </div>

            <div className="mt-4 w-full rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/20 p-4 text-white shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <span className="font-extrabold tracking-widest text-[13px]">FSB RACING</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                  LIVE
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Стримы
                </button>
                <button
                  onClick={() => onNavigate('games')}
                  className="flex-1 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Треки
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWITCH STREAM (fsbsotik) LEFT + DUAL CHATS (ТвичатикСотика & ЧатикСотика) RIGHT */}
      <StreamAndChats wallet={profile.yoomoneyWallet} onAddTransfer={onAddTransfer} />

      {/* ALL DONATION CHANNELS — Liquid Glass Card */}
      <div className="glass" data-rain="6">
        <div className="glass-rain" />
        <div className="glass-body !p-6 sm:!p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-600 fill-current animate-pulse" />
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Способы доната и поддержки стримов Дмитрия
                </h3>
                <p className="text-xs text-slate-500">
                  Прямые переводы без посредников: ЮMoney, банки РФ через СБП и стримерские алерты
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('donate')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-center"
            >
              <span>Открыть страницу донатов</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {DONATION_SERVICES_LIST.filter((s) => !s.hidden).map((s) => (
              <div
                key={s.id}
                onClick={() => onNavigate('donate')}
                className="p-4 rounded-2xl bg-white/90 hover:bg-amber-50/80 border-[2px] border-amber-400/40 hover:border-amber-500 transition-all cursor-pointer text-center flex flex-col items-center justify-between gap-3 group shadow-xs hover:shadow-md"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <div className="w-full">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-800 truncate">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono mt-0.5">{s.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM PREVIEW — Liquid Glass Card */}
      <div className="glass">
        <div className="glass-body !p-6 sm:!p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Международная гоночная семья
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Пилоты команды FSB Racing
              </h2>
            </div>
            <button
              onClick={() => onNavigate('team')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Вся команда и регламент →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { callsign: 'FSB Sotik', name: 'Дмитрий (Основатель)', city: 'Нижегородская обл. 🇷🇺', role: 'Стример & Пилот', flag: '🇷🇺' },
              { callsign: 'FSB Bosfor', name: 'Валера', city: 'г. Волжский 🇷🇺', role: 'Пилот FSB Racing', flag: '🇷🇺' },
              { callsign: 'FSB Forest', name: 'Антон', city: 'Германия 🇩🇪', role: 'Международный пилот', flag: '🇩🇪' },
              { callsign: 'FSB Sensei', name: 'Денис', city: 'Ирландия 🇮🇪', role: 'Пилот & Стратег', flag: '🇮🇪' },
            ].map((pilot) => (
              <div
                key={pilot.callsign}
                onClick={() => onNavigate('team')}
                className="p-5 rounded-2xl bg-white/90 border-[2px] border-amber-400/40 hover:border-amber-500 transition-all cursor-pointer space-y-2.5 group shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-slate-900 group-hover:text-amber-800">
                    {pilot.callsign}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    {pilot.role}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700">{pilot.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>{pilot.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT TRANSFERS FEED — Liquid Glass Card */}
      <div className="glass">
        <div className="glass-body !p-6 sm:!p-10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-amber-600 fill-current" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Последние донаты от зрителей стримов
              </h3>
            </div>
            <button
              onClick={() => onNavigate('donate')}
              className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
            >
              Отправить донат Дмитрию →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white/90 border border-amber-400/40 flex items-start justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {t.isAnonymous ? 'Аноним' : t.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      · {t.timestamp}
                    </span>
                  </div>
                  {t.message && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                      «{t.message}»
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold font-mono text-amber-700 tabular-nums shrink-0">
                  +{formatRubles(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
