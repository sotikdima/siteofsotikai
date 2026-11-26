import React, { useState } from 'react';
import {
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Edit2,
  Heart,
  CheckCircle2,
  User,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { DmitryProfile, DmitryTransfer } from '../../types/donation';
import {
  formatRubles,
  buildYooMoneyDirectLink,
  isValidYooMoneyWallet,
} from '../../utils/yoomoney';

interface MobileViewProps {
  profile: DmitryProfile;
  transfers: DmitryTransfer[];
  onAddTransfer: (transfer: DmitryTransfer) => void;
  onUpdateWallet: (newWallet: string) => void;
}

export const MobileView: React.FC<MobileViewProps> = ({
  profile,
  transfers,
  onAddTransfer,
  onUpdateWallet,
}) => {
  const [step, setStep] = useState<'step1_pay' | 'step2_message' | 'step3_done'>('step1_pay');
  const [selectedPreset, setSelectedPreset] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(500);

  const [senderName, setSenderName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [isEditingWallet, setIsEditingWallet] = useState<boolean>(false);
  const [editWalletValue, setEditWalletValue] = useState<string>(profile.yoomoneyWallet);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setEditWalletValue(profile.yoomoneyWallet);
  }, [profile.yoomoneyWallet]);

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPreset;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(profile.yoomoneyWallet.replace(/\s+/g, ''));
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editWalletValue.replace(/\s+/g, '');
    if (!isValidYooMoneyWallet(clean)) {
      setWalletError('Номер кошелька должен содержать 14–16 цифр');
      return;
    }
    setWalletError(null);
    onUpdateWallet(clean);
    setIsEditingWallet(false);
  };

  const handlePresetSelect = (preset: number) => {
    setSelectedPreset(preset);
    setCustomAmount('');
    setErrorMessage(null);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount < 10) {
      setErrorMessage('Минимум — 10 ₽');
      return;
    }
    setErrorMessage(null);
    setPaidAmount(activeAmount);

    const cleanWallet = profile.yoomoneyWallet.replace(/\s+/g, '');
    const payUrl = buildYooMoneyDirectLink(cleanWallet, activeAmount);
    window.open(payUrl, '_blank', 'noopener');
    setStep('step2_message');
  };

  const handlePublishMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSender = isAnonymous ? 'Аноним' : senderName.trim() || 'Отправитель';

    const newTransfer: DmitryTransfer = {
      id: `tr_${Date.now()}`,
      senderName: finalSender,
      isAnonymous,
      amount: paidAmount,
      message: comment.trim(),
      timestamp: 'Только что',
      status: 'completed',
    };

    onAddTransfer(newTransfer);
    setStep('step3_done');
  };

  const formattedWallet = profile.yoomoneyWallet
    .replace(/\s+/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* Mobile Subtitle */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 border-b border-slate-200">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8038d1]"></span>
          Перевод Дмитрию Переднему
        </span>
        <span className="text-[#8038d1] font-semibold">ЮMoney</span>
      </div>

      {/* Recipient Profile Card (Mobile Optimized) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {profile.name}
              </h1>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200 font-medium mt-0.5">
              Кошелёк ЮMoney подтверждён
            </span>
          </div>
        </div>

        {/* Mobile Wallet Tap-To-Copy Chip */}
        <div className="p-3 rounded-xl bg-purple-50/90 border border-purple-100 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 uppercase">
            <span>Номер кошелька</span>
            <button
              onClick={() => setIsEditingWallet(!isEditingWallet)}
              className="text-purple-700 hover:text-purple-900 font-medium cursor-pointer"
            >
              {isEditingWallet ? 'Отмена' : 'Изменить'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 tracking-wider truncate">
              {formattedWallet}
            </span>
            <button
              onClick={handleCopyWallet}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 rounded-lg shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedWallet ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>

          {isEditingWallet && (
            <form onSubmit={handleSaveWallet} className="pt-2 border-t border-purple-100/80 flex gap-1.5">
              <input
                type="text"
                value={editWalletValue}
                onChange={(e) => setEditWalletValue(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white border border-slate-300"
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white bg-[#8038d1] rounded-lg"
              >
                ОК
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Step 1: Mobile Amount & Payment */}
      {step === 'step1_pay' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Шаг 1: Сумма перевода
            </span>
            <span className="text-[11px] text-slate-400">Комиссия 0.5%</span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="space-y-4">
            {/* 2x2 Grid of Large Touch Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {[250, 500, 1000, 5000].map((preset) => {
                const isSelected = !customAmount && selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-3 px-3 rounded-xl text-center text-sm font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#8038d1] text-white border-[#8038d1] shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 active:bg-purple-50'
                    }`}
                  >
                    {preset.toLocaleString('ru-RU')} ₽
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <input
                type="number"
                min="10"
                step="1"
                placeholder="Своя сумма в рублях..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#8038d1]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                ₽
              </span>
            </div>

            {/* Mobile Big Tap CTA */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#8038d1] active:bg-[#6f26c0] shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
              >
                <span>Перевести на ЮMoney: {formatRubles(activeAmount)}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaidAmount(activeAmount);
                  setStep('step2_message');
                }}
                className="w-full text-center text-xs text-purple-700 font-medium py-1 underline cursor-pointer"
              >
                Уже перевели? Оставить сообщение
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Mobile Name & Message */}
      {step === 'step2_message' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Шаг 2: Сообщение
            </span>
            <button
              onClick={() => setStep('step1_pay')}
              className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Назад</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50 text-xs text-purple-900 flex justify-between items-center">
            <span>Сумма: <strong>{formatRubles(paidAmount)}</strong></span>
            <span className="text-[11px] text-purple-700">···{profile.yoomoneyWallet.slice(-4)}</span>
          </div>

          <form onSubmit={handlePublishMessage} className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Кто отправил
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#8038d1] rounded"
                  />
                  <span>Анонимно</span>
                </label>
              </div>
              <input
                type="text"
                disabled={isAnonymous}
                placeholder={isAnonymous ? 'Аноним' : 'Ваше имя или ник'}
                value={isAnonymous ? '' : senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#8038d1]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800">
                Сообщение Дмитрию
              </label>
              <textarea
                rows={2}
                maxLength={200}
                placeholder="Слова благодарности..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#8038d1] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#8038d1] text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Опубликовать сообщение</span>
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'step3_done' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Спасибо за поддержку!</h2>
          <p className="text-xs text-slate-600">
            Перевод {formatRubles(paidAmount)} и сообщение отправлены Дмитрию.
          </p>
          <button
            onClick={() => {
              setStep('step1_pay');
              setComment('');
              setSenderName('');
            }}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-[#8038d1] text-white flex items-center gap-1 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Новый перевод</span>
          </button>
        </div>
      )}

      {/* Thank you notes list (Compact Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-purple-600" />
          <span>Слова благодарности ({transfers.length})</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {transfers.slice(0, 4).map((t) => (
            <div key={t.id} className="py-2 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-slate-900 truncate">
                  {t.isAnonymous ? 'Аноним' : t.senderName}
                </div>
                {t.message && (
                  <div className="text-[11px] text-slate-500 truncate">«{t.message}»</div>
                )}
              </div>
              <span className="font-mono font-bold text-[#8038d1] shrink-0">
                +{formatRubles(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
