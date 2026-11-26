import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  Bell,
  Zap,
  Cloud,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Heart,
  MessageSquare,
  User,
  ArrowRight,
  HelpCircle,
  Smartphone,
  Info,
  Loader2,
} from 'lucide-react';
import { DmitryProfile, DmitryTransfer, DonationServiceId } from '../types/donation';
import { ChatMessage } from '../types/chat';
import { DONATION_SERVICES_LIST, ACTIVE_DONATION_SERVICES_LIST } from '../data/mockData';
import { formatRubles, buildYooMoneyDirectLink, createYooKassaPayment } from '../utils/yoomoney';
import { isFirebaseConfigured, publishSiteMessage } from '../firebase/chat';

interface DmitryDonationPageProps {
  profile: DmitryProfile;
  transfers: DmitryTransfer[];
  viewMode: 'desktop' | 'laptop' | 'mobile';
  onAddTransfer: (transfer: DmitryTransfer) => void;
  onUpdateWallet: (newWallet: string) => void;
}

export const DmitryDonationPage: React.FC<DmitryDonationPageProps> = ({
  profile,
  transfers,
  viewMode = 'desktop',
  onAddTransfer,
  onUpdateWallet,
}) => {
  const isMobile = viewMode === 'mobile';
  const isLaptop = viewMode === 'laptop';
  const [selectedService, setSelectedService] = useState<DonationServiceId>('yoomoney');

  // YooMoney form state
  const [yooPreset, setYooPreset] = useState<number>(500);
  const [yooCustom, setYooCustom] = useState<string>('');
  const [yooPaidAmount, setYooPaidAmount] = useState<number>(500);
  const [yooSenderName, setYooSenderName] = useState<string>('');
  const [yooIsAnon, setYooIsAnon] = useState<boolean>(false);
  const [yooMessage, setYooMessage] = useState<string>('');
  const [yooStep, setYooStep] = useState<'pay' | 'message' | 'done'>('pay');
  const [yooLoading, setYooLoading] = useState<boolean>(false);
  const [yooError, setYooError] = useState<string | null>(null);
  const [yooConfirmationUrl, setYooConfirmationUrl] = useState<string | null>(null);

  // Bank transfer notice form state
  const [bankSender, setBankSender] = useState<string>('');
  const [bankAmount, setBankAmount] = useState<string>('500');
  const [bankMsg, setBankMsg] = useState<string>('');
  const [bankSubmitted, setBankSubmitted] = useState<boolean>(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Streamer services (DonationAlerts / CloudTips) notice form state
  const [streamerSender, setStreamerSender] = useState<string>('');
  const [streamerAmount, setStreamerAmount] = useState<string>('500');
  const [streamerMsg, setStreamerMsg] = useState<string>('');
  const [streamerSubmitted, setStreamerSubmitted] = useState<boolean>(false);
  const [streamerError, setStreamerError] = useState<string | null>(null);

  // Copy states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ''));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const activeYooAmount = yooCustom ? parseFloat(yooCustom) || 0 : yooPreset;

  const handleYooPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeYooAmount < 10) {
      setYooError('Минимальная сумма доната — 10 ₽');
      return;
    }

    const finalSender = yooIsAnon ? 'Аноним' : yooSenderName.trim() || 'Зритель стрима';
    const finalMessage = yooMessage.trim() || 'Поддержка стрима Дмитрия (FSB Sotik)';

    setYooLoading(true);
    setYooError(null);
    setYooConfirmationUrl(null);
    setYooPaidAmount(activeYooAmount);

    try {
      const result = await createYooKassaPayment({
        amount: activeYooAmount,
        name: finalSender,
        message: finalMessage,
      });
      if (result.paymentId) {
        try {
          sessionStorage.setItem('yy_pending', result.paymentId);
        } catch {}
      }
      setYooConfirmationUrl(result.confirmationUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось создать счёт ЮKassa';
      setYooError(msg);
    } finally {
      setYooLoading(false);
    }
  };

  const publishDonationToSiteChat = async (params: {
    id: string;
    author: string;
    amount: number;
    text: string;
    service: 'yoomoney' | 'sber' | 'tbank' | 'donationalerts' | 'cloudtips';
    channelLabel: string;
  }) => {
    if (!isFirebaseConfigured()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const chatMsg: ChatMessage = {
      id: params.id,
      author: params.author,
      text: params.text,
      time: timeStr,
      badge: params.channelLabel,
      badgeColor: 'bg-amber-400 text-slate-950',
      color: '#7c3aed',
      donation: {
        amount: params.amount,
        currency: 'RUB',
        service: params.service,
        status: 'pending',
        targetWallet: profile.yoomoneyWallet,
        channelLabel: params.channelLabel,
      },
    };
    await publishSiteMessage(chatMsg);
  };

  const handleYooMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = yooMessage.trim();
    if (!cleanMsg) {
      setYooError('Напишите текст сообщения для Дмитрия перед публикацией.');
      return;
    }
    setYooError(null);
    const finalSender = yooIsAnon ? 'Аноним' : yooSenderName.trim() || 'Зритель стрима';
    const transferId = `tr_${Date.now()}`;
    const newTr: DmitryTransfer = {
      id: transferId,
      senderName: finalSender,
      isAnonymous: yooIsAnon,
      amount: yooPaidAmount,
      message: cleanMsg,
      timestamp: 'Только что',
      status: 'completed',
    };
    onAddTransfer(newTr);
    await publishDonationToSiteChat({
      id: transferId,
      author: finalSender,
      amount: yooPaidAmount,
      text: cleanMsg,
      service: 'yoomoney',
      channelLabel: 'ЮMoney',
    });
    setYooStep('done');
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = bankMsg.trim();
    if (!cleanMsg) {
      setBankError('Напишите сообщение для Дмитрия перед публикацией.');
      return;
    }
    setBankError(null);
    const amountNum = Math.max(10, parseFloat(bankAmount) || 500);
    const finalSender = bankSender.trim() || 'Болельщик FSB Racing';
    const serviceId = selectedService === 'tbank' ? 'tbank' : 'sber';
    const channelLabel = serviceId === 'tbank' ? 'Т-Банк' : 'СберБанк';
    const transferId = `tr_bank_${Date.now()}`;
    const newTr: DmitryTransfer = {
      id: transferId,
      senderName: finalSender,
      isAnonymous: false,
      amount: amountNum,
      message: cleanMsg,
      timestamp: 'Только что',
      status: 'completed',
    };
    onAddTransfer(newTr);
    await publishDonationToSiteChat({
      id: transferId,
      author: finalSender,
      amount: amountNum,
      text: cleanMsg,
      service: serviceId,
      channelLabel,
    });
    setBankSubmitted(true);
    setBankMsg('');
    setTimeout(() => {
      setBankSubmitted(false);
    }, 5000);
  };

  const handleStreamerMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = streamerMsg.trim();
    if (!cleanMsg) {
      setStreamerError('Напишите сообщение для Дмитрия перед публикацией.');
      return;
    }
    setStreamerError(null);
    const amountNum = Math.max(10, parseFloat(streamerAmount) || 500);
    const finalSender = streamerSender.trim() || 'Зритель стрима';
    const serviceId = selectedService === 'cloudtips' ? 'cloudtips' : 'donationalerts';
    const channelLabel = serviceId === 'cloudtips' ? 'CloudTips' : 'DonationAlerts';
    const transferId = `tr_str_${Date.now()}`;
    const newTr: DmitryTransfer = {
      id: transferId,
      senderName: finalSender,
      isAnonymous: false,
      amount: amountNum,
      message: cleanMsg,
      timestamp: 'Только что',
      status: 'completed',
    };
    onAddTransfer(newTr);
    await publishDonationToSiteChat({
      id: transferId,
      author: finalSender,
      amount: amountNum,
      text: cleanMsg,
      service: serviceId,
      channelLabel,
    });
    setStreamerSubmitted(true);
    setStreamerMsg('');
    setTimeout(() => {
      setStreamerSubmitted(false);
    }, 5000);
  };

  const activeServiceObj =
    ACTIVE_DONATION_SERVICES_LIST.find((s) => s.id === selectedService) ||
    ACTIVE_DONATION_SERVICES_LIST[0];

  return (
    <div className={`w-full ${isMobile ? 'px-3 sm:px-4 py-4 space-y-6 max-w-lg mx-auto' : 'px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6 sm:py-10 space-y-10'} animate-fade-in text-slate-900`}>
      {/* Header Banner — Liquid Glass */}
      <div className="glass" data-rain="8">
        <div className="glass-rain" />
        <div className={`glass-body ${isMobile ? '!p-5 sm:!p-6 space-y-4' : '!p-8 sm:!p-12 space-y-4'}`}>
          <div className={`flex ${isMobile ? 'flex-col items-center text-center gap-4' : 'flex-col sm:flex-row sm:items-center justify-between gap-6'}`}>
            <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-5`}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl bg-white">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-extrabold text-white shadow-xs border-2 border-white">
                  LIVE
                </div>
              </div>

              <div className="space-y-1">
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'} font-extrabold tracking-tight text-slate-950`}>
                  Поддержать стримы Дмитрия (FSB Sotik)
                </h1>
                <p className="text-xs sm:text-base text-slate-700 max-w-2xl leading-relaxed">
                  Команда <strong className="text-amber-800">FSB Racing</strong> · Стримы <span className="text-amber-700 font-semibold">Forza Motorsport 7 & Forza Motorsport</span>. Донаты помогают развивать канал, улучшать оборудование и проводить гоночные турниры!
                </p>
              </div>
            </div>

            <div className={`bg-amber-50/90 backdrop-blur-xl px-5 py-3 rounded-2xl border-[2px] border-amber-400/40 text-xs space-y-1 shrink-0 ${isMobile ? 'w-full text-center' : 'text-left sm:text-right'} shadow-xs`}>
              <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Получатель</div>
              <div className="font-extrabold text-base text-slate-900">Дмитрий Передний</div>
              <div className="text-slate-600 text-xs">Нижегородская область</div>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE SELECTOR TABS — Liquid Glass */}
      <div className="glass" data-rain="8">
        <div className="glass-rain" />
        <div className={`glass-body ${isMobile ? '!p-4 sm:!p-5' : '!p-6 sm:!p-8'} space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-xs sm:text-sm font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Выберите способ доната:</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {ACTIVE_DONATION_SERVICES_LIST.length} активных сервиса поддержки
          </span>
        </div>

        {/* Active Services Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 sm:grid-cols-3 gap-4'}`}>
          {ACTIVE_DONATION_SERVICES_LIST.map((svc) => {
            const isSelected = selectedService === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => {
                  setSelectedService(svc.id);
                  setYooStep('pay');
                  setYooError(null);
                  setBankSubmitted(false);
                  setBankError(null);
                  setStreamerSubmitted(false);
                  setStreamerError(null);
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-[1.02]'
                    : 'bg-white/90 hover:bg-amber-50/80 border-amber-400/40 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl sm:text-3xl">{svc.icon}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                    {svc.badge}
                  </span>
                </div>
                <div className="text-left w-full">
                  <div className="text-sm sm:text-base font-extrabold truncate text-slate-900">
                    {svc.name}
                  </div>
                  <div className={`text-xs truncate ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                    {svc.category === 'wallet' ? 'Электронный кошелёк' : svc.category === 'bank' ? 'Банк / СБП' : 'Стрим-алерт в эфире'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* ACTIVE SERVICE CONTENT AREA — Full Width Grid / Vertical Stack */}
      <div className={isMobile ? 'flex flex-col gap-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'}>
        {/* Left Column (7 cols): Selected service details & interactive action */}
        <div className={isMobile ? 'w-full' : 'lg:col-span-7'}>
          {/* ========================================================= */}
          {/* 1. YOOMONEY TAB */}
          {/* ========================================================= */}
          {selectedService === 'yoomoney' && (
            <div className="glass" data-rain="8">
              <div className="glass-rain" />
              <div className="glass-body !p-7 sm:!p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#8038d1] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-400/40">
                    Ю
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Перевод через ЮMoney
                    </h2>
                    <p className="text-xs text-slate-500">
                      Прямой перевод на верифицированный кошелёк Дмитрия Переднего
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  Без комиссии
                </span>
              </div>

              {/* Wallet number bar with copy */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border-[2px] border-amber-400/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase font-mono">
                  <span>Номер кошелька ЮMoney</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Верифицирован
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-lg sm:text-2xl font-bold text-slate-950 tracking-wider">
                    {profile.yoomoneyWallet.replace(/(\d{4})/g, '$1 ').trim()}
                  </span>
                  <button
                    onClick={() => handleCopy(profile.yoomoneyWallet, 'yoomoney')}
                    className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'yoomoney' ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-950" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 1: Amount & YooKassa Worker Checkout */}
              {yooStep === 'pay' && (
                <form onSubmit={handleYooPaySubmit} className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Выберите сумму поддержки:
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[250, 500, 1000, 5000].map((preset) => {
                        const isSel = !yooCustom && yooPreset === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setYooPreset(preset);
                              setYooCustom('');
                              setYooConfirmationUrl(null);
                            }}
                            className={`py-3.5 rounded-2xl text-center text-sm font-mono font-bold transition-all cursor-pointer border ${
                              isSel
                                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/30 scale-[1.02]'
                                : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400'
                            }`}
                          >
                            {preset.toLocaleString('ru-RU')} ₽
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        step="1"
                        placeholder="Или введите свою сумму в рублях..."
                        value={yooCustom}
                        onChange={(e) => {
                          setYooCustom(e.target.value);
                          setYooConfirmationUrl(null);
                        }}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-amber-400/50 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 shadow-xs"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-amber-700">
                        ₽ (RUB)
                      </span>
                    </div>
                  </div>

                  {/* Donor name & message passed to YooKassa Worker & YooMoney */}
                  <div className="space-y-3 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="yoo-sender-input" className="text-xs font-semibold text-slate-700">
                          Ваше имя / никнейм:
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={yooIsAnon}
                            onChange={(e) => setYooIsAnon(e.target.checked)}
                            className="w-3.5 h-3.5 text-amber-500 rounded bg-white border-slate-300"
                          />
                          <span>Анонимно</span>
                        </label>
                      </div>
                      <input
                        id="yoo-sender-input"
                        type="text"
                        disabled={yooIsAnon}
                        placeholder={yooIsAnon ? 'Аноним' : 'Ник в чате / имя...'}
                        value={yooIsAnon ? '' : yooSenderName}
                        onChange={(e) => {
                          setYooSenderName(e.target.value);
                          setYooConfirmationUrl(null);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 disabled:bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="yoo-message-input" className="text-xs font-semibold text-slate-700">
                          Сообщение для чата и стрима:
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {yooMessage.length} / 180
                        </span>
                      </div>
                      <textarea
                        id="yoo-message-input"
                        rows={2}
                        maxLength={180}
                        placeholder="Напишите пожелание Дмитрию или команде FSB Racing..."
                        value={yooMessage}
                        onChange={(e) => {
                          setYooMessage(e.target.value);
                          setYooConfirmationUrl(null);
                          setYooError(null);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        Сообщение автоматически передаётся в счёт ЮKassa, в «ЧатикСотика» и в перевод на кошелёк.
                      </p>
                    </div>
                  </div>

                  {yooError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                      {yooError}
                    </div>
                  )}

                  {yooConfirmationUrl ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>✓ Счёт ЮKassa на {formatRubles(yooPaidAmount)} создан</span>
                        <button
                          type="button"
                          onClick={() => setYooConfirmationUrl(null)}
                          className="text-emerald-700 underline cursor-pointer"
                        >
                          Изменить
                        </button>
                      </div>
                      <a
                        href={yooConfirmationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 px-6 rounded-2xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg flex items-center justify-center gap-2.5 cursor-pointer text-base sm:text-lg"
                      >
                        <span>Перейти к оплате {formatRubles(yooPaidAmount)} в ЮKassa</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <p className="text-[11px] text-emerald-800 text-center">
                        После успешной оплаты донат автоматически отобразится в «ЧатикСотика» через вебхук ЮKassa!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={yooLoading}
                        className="w-full py-4 px-6 rounded-2xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:via-purple-500 hover:to-pink-500 active:scale-[0.99] shadow-xl shadow-purple-600/25 border border-amber-300/40 flex items-center justify-center gap-2.5 cursor-pointer text-base sm:text-lg disabled:opacity-60"
                      >
                        {yooLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Создаём счёт ЮKassa...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>Создать счёт ЮKassa: {formatRubles(activeYooAmount)}</span>
                          </>
                        )}
                      </button>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
                        <a
                          href={buildYooMoneyDirectLink(
                            profile.yoomoneyWallet,
                            Math.max(10, activeYooAmount),
                            yooMessage.trim() || undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 font-bold inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Прямой перевод на кошелёк ЮMoney</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setYooPaidAmount(activeYooAmount);
                            setYooStep('message');
                          }}
                          className="text-amber-700 hover:text-amber-900 hover:underline cursor-pointer font-semibold"
                        >
                          Уже перевели на кошелёк? Оставить сообщение
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Step 2: Leave message */}
              {yooStep === 'message' && (
                <form onSubmit={handleYooMessageSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex justify-between items-center">
                    <span>Сумма: <strong className="text-slate-950 text-sm">{formatRubles(yooPaidAmount)}</strong></span>
                    <button
                      type="button"
                      onClick={() => setYooStep('pay')}
                      className="text-amber-800 underline cursor-pointer font-bold"
                    >
                      Изменить сумму
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Кто отправил донат
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={yooIsAnon}
                          onChange={(e) => setYooIsAnon(e.target.checked)}
                          className="w-4 h-4 text-amber-500 rounded bg-white border-slate-300"
                        />
                        <span>Анонимно</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={yooIsAnon}
                      placeholder={yooIsAnon ? 'Анонимный зритель' : 'Ваш никнейм или имя'}
                      value={yooIsAnon ? '' : yooSenderName}
                      onChange={(e) => setYooSenderName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="yoo-step2-msg" className="text-xs font-semibold text-slate-700">
                        Сообщение для Дмитрия (FSB Sotik) и «ЧатикСотика»
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {yooMessage.length} / 250
                      </span>
                    </div>
                    <textarea
                      id="yoo-step2-msg"
                      rows={3}
                      maxLength={250}
                      placeholder="Пожелание стримеру, привет команде FSB Racing или комментарий к заезду..."
                      value={yooMessage}
                      onChange={(e) => {
                        setYooMessage(e.target.value);
                        setYooError(null);
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {yooError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                      {yooError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-sm shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Опубликовать сообщение в чате и ленте</span>
                  </button>
                </form>
              )}

              {/* Step 3: Done */}
              {yooStep === 'done' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-400">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">Огромное спасибо за поддержку!</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    Ваш перевод {formatRubles(yooPaidAmount)} и сообщение добавлены в ленту благодарностей Дмитрия!
                  </p>
                  <button
                    onClick={() => {
                      setYooStep('pay');
                      setYooMessage('');
                      setYooSenderName('');
                    }}
                    className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-xl hover:bg-amber-300 cursor-pointer shadow-xs"
                  >
                    Отправить ещё один донат
                  </button>
                </div>
              )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. SBERBANK / TBANK */}
          {/* ========================================================= */}
          {['sber', 'tbank'].includes(selectedService) && (
            <div className="glass" data-rain="8">
              <div className="glass-rain" />
              <div className="glass-body !p-7 sm:!p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-md bg-gradient-to-tr ${activeServiceObj.color} border border-white/50 text-white`}>
                    {activeServiceObj.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Прямой перевод через {activeServiceObj.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Перевод по Системе быстрых платежей (СБП) без комиссии или по номеру карты
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  СБП 0%
                </span>
              </div>

              {/* Bank Details Card */}
              <div className="p-6 rounded-2xl bg-amber-50/40 border-[2px] border-amber-400/40 space-y-4 shadow-inner">
                {/* SBP Phone info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Перевод через СБП (Система быстрых платежей):</span>
                    <span className="text-amber-800 text-xs">Без комиссии любого банка</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="font-mono font-bold text-base text-slate-950">
                        {profile.sbpPhone}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Банк получателя: <strong className="text-amber-800">{activeServiceObj.name}</strong> · Дмитрий Передний (П.)
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(profile.sbpPhone, 'sbp')}
                      className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      {copiedKey === 'sbp' ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-950" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">
                    Или номер банковской карты ({activeServiceObj.name}):
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="font-mono font-bold text-base text-slate-950 tracking-wider">
                        {selectedService === 'sber'
                          ? profile.sberCard
                          : profile.tbankCard}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Держатель: Dmitry Peredniy (Нижегородская обл.)
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          selectedService === 'sber'
                            ? profile.sberCard
                            : profile.tbankCard,
                          'card'
                        )
                      }
                      className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      {copiedKey === 'card' ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-950" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Прямая ссылка на сервис (сбор в Сбербанк Онлайн) */}
                {activeServiceObj.actionUrl && (
                  <div className="space-y-1.5 pt-2">
                    <a
                      href={activeServiceObj.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Перейти к сбору на {activeServiceObj.name}</span>
                    </a>
                    <p className="text-[11px] text-slate-500 text-center">
                      Безопасная форма сбора внутри приложения {activeServiceObj.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Notice form to publish message */}
              <form onSubmit={handleBankSubmit} className="space-y-4 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Сообщить о переводе и оставить сообщение в ленту:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Ваше имя / никнейм:</label>
                    <input
                      type="text"
                      placeholder="Ник в чате Forza..."
                      value={bankSender}
                      onChange={(e) => setBankSender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Сумма перевода (₽):</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={bankAmount}
                      onChange={(e) => setBankAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="bank-msg-input" className="text-xs font-semibold text-slate-700">
                      Сообщение Дмитрию (FSB Sotik):
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {bankMsg.length} / 200
                    </span>
                  </div>
                  <textarea
                    id="bank-msg-input"
                    rows={2}
                    maxLength={200}
                    placeholder="Привет команде FSB Racing, пожелание победы в гонке..."
                    value={bankMsg}
                    onChange={(e) => {
                      setBankMsg(e.target.value);
                      setBankError(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {bankError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {bankError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Опубликовать сообщение в чате и ленте</span>
                </button>

                {bankSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Спасибо! Ваше сообщение добавлено в «ЧатикСотика» и ленту благодарностей!</span>
                  </div>
                )}
              </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. STREAMER SERVICES */}
          {/* ========================================================= */}
          {['donationalerts', 'cloudtips'].includes(selectedService) && (
            <div className="glass" data-rain="8">
              <div className="glass-rain" />
              <div className="glass-body !p-7 sm:!p-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-md bg-gradient-to-tr ${activeServiceObj.color} border border-white/50 text-white`}>
                    {activeServiceObj.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Донат через {activeServiceObj.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      С голосовой озвучкой и анимацией прямо на стриме Forza Motorsport
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  Алерт в эфире
                </span>
              </div>

              {/* Service Feature Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-purple-50/70 border-[2px] border-amber-400/40 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>Оповещение в прямом эфире стрима</span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-950">
                  Ваше сообщение прозвучит голосом робота во время гонки!
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Поддержите стримера Дмитрия Переднего (FSB Sotik) во время заездов Forza Motorsport. Поддерживаются любые банковские карты РФ, СБП, зарубежные карты и электронные кошельки.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={activeServiceObj.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-4 px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    <span>Перейти к донату на {activeServiceObj.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(activeServiceObj.actionUrl || '', 'streamlink')}
                    className="py-4 px-6 rounded-xl bg-white hover:bg-amber-50 text-slate-800 font-semibold text-xs border border-amber-400/40 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'streamlink' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-600" />
                        <span>Скопировать ссылку</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Leave a donation message for ЧатикСотика & Gratitude Feed */}
              <form onSubmit={handleStreamerMsgSubmit} className="space-y-4 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Отправили донат через {activeServiceObj.name}? Оставьте сообщение в «ЧатикСотика» и ленту:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="streamer-sender-input" className="text-xs font-semibold text-slate-700">
                      Ваше имя / никнейм:
                    </label>
                    <input
                      id="streamer-sender-input"
                      type="text"
                      placeholder="Ник в чате Forza..."
                      value={streamerSender}
                      onChange={(e) => setStreamerSender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="streamer-amount-input" className="text-xs font-semibold text-slate-700">
                      Сумма доната (₽):
                    </label>
                    <input
                      id="streamer-amount-input"
                      type="number"
                      min="10"
                      placeholder="500"
                      value={streamerAmount}
                      onChange={(e) => setStreamerAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="streamer-msg-input" className="text-xs font-semibold text-slate-700">
                      Сообщение Дмитрию (FSB Sotik):
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {streamerMsg.length} / 200
                    </span>
                  </div>
                  <textarea
                    id="streamer-msg-input"
                    rows={2}
                    maxLength={200}
                    placeholder="Пожелание стримеру или команде FSB Racing..."
                    value={streamerMsg}
                    onChange={(e) => {
                      setStreamerMsg(e.target.value);
                      setStreamerError(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {streamerError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {streamerError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Опубликовать сообщение в чате и ленте</span>
                </button>

                {streamerSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Спасибо! Ваше сообщение добавлено в «ЧатикСотика» и ленту благодарностей!</span>
                  </div>
                )}
              </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols on desktop / full width on mobile): Dmitry Quote & Gratitude Feed */}
        <div className={isMobile ? 'w-full space-y-6' : 'lg:col-span-5 space-y-6'}>
          <div className="glass" data-rain="8">
            <div className="glass-rain" />
            <div className="glass-body !p-7 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-2xl font-bold shadow-inner">
                  🏎️
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Слово от Дмитрия (FSB Sotik)</h3>
                  <p className="text-xs text-slate-500">Стример Forza Motorsport</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60">
                «Спасибо каждому, кто заходит на стримы, пишет в чат и поддерживает материально. После обморожения в 2006 году я доказал себе, что смогу гонять в Forza Motorsport без пальцев на руках. Ваша поддержка даёт силы двигаться вперед и побеждать!»
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Все реквизиты принадлежат лично Дмитрию Переднему</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600 shrink-0 fill-current" />
                  <span>Каждый донат мотивирует продолжать стримы</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transfers Feed */}
          <div className="glass" data-rain="6">
            <div className="glass-rain" />
            <div className="glass-body !p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-amber-600 fill-current" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Лента благодарностей
                </h3>
              </div>
              <span className="text-xs text-amber-800 font-mono font-bold">
                {transfers.length} записей
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1 space-y-1">
              {transfers.map((t) => (
                <div key={t.id} className="pt-3 pb-2 flex items-start justify-between gap-3">
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
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-0.5 leading-relaxed">
                        «{t.message}»
                      </p>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-mono text-amber-700 tabular-nums shrink-0">
                    +{formatRubles(t.amount)}
                  </span>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
