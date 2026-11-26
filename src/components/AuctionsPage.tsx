import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Trophy,
  Clock,
  Flame,
  CheckCircle2,
  User,
  ShieldCheck,
  History,
  Car,
  ExternalLink,
} from 'lucide-react';
import { AuctionLot } from '../types/auction';
import { INITIAL_AUCTIONS, GT3_CARS, getNextStreamTimestampMs } from '../data/auctionData';
import { formatRubles, buildYooMoneyDirectLink } from '../utils/yoomoney';
import { playTone } from '../utils/audio';
import {
  loadAuctionsWithLiveTimers,
  saveAuctionsState,
  formatAuctionCountdown,
  formatExactLocalTime,
  formatMskDateTime,
} from '../utils/auctionsState';
import { isFirebaseConfigured } from '../firebase/chat';
import { subscribeToAuctions, placeAuctionBid } from '../firebase/auctions';

interface AuctionsPageProps {
  onNavigateToDonations: () => void;
  onNavigateToSite: () => void;
  yoomoneyWallet?: string;
}

export const AuctionsPage: React.FC<AuctionsPageProps> = ({
  onNavigateToDonations,
  yoomoneyWallet = '4100117753597226',
}) => {
  const [auctions, setAuctions] = useState<AuctionLot[]>(() => loadAuctionsWithLiveTimers());
  const [isFirebaseOnline] = useState<boolean>(() => isFirebaseConfigured());

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLotId, setActiveLotId] = useState<string>(auctions[0]?.id || 'auc_1');
  const [bidderName, setBidderName] = useState<string>(() => {
    try {
      return localStorage.getItem('sotik_bidder_name') || '';
    } catch {
      return '';
    }
  });
  const [addBidAmount, setAddBidAmount] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<string>(GT3_CARS[0] || '');
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);
  const [bidPaymentUrl, setBidPaymentUrl] = useState<string | null>(null);
  const [bidPaymentAmount, setBidPaymentAmount] = useState<number>(0);
  const [bidErrorMessage, setBidErrorMessage] = useState<string | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);

  // Sync to localStorage so СотикБот always reads live auction & car state
  useEffect(() => {
    saveAuctionsState(auctions);
  }, [auctions]);

  // Real-time online subscription to Firebase auctions/lots
  useEffect(() => {
    if (!isFirebaseOnline) return;
    const unsub = subscribeToAuctions(INITIAL_AUCTIONS, (remoteLots) => {
      setAuctions(remoteLots);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [isFirebaseOnline]);

  // Real-time countdown timer synced to 20:00 MSK stream start / lot endsAt
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setAuctions((prev) =>
        prev.map((lot) => {
          const rawEnds = lot.endsAt ?? getNextStreamTimestampMs(now);
          const endsAt = rawEnds <= now ? getNextStreamTimestampMs(now) : rawEnds;
          const timeLeftSeconds = Math.max(0, Math.round((endsAt - now) / 1000));
          return {
            ...lot,
            endsAt,
            timeLeftSeconds,
            status: timeLeftSeconds === 0 ? 'completed' : 'active',
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLot = auctions.find((a) => a.id === activeLotId) || auctions[0];
  const parsedAddAmount = (() => {
    const val = parseFloat(addBidAmount);
    return Number.isFinite(val) && val > 0 ? val : 0;
  })();
  const previewNewBid = activeLot
    ? activeLot.currentBid + (parsedAddAmount > 0 ? parsedAddAmount : activeLot.minStep)
    : 0;

  const nextStreamTargetMs = activeLot?.endsAt ?? getNextStreamTimestampMs();

  const handlePlaceBid = async () => {
    if (!activeLot || isSubmittingBid) return;
    setBidErrorMessage(null);
    setBidPaymentUrl(null);
    setBidPaymentAmount(0);

    const cleanName = bidderName.trim() || 'Зритель FSB Racing';
    const addVal = parsedAddAmount;
    if (addBidAmount.trim() !== '' && addVal < 10) {
      setBidErrorMessage('Минимальная прибавка к ставке — 10 ₽.');
      return;
    }

    const finalBid = addVal > 0 ? activeLot.currentBid + addVal : activeLot.currentBid + activeLot.minStep;
    const chosenCar = activeLot.category === 'car' ? selectedCar : undefined;

    if (finalBid <= activeLot.currentBid) {
      setBidErrorMessage(`Ставка должна быть больше текущей (${formatRubles(activeLot.currentBid)})!`);
      return;
    }

    setIsSubmittingBid(true);
    try {
      if (isFirebaseOnline) {
        const res = await placeAuctionBid(activeLot.id, cleanName, finalBid, chosenCar);
        if (!res.ok) {
          setBidErrorMessage(res.error || 'Не удалось разместить ставку');
          return;
        }
      } else {
        const newBidRecord = {
          id: `bid_${Date.now()}`,
          bidder: cleanName,
          amount: finalBid,
          time: 'Только что',
          ...(chosenCar ? { car: chosenCar } : {}),
        };

        setAuctions((prev) =>
          prev.map((lot) => {
            if (lot.id === activeLot.id) {
              return {
                ...lot,
                currentBid: finalBid,
                leaderName: cleanName,
                ...(chosenCar ? { selectedCar: chosenCar } : {}),
                bidsCount: lot.bidsCount + 1,
                bidsHistory: [newBidRecord, ...lot.bidsHistory],
              };
            }
            return lot;
          })
        );
      }

      try {
        localStorage.setItem('sotik_bidder_name', cleanName);
      } catch {}

      if (addVal > 0 && yoomoneyWallet) {
        const payLink = buildYooMoneyDirectLink(
          yoomoneyWallet,
          addVal,
          `Ставка на лот "${activeLot.title}"${chosenCar ? ` (${chosenCar})` : ''}: ${formatRubles(finalBid)}`
        );
        setBidPaymentUrl(payLink);
        setBidPaymentAmount(addVal);
      }

      setAddBidAmount('');
      setBidSuccessMessage(
        chosenCar
          ? `Ставка ${formatRubles(finalBid)} принята! Выбран болид: ${chosenCar}`
          : `Поздравляем! Ваша ставка ${formatRubles(finalBid)} принята и лидирует в лоте!`
      );
      playTone(880, 'sine', 0.12, 0.12);

      setTimeout(() => {
        setBidSuccessMessage(null);
      }, 6500);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const filteredAuctions =
    selectedCategory === 'all'
      ? auctions
      : auctions.filter((a) => a.category === selectedCategory);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-12 animate-fade-in text-slate-900">
      {/* Hero Banner for АукционыСотика with 5px yellow frosted border */}
      <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/85 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-6">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
          <Gavel className="w-4 h-4 text-amber-700" />
          <span>Интерактивные аукционы зрителей стримов Дмитрия (FSB Sotik)</span>
        </div>

        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950">
            Аукционы
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-slate-900">
              Сотика
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Здесь зрители определяют ход стримов Forza Motorsport! Боритесь за право выбрать автомобиль GT3 для гонки, выиграть заезд 1 на 1 против Дмитрия, получить индивидуальный тюнинг от команды FSB Racing или фирменный мерч с автографом.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-300 text-xs text-amber-900 font-bold font-mono shadow-xs flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Активных лотов: {auctions.length}</span>
          </div>

          <div className="bg-purple-50 px-5 py-2.5 rounded-2xl border border-purple-300 text-xs text-purple-950 font-bold font-mono shadow-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span>
              Старт стрима: 20:00 МСК (у вас в {formatExactLocalTime(nextStreamTargetMs)})
            </span>
          </div>

          {isFirebaseOnline && (
            <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-300 text-xs text-emerald-900 font-bold font-mono shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Онлайн-аукцион: ставки общие для всех зрителей</span>
            </div>
          )}

          <div className="bg-slate-100 px-5 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-700 font-semibold shadow-xs">
            Оплата выигранных ставок через сервис «ДонатыСотика»
          </div>

          <button
            onClick={onNavigateToDonations}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
          >
            Перейти в ДонатыСотика →
          </button>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Все лоты' },
          { id: 'car', label: '🏎️ Выбор авто' },
          { id: 'race', label: '⚔️ Гонка 1 на 1' },
          { id: 'tune', label: '🔧 Тюнинг & Телеметрия' },
          { id: 'track', label: '🏁 Выбор трассы' },
          { id: 'special', label: '🎁 Мерч & Автограф' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/25 scale-[1.02]'
                : 'bg-white/90 hover:bg-amber-50 text-slate-700 border-amber-400/35'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Active Selected Lot Bidding Cockpit (7 cols) + Lots List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Active Lot Bidding Box with 5px yellow frosted border */}
        {activeLot && (
          <div className="lg:col-span-7 rounded-[32px] border-[5px] border-amber-400/65 bg-white/85 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
              <div>
                <span className="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {activeLot.categoryLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">
                  {activeLot.title}
                </h2>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center sm:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>До старта стрима (20:00 МСК):</span>
                </div>
                <div className="font-mono text-base font-extrabold text-amber-800 tabular-nums">
                  {formatAuctionCountdown(activeLot.timeLeftSeconds)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {formatMskDateTime(nextStreamTargetMs)}
                </div>
              </div>
            </div>

            {/* Image Preview Banner */}
            <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden border-[2px] border-amber-400/40 shadow-sm bg-slate-900">
              <img
                src={activeLot.imageUrl}
                alt={activeLot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent flex items-end p-5">
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                  {activeLot.description}
                </p>
              </div>
            </div>

            {/* Current Bid Display */}
            <div className="p-6 rounded-2xl bg-amber-50/50 border-[2px] border-amber-400/40 space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase text-slate-500 font-mono font-bold">
                    Текущая лидирующая ставка
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-950 mt-1 tabular-nums">
                    {formatRubles(activeLot.currentBid)}
                  </div>
                  {activeLot.category === 'car' && activeLot.selectedCar && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Car className="w-3.5 h-3.5 text-amber-600" />
                      <span>Лидирует авто: {activeLot.selectedCar}</span>
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs uppercase text-slate-500 font-mono font-bold">
                    Лидер торгов
                  </div>
                  <div className="text-base font-bold text-amber-800 flex items-center sm:justify-end gap-1.5 mt-1">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>{activeLot.leaderName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    Всего ставок: {activeLot.bidsCount}
                  </div>
                </div>
              </div>

              {/* Quick Raise Buttons (add to custom increment field) */}
              <div className="pt-3 border-t border-amber-200/70 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Быстро повысить ставку (добавить к полю):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[activeLot.minStep, activeLot.minStep * 2, 500, 1000].map((step, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setAddBidAmount((prev) => String((parseFloat(prev) || 0) + step))
                      }
                      className="py-3 px-3 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-300 font-mono font-bold text-xs text-slate-900 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      +{step} ₽
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Bid Form + GT3 Car Selector */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ваше имя / никнейм..."
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="number"
                    placeholder="Прибавка к ставке (мин. 10 ₽)"
                    value={addBidAmount}
                    onChange={(e) => setAddBidAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {activeLot.category === 'car' && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="gt3-car-select"
                      className="block text-xs font-bold text-amber-800 uppercase tracking-wider"
                    >
                      Выберите GT3-машину для стрима:
                    </label>
                    <select
                      id="gt3-car-select"
                      value={selectedCar}
                      onChange={(e) => setSelectedCar(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {GT3_CARS.map((car) => (
                        <option key={car} value={car}>
                          {car}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSubmittingBid}
                  onClick={() => void handlePlaceBid()}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-amber-400/25 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Gavel className="w-5 h-5 text-slate-950" />
                  <span>{isSubmittingBid ? 'Отправляем ставку...' : 'Сделать ставку на лот'}</span>
                </button>

                {parsedAddAmount > 0 && (
                  <div className="text-xs text-slate-600 flex justify-between items-center px-1">
                    <span>
                      К оплате:{' '}
                      <span className="font-mono font-bold text-amber-800">
                        {formatRubles(parsedAddAmount)}
                      </span>{' '}
                      <span className="text-slate-500">
                        · новая ставка: {formatRubles(previewNewBid)}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500">оплата через ЮMoney</span>
                  </div>
                )}
              </div>

              {bidSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 text-center space-y-2 animate-fade-in">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{bidSuccessMessage}</span>
                  </div>
                  {bidPaymentUrl && bidPaymentAmount > 0 && (
                    <div>
                      <a
                        href={bidPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-sm transition-colors"
                      >
                        <span>Перейти к оплате {formatRubles(bidPaymentAmount)} в ЮMoney</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {bidErrorMessage && (
                <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-xs font-bold text-red-800 text-center flex items-center justify-center gap-2 animate-fade-in">
                  <span>⚠️ {bidErrorMessage}</span>
                </div>
              )}
            </div>

            {/* Bids History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-mono">
                <History className="w-4 h-4 text-amber-600" />
                <span>История ставок лота:</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                {activeLot.bidsHistory.map((bh, idx) => (
                  <div key={bh.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{bh.bidder}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({bh.time})</span>
                      {bh.car && (
                        <span
                          className="text-[10px] text-amber-700 font-semibold truncate max-w-[200px]"
                          title={bh.car}
                        >
                          🏎️ {bh.car}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-amber-800 shrink-0 tabular-nums">
                      {formatRubles(bh.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: All Lots List with 5px yellow frosted borders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>Все аукционные лоты</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{filteredAuctions.length} лотов</span>
          </div>

          <div className="space-y-4">
            {filteredAuctions.map((lot) => {
              const isSelected = lot.id === activeLotId;
              return (
                <div
                  key={lot.id}
                  onClick={() => setActiveLotId(lot.id)}
                  className={`p-5 rounded-2xl border-[3px] transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-400/30'
                      : 'border-amber-400/40 bg-white/85 hover:border-amber-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {lot.categoryLabel}
                    </span>
                    <span className="text-[11px] font-mono text-amber-800 font-bold tabular-nums">
                      {formatAuctionCountdown(lot.timeLeftSeconds)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{lot.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{lot.description}</p>
                    {lot.category === 'car' && lot.selectedCar && (
                      <p className="text-[11px] text-amber-800 font-semibold mt-1.5 truncate">
                        🏎️ Выбранный болид: {lot.selectedCar}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Текущая ставка:
                      </span>
                      <span className="font-mono font-extrabold text-sm text-slate-950 tabular-nums">
                        {formatRubles(lot.currentBid)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Лидер:</span>
                      <span className="font-bold text-amber-800 text-xs">{lot.leaderName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules & Transparency Notice */}
          <div className="p-6 rounded-2xl bg-white/85 border-[3px] border-amber-400/40 space-y-3 text-xs text-slate-600 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Правила торгов и получения лота:</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
              <li>
                Аукционы завершаются к началу стрима — ровно в <strong>20:00 МСК</strong>.
              </li>
              <li>
                Победитель связывается с Дмитрием во время или после стрима через Discord или email: sotikdima@gmail.com.
              </li>
              <li>
                Сумма выигранной ставки переводится в фонд стрима через раздел «ДонатыСотика» (любым удобным банком, СБП или ЮMoney).
              </li>
              <li>
                Все заезды, выбранные GT3-болиды и тюнинги реализуются прямо в прямом эфире на Twitch канале fsbsotik!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
