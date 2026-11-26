import React from 'react';
import { Trophy, Flag, Users, Heart, Shield, Sparkles, MapPin, ExternalLink, Flame } from 'lucide-react';
import { FSB_RACING_MEMBERS } from '../data/mockData';
import { NavTab } from '../types/navigation';

interface TeamPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* Header Banner — Full Width with 5px Yellow Frosted Glass Border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-6">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-100 backdrop-blur-md border border-amber-300 text-xs font-bold text-amber-900">
          <Flag className="w-4 h-4 text-red-600" />
          <span>Международная гоночная команда в Forza Motorsport</span>
        </div>

        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950">
            Команда <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-slate-900">FSB Racing</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Мы объединили пилотов из разных уголков мира: России (Нижегородская область и город Волжский), Германии и Ирландии. Вместе мы тренируемся, выходим в прямые эфиры, выступаем в гоночных лобби и доказываем силу командного духа!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="bg-slate-100/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-amber-400/40 text-xs flex items-center gap-2.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-slate-800">Дисциплины: Forza Motorsport 7 & Forza Motorsport</span>
          </div>
          <div className="bg-amber-100/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-amber-300 text-xs text-amber-900 font-mono font-bold shadow-xs">
            4 пилота · 3 страны
          </div>
        </div>
      </div>

      {/* Team Pilots Grid — Full Width with 5px Yellow Frosted Glass Borders */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-600" />
            <span>Состав команды FSB Racing</span>
          </h2>
          <span className="text-xs text-slate-500">
            Пилоты и основатели
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FSB_RACING_MEMBERS.map((pilot) => (
            <div
              key={pilot.callsign}
              className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] flex flex-col justify-between space-y-6 hover:border-amber-500 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-amber-50 text-slate-900 flex items-center justify-center text-3xl shadow-sm border-2 border-amber-400/50 shrink-0">
                      {pilot.callsign === 'FSB Sotik' ? (
                        <img
                          src="/images/dmitry_avatar_1794142052088.jpg"
                          alt="FSB Sotik (Дмитрий Передний)"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        pilot.avatar
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900">
                          {pilot.callsign}
                        </h3>
                        <span className="text-2xl" title={pilot.location}>{pilot.flag}</span>
                      </div>
                      <div className="text-sm font-semibold text-amber-800">
                        {pilot.realName}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                    {pilot.role}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pilot.location}</span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {pilot.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Любимый болид:</span>
                <span className="font-mono font-bold text-amber-800">
                  {pilot.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paddock & Pitwall Hero Photo — 5px Yellow Frosted Glass Border */}
      <div className="relative rounded-[32px] overflow-hidden border-[5px] border-amber-400/80 shadow-2xl bg-slate-950 group">
        <div className="aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden relative">
          <img
            src="/images/dmitry_team_leader_1794265021824.jpg"
            alt="Дмитрий Передний — лидер команды FSB Racing на питволле"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-red-600 text-white uppercase tracking-wider">
                Капитан команды FSB Racing
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                Forza Motorsport
              </span>
            </div>
            <h3 className="font-extrabold text-2xl sm:text-4xl text-white font-mono">
              Дмитрий Передний (FSB Sotik)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              «В нашей команде важна не физическая сила, а характер, выдержка и братское плечо товарища по гоночной серии.»
            </p>
          </div>
        </div>
      </div>

      {/* Team Values & Goals — 5px Yellow Frosted Glass Border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Философия FSB Racing
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Гонки, дружба и победа над обстоятельствами
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            В команде FSB Racing нет границ. Мы собираемся вместе в голосовых каналах, настраиваем машины, делимся телеметрией кругов и выходим на онлайн-старт плечом к плечу.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-white/90 p-5 rounded-2xl border border-amber-400/40 space-y-2 shadow-xs">
            <div className="text-2xl">🏁</div>
            <div className="font-bold text-base text-amber-800">Командные заезды</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Регулярные заезды в мультиплеере Forza Motorsport 7 и Forza Motorsport.
            </p>
          </div>

          <div className="bg-white/90 p-5 rounded-2xl border border-amber-400/40 space-y-2 shadow-xs">
            <div className="text-2xl">📻</div>
            <div className="font-bold text-base text-emerald-800">Прямые трансляции</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Стримы заездов от лица Дмитрия (FSB Sotik) с живым голосовым общением команды.
            </p>
          </div>

          <div className="bg-white/90 p-5 rounded-2xl border border-amber-400/40 space-y-2 shadow-xs">
            <div className="text-2xl">🤝</div>
            <div className="font-bold text-base text-purple-800">Взаимовыручка</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Своих на трассе не бросаем — тактика драфтинга, прикрытие позиций и совместный анализ ошибок.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
