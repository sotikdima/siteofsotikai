import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, Pause, RotateCcw, Trophy, Sparkles, Flag, Flame, Zap, Timer, Award } from 'lucide-react';
import { playTone } from '../utils/audio';

export const GamesPage: React.FC = () => {
  // --- RACING TIME ATTACK MINI-GAME ---
  const [track, setTrack] = useState<'nurburgring' | 'spa' | 'monza' | 'lemans'>('nurburgring');
  const [isRacing, setIsRacing] = useState(false);
  const [raceLapTime, setRaceLapTime] = useState(0);
  const [raceSpeed, setRaceSpeed] = useState(0);
  const [gear, setGear] = useState(1);
  const [apexSuccess, setApexSuccess] = useState<number>(0);
  const [apexPrompt, setApexPrompt] = useState<string | null>(null);
  const [raceBestLap, setRaceBestLap] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('fsb_best_lap') || '84.32');
    } catch {
      return 84.32;
    }
  });

  const trackInfo = {
    nurburgring: { name: 'Nürburgring Nordschleife', length: '20.83 км', turns: 73, record: '6:43.20' },
    spa: { name: 'Circuit de Spa-Francorchamps', length: '7.00 км', turns: 19, record: '2:16.80' },
    monza: { name: 'Autodromo Nazionale Monza', length: '5.79 км', turns: 11, record: '1:44.50' },
    lemans: { name: 'Circuit de la Sarthe (Le Mans)', length: '13.62 км', turns: 38, record: '3:50.10' },
  };

  useEffect(() => {
    if (!isRacing) return;

    const timer = setInterval(() => {
      setRaceLapTime((t) => parseFloat((t + 0.05).toFixed(2)));
      setRaceSpeed((s) => {
        if (s < 280) {
          const next = s + 4;
          if (next > 220) setGear(6);
          else if (next > 180) setGear(5);
          else if (next > 130) setGear(4);
          else if (next > 90) setGear(3);
          else if (next > 50) setGear(2);
          return next;
        }
        return 280;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isRacing]);

  useEffect(() => {
    if (!isRacing) return;

    const apexInterval = setInterval(() => {
      const directions = ['Торможение! [ПРОБЕЛ]', 'Апекс влево! [Кнопка ◀]', 'Апекс вправо! [Кнопка ▶]', 'Полный газ! [Кнопка ▲]'];
      const chosen = directions[Math.floor(Math.random() * directions.length)];
      setApexPrompt(chosen);
      playTone(660, 'sine', 0.08, 0.08);

      setTimeout(() => {
        setApexPrompt(null);
      }, 1800);
    }, 3500);

    return () => clearInterval(apexInterval);
  }, [isRacing]);

  const handleApexClick = () => {
    if (!apexPrompt) return;
    setApexSuccess((prev) => prev + 1);
    setApexPrompt(null);
    playTone(980, 'sine', 0.1, 0.1);
  };

  const startRace = () => {
    setRaceLapTime(0);
    setRaceSpeed(0);
    setGear(1);
    setApexSuccess(0);
    setApexPrompt(null);
    setIsRacing(true);
    playTone(440, 'triangle', 0.2, 0.1);
  };

  const finishRace = () => {
    setIsRacing(false);
    playTone(880, 'sine', 0.3, 0.15);
    if (raceLapTime > 0 && raceLapTime < raceBestLap) {
      setRaceBestLap(raceLapTime);
      try {
        localStorage.setItem('fsb_best_lap', String(raceLapTime));
      } catch {}
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
          <Flame className="w-4 h-4 text-amber-700" />
          <span>Симрейсинг & Forza Motorsport</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
          Игровая зона Дмитрия (FSB Sotik)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Всё о Forza Motorsport 7, новой Forza Motorsport, стримерских настройках управления без пальцев на руках и интерактивный симулятор заезда Time Attack.
        </p>
      </div>

      {/* Main Grid: Full Width across Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Time Attack Simulator with 5px Yellow Frosted Glass Border */}
        <div className="lg:col-span-7 rounded-[32px] border-[5px] border-amber-400/65 bg-white/80 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-7">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-400/40">
                🏎️
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Симулятор заезда FSB Time Attack</h2>
                <p className="text-xs text-slate-500">Тренировка реакции и взятия апексов поворотов</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Лучший круг</div>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-700">{raceBestLap} сек</div>
            </div>
          </div>

          {/* Track Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Выберите кольцевую трассу:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['nurburgring', 'spa', 'monza', 'lemans'] as const).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setTrack(tKey)}
                  className={`py-3 px-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border text-center truncate ${
                    track === tKey
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/30 scale-[1.02]'
                      : 'bg-slate-100/90 hover:bg-white text-slate-700 border-amber-400/40'
                  }`}
                >
                  {trackInfo[tKey].name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="text-xs text-amber-800 pt-1 font-mono">
              {trackInfo[track].name} · Длина: {trackInfo[track].length} · Поворотов: {trackInfo[track].turns}
            </div>
          </div>

          {/* Dashboard Telemetry */}
          <div className="p-6 rounded-2xl bg-amber-50/40 border-[2px] border-amber-400/40 space-y-4 shadow-inner">
            <div className="grid grid-cols-3 gap-3.5 text-center">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] uppercase text-slate-500 font-mono">Скорость</div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-700">
                  {raceSpeed} <span className="text-xs text-slate-500 font-normal">км/ч</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] uppercase text-slate-500 font-mono">Передача</div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-700">
                  {gear}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] uppercase text-slate-500 font-mono">Время круга</div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-700">
                  {raceLapTime.toFixed(2)} с
                </div>
              </div>
            </div>

            {/* Apex Quick-Time Event Box */}
            <div className="min-h-[80px] flex items-center justify-center p-4 rounded-xl bg-white border border-amber-400/40 text-center shadow-xs">
              {isRacing ? (
                apexPrompt ? (
                  <button
                    onClick={handleApexClick}
                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm sm:text-base animate-pulse shadow-md shadow-red-600/30 cursor-pointer flex items-center gap-2 border border-white/30"
                  >
                    <span>{apexPrompt}</span>
                    <span className="text-xs bg-black/40 px-2 py-0.5 rounded">ЖМИ СЕЙЧАС!</span>
                  </button>
                ) : (
                  <div className="text-xs sm:text-sm text-emerald-700 font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Болид на идеальной траектории... Ждите следующий поворот!</span>
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-500">
                  Нажмите кнопку ниже, чтобы начать заезд на время Time Attack!
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isRacing ? (
              <button
                onClick={startRace}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-amber-400/25 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Начать заезд Time Attack</span>
              </button>
            ) : (
              <button
                onClick={finishRace}
                className="flex-1 py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Завершить круг (Флаг)</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsRacing(false);
                setRaceLapTime(0);
                setRaceSpeed(0);
                setGear(1);
              }}
              className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs border border-slate-300 cursor-pointer"
            >
              Сброс
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Secret of playing without fingers with 5px Yellow Frosted Glass Border */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-2xl shadow-inner">
                🎮
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Секреты управления без пальцев
                </h3>
                <p className="text-xs text-slate-500">Опыт Дмитрия (FSB Sotik)</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              «После обморожения и ампутации пальцев в 2006 году я перепробовал множество хватов. Для Forza Motorsport я выставил внутреннюю мертвую зону стиков на <strong>0-1%</strong>, а внешнюю на <strong>95%</strong>, чтобы малейшее движение культи кисти руки давало мгновенный отклик на рулежку болида.»
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-200 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Линейность рулевого управления:</span>
                <span className="font-mono font-bold text-amber-800">50% (Прямая)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Мертвая зона тормоза (ABS):</span>
                <span className="font-mono font-bold text-emerald-700">Отключена</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Коробка передач:</span>
                <span className="font-mono font-bold text-purple-800">Механика со сцеплением</span>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border-[5px] border-amber-400/60 bg-white/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_25px_rgba(251,191,36,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>Основные дисциплины на стримах</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-400/40 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-800">Forza Motorsport 7</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">Куплена в 2017</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Та самая легендарная игра, с которой всё началось на Xbox. Огромный автопарк и классическая физика заноса.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-amber-400/40 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-800">Forza Motorsport (2023)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">Актуальные стримы</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Новейший симулятор с реалистичным износом резины, динамической погодой и мультиплеерными рейтинговыми гонками.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
