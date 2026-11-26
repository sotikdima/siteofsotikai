import React from 'react';
import { Handshake, ExternalLink, ShieldCheck, Heart, Mail, CheckCircle2, Award, Zap, Bell, CreditCard } from 'lucide-react';
import { NavTab } from '../types/navigation';
import { ACTIVE_DONATION_SERVICES_LIST } from '../data/mockData';

interface PartnersPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
          <Handshake className="w-4 h-4 text-amber-700" />
          <span>Платёжные сервисы и партнерские площадки</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
          Партнеры и платёжные шлюзы
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Официальные платёжные шлюзы и стримерские сервисы, через которые зрители поддерживают Дмитрия (FSB Sotik) и команду FSB Racing.
        </p>
      </div>

      {/* Grid of Active Donation Partners — Full Width with 5px Yellow Frosted Glass Borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACTIVE_DONATION_SERVICES_LIST.map((svc) => (
          <div
            key={svc.id}
            className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] flex flex-col justify-between space-y-6 hover:border-amber-500 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-sm bg-gradient-to-tr ${svc.color} border border-white/50 text-white`}>
                  {svc.icon}
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  {svc.badge}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  {svc.name}
                </h3>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">
                  {svc.category === 'wallet' ? 'Электронный кошелёк' : svc.category === 'bank' ? 'Банк РФ / СБП' : 'Стримерский сервис'}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {svc.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                {svc.recipientAccount}
              </span>
              <button
                onClick={() => onNavigate('donate')}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>Поддержать</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Community & Stream Platforms Card */}
        <div className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 flex flex-col justify-between space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)]">
          <div className="space-y-3">
            <span className="text-3xl">📺</span>
            <h3 className="font-extrabold text-xl text-slate-900">Стримы Forza Motorsport</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Прямые трансляции гоночных баталий с участием команды FSB Racing. Подписывайтесь на стримы Дмитрия!
            </p>
          </div>

          <button
            onClick={() => onNavigate('donate')}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/20 transition-all"
          >
            <span>Страница донатов</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Guarantee Banner — 5px Yellow Frosted Glass Border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shrink-0 shadow-md shadow-amber-400/20">
            🛡️
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              Гарантия прямой поддержки без посредников
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Все указанные кошельки и стримерские алерты принадлежат лично Дмитрию Переднему (FSB Sotik).
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('donate')}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-purple-600/25 cursor-pointer shrink-0 transition-all border border-amber-300/40"
        >
          <Heart className="w-4 h-4 fill-current text-amber-200" />
          <span>Перейти к донату</span>
        </button>
      </div>
    </div>
  );
};
