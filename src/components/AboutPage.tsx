import React from 'react';
import { Trophy, Heart, Flame, Shield, Users, Sparkles, Gamepad2, Award, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { DmitryProfile } from '../types/donation';
import { NavTab } from '../types/navigation';

interface AboutPageProps {
  profile: DmitryProfile;
  onNavigate: (tab: NavTab) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ profile, onNavigate }) => {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* Hero Profile Block — Full Width with 5px Yellow Frosted Glass Border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar with Badges */}
          <div className="relative shrink-0">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl bg-white ring-4 ring-amber-400/25">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -right-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-purple-700 text-white font-extrabold text-xs shadow-md border-2 border-white flex items-center gap-1.5">
              <span>🏎️ FSB Sotik</span>
            </div>
          </div>

          {/* Bio text */}
          <div className="space-y-5 text-center md:text-left flex-1">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                <Gamepad2 className="w-4 h-4 text-amber-700" />
                <span>Стример Forza Motorsport 7 & Forza Motorsport · Команда FSB Racing</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
                Дмитрий Передний (FSB Sotik)
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Нижегородская область, Россия
                </span>
                <span>·</span>
                <span className="text-slate-900 font-bold">Лидер команды FSB Racing</span>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-4xl font-normal">
              Я не инженер и не программист. Я инвалид без пальцев на обеих руках. В 2006 году после тяжелейшего обморожения мне ампутировали пальцы на обеих кистях.
            </p>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-4xl font-medium">
              Долгие годы казалось, что полноценные соревновательные видеоигры и драйв автоспорта для меня недосягаемы. Но в <strong className="text-amber-800 font-bold">2017 году</strong> я купил себе приставку Xbox с игрой <strong className="text-amber-700 font-bold">Forza Motorsport 7</strong> в комплекте — и буквально «заболел» этой игрой.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
              Я выработал особую технику хвата геймпада и руля культями рук, адаптировал мертвые зоны стиков, чувствительность курков и отточил управление на сложнейших гоночных трассах мира. Сегодня я стримлю Forza Motorsport 7 и новую Forza Motorsport, участвую в онлайн-гонках и руковожу международной гоночной командой <strong className="text-amber-800 font-bold">FSB Racing</strong>!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3">
              <button
                onClick={() => onNavigate('donate')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-purple-600/25 border border-amber-300/40 hover:scale-105 active:scale-95 cursor-pointer transition-all"
              >
                <Heart className="w-4 h-4 fill-current text-amber-200" />
                <span>Поддержать Дмитрия (Донат)</span>
              </button>

              <button
                onClick={() => onNavigate('team')}
                className="px-8 py-3.5 rounded-2xl bg-white/90 hover:bg-amber-50 text-slate-800 font-bold text-sm flex items-center gap-2 border-[2px] border-amber-400/60 backdrop-blur-xl cursor-pointer shadow-sm transition-colors"
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>Команда FSB Racing</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Milestones — 5px Yellow Frosted Glass Border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
          <Trophy className="w-7 h-7 text-amber-600" />
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              История преодоления: от трагедии к автоспорту
            </h2>
            <p className="text-xs text-slate-500">
              Путь Дмитрия к Forza Motorsport и созданию гоночной команды FSB Racing
            </p>
          </div>
        </div>

        <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400/40">
          {[
            {
              year: '2006 год',
              title: 'Тяжелое обморожение и ампутация пальцев',
              desc: 'Трагический переломный момент. В результате сильнейшего обморожения Дмитрий потерял пальцы на обеих руках. Начался сложный период реабилитации, адаптации в быту и поиска новых ориентиров в жизни.',
              badge: 'Испытание воли',
              badgeColor: 'bg-red-50 text-red-800 border-red-300',
            },
            {
              year: '2017 год',
              title: 'Покупка Xbox с Forza Motorsport 7 — рождение страсти',
              desc: 'Дмитрий приобрёл игровую консоль Xbox, где в комплекте шла игра Forza Motorsport 7. Эта игра стала любовью с первого запуска. Вопреки диагнозу и отсутствию пальцев, Дмитрий начал упорно тренироваться, день за днем разрабатывая моторику культей рук для управления на геймпаде.',
              badge: 'Новая мечта',
              badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
            },
            {
              year: '2019 — 2022 годы',
              title: 'Выход на соревновательный уровень и стримы',
              desc: 'Тысячи часов заездов на легендарных трассах: Нюрбургринг Нордшляйфе, Спа-Франкоршам, Ле-Ман. Дмитрий освоил классы GT3, прототипы и кузовные гонки, открыл свой стрим-канал и собрал вокруг себя преданных зрителей, вдохновляя людей никогда не опускать руки.',
              badge: 'Стример & Пилот',
              badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
            },
            {
              year: 'Настоящее время',
              title: 'Основание команды FSB Racing и новая Forza Motorsport',
              desc: 'Создание собственной международной гоночной команды FSB Racing вместе с единомышленниками: FSB Bosfor (Волжский), FSB Forest (Германия) и FSB Sensei (Ирландия). Стримы новой Forza Motorsport, участие в сетевых лигах и заездах на выносливость.',
              badge: 'FSB Racing',
              badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative pl-9 space-y-2">
              <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-400/25 shadow-xs" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-800">{item.year}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[28px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-3xl shadow-inner">
            🎮
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Уникальный стиль управления</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Дмитрий использует тонкую настройку мертвых зон и чувствительности осей геймпада, удерживая контроллер кистями рук. Это требует ювелирной точности в каждом повороте на скорости 250+ км/ч.
          </p>
        </div>

        <div className="rounded-[28px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-3xl shadow-inner">
            🏆
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Командный дух FSB Racing</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Объединение друзей из разных стран: Россия (Нижегородская область и Волжский), Германия и Ирландия. Мы доказываем, что в автосимуляторах важны дружба, стратегия и воля к победе.
          </p>
        </div>

        <div className="rounded-[28px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-7 space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-3xl shadow-inner">
            🔥
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Пример для тысяч людей</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Своими стримами Дмитрий показывает, что инвалидность — не приговор. Даже без пальцев на руках можно побеждать в сложнейших гоночных симуляторах мира.
          </p>
        </div>
      </div>
      {/* Generated Images Showcase: Racing Gallery with 5px yellow frosted glass border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/80 backdrop-blur-2xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">
                Галерея автоспорта и команды FSB Racing
              </h2>
              <p className="text-xs text-slate-500">
                Визуальные хроники заездов Forza Motorsport, болидов и кокпита Дмитрия
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-center">
            3 фотокадра
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="group rounded-2xl overflow-hidden border-[3px] border-amber-400/60 bg-slate-900 shadow-sm hover:shadow-lg transition-all">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/images/dmitry_hero_racing_1794265020221.jpg"
                alt="Дмитрий Передний на питлейне трассы"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 bg-white space-y-1">
              <div className="font-bold text-xs text-slate-900">Питлейн и болид Porsche GT3</div>
              <p className="text-[11px] text-slate-500">
                Дмитрий в комбинезоне FSB Racing перед стартом заезда.
              </p>
            </div>
          </div>

          <div className="group rounded-2xl overflow-hidden border-[3px] border-amber-400/60 bg-slate-900 shadow-sm hover:shadow-lg transition-all">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/images/dmitry_sim_cockpit_1794265019873.jpg"
                alt="Дмитрий в симрейсинг кокпите с геймпадом Xbox"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 bg-white space-y-1">
              <div className="font-bold text-xs text-slate-900">Заезд в Forza Motorsport</div>
              <p className="text-[11px] text-slate-500">
                Управление культями рук на Xbox геймпаде и тройном экране.
              </p>
            </div>
          </div>

          <div className="group rounded-2xl overflow-hidden border-[3px] border-amber-400/60 bg-slate-900 shadow-sm hover:shadow-lg transition-all">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/images/dmitry_team_leader_1794265021824.jpg"
                alt="Дмитрий с гоночным шлемом на питволле"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 bg-white space-y-1">
              <div className="font-bold text-xs text-slate-900">Лидер команды FSB Racing</div>
              <p className="text-[11px] text-slate-500">
                Дмитрий со шлемом на питволле трассы во время марафона.
              </p>
            </div>
          </div>

          <div className="group rounded-2xl overflow-hidden border-[3px] border-amber-400/60 bg-slate-900 shadow-sm hover:shadow-lg transition-all">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/images/dmitry_paddock_garage_1794265022136.jpg"
                alt="Дмитрий в гараже команды рядом с суперкаром"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 bg-white space-y-1">
              <div className="font-bold text-xs text-slate-900">Гараж и боксы команды</div>
              <p className="text-[11px] text-slate-500">
                Инженерная подготовка болида к стримам и сетевым дуэлям.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
