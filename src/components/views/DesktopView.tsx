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
  BadgeCheck,
  Zap,
} from 'lucide-react';
import { DmitryProfile, DmitryTransfer } from '../../types/donation';
import {
  formatRubles,
  buildYooMoneyDirectLink,
  isValidYooMoneyWallet,
} from '../../utils/yoomoney';

interface DesktopViewProps {
  profile: DmitryProfile;
  transfers: DmitryTransfer[];
  onAddTransfer: (transfer: DmitryTransfer) => void;
  onUpdateWallet: (newWallet: string) => void;
}

export const DesktopView: React.FC<DesktopViewProps> = ({
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
      setWalletError('Номер кошелька должен содержать 14–16 цифр (например: 4100117753597226)');
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
      setErrorMessage('Минимальная сумма перевода — 10 ₽');
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
    <div className="w-full max-w-6xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      {/* Official support banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8038d1]"></span>
          Официальная страница поддержки
        </span>
        <span>Прямой перевод на кошелёк ЮMoney</span>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Profile, Wallet Box, Security Badges */}
        <div className="col-span-5 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-100">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <BadgeCheck className="w-5 h-5 text-[#8038d1]" />
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                  ЮMoney верифицирован
                </div>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  {profile.description}
                </p>
              </div>
            </div>

            {/* Wallet Box */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                  Кошелёк получателя
                </span>
                <button
                  onClick={() => setIsEditingWallet(!isEditingWallet)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingWallet ? 'Отмена' : 'Изменить'}</span>
                </button>
              </div>

              <div className="text-xl font-mono font-bold text-slate-900 tracking-wider select-all">
                {formattedWallet}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyWallet}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedWallet ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Скопировать номер</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://yoomoney.ru/quickpay/confirm?receiver=${profile.yoomoneyWallet}&quickpay-form=shop&targets=Поддержка+проекта`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-purple-100/70 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors flex items-center justify-center gap-1"
                >
                  <span>На yoomoney.ru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Edit Wallet Form */}
            {isEditingWallet && (
              <form onSubmit={handleSaveWallet} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Номер кошелька ЮMoney (14–16 цифр):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editWalletValue}
                    onChange={(e) => setEditWalletValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-[#8038d1]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#8038d1] rounded-xl hover:bg-[#6f26c0] cursor-pointer"
                  >
                    ОК
                  </button>
                </div>
                {walletError && <p className="text-xs text-red-600">{walletError}</p>}
              </form>
            )}

            {/* Trust and License */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Лицензия Банка России № 3510-К (НКО «ЮМани»)</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#8038d1] shrink-0" />
                <span>Мгновенный перевод на баланс кошелька</span>
              </div>
            </div>
          </div>

          {/* Transfers History Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Слова благодарности
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {transfers.length} записей
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {transfers.map((t) => (
                <div key={t.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {t.isAnonymous ? 'Аноним' : t.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        · {t.timestamp}
                      </span>
                    </div>
                    {t.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        «{t.message}»
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold font-mono text-[#8038d1] tabular-nums shrink-0">
                    +{formatRubles(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Payment & Message Form */}
        <div className="col-span-7">
          {step === 'step1_pay' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    Шаг 1 из 2
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    Выберите сумму перевода
                  </h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  ЮMoney
                </span>
              </div>

              <p className="text-xs text-slate-500">
                После нажатия откроется защищённая платёжная форма ЮMoney. Затем вернитесь на страницу, чтобы оставить сообщение Дмитрию.
              </p>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleProceedToPayment} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-800">
                    Сумма (250, 500, 1000, 5000 ₽ или своя сумма):
                  </label>

                  <div className="grid grid-cols-4 gap-3">
                    {[250, 500, 1000, 5000].map((preset) => {
                      const isSelected = !customAmount && selectedPreset === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className={`py-3.5 px-4 rounded-2xl text-center text-sm font-mono font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#8038d1] text-white border-[#8038d1] shadow-md shadow-purple-600/20 scale-[1.02]'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                          }`}
                        >
                          {preset.toLocaleString('ru-RU')} ₽
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative pt-1">
                    <input
                      type="number"
                      min="10"
                      step="1"
                      placeholder="Или введите свою сумму..."
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-[#8038d1] focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-slate-400">
                      ₽ (RUB)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8038d1] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Перевод на кошелёк ЮMoney
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Получатель: Дмитрий Передний ···{profile.yoomoneyWallet.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#8038d1] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    Комиссия 0.5%
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-[#8038d1] hover:bg-[#6f26c0] active:scale-[0.99] transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    <span>Перейти к переводу на ЮMoney: {formatRubles(activeAmount)}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Откроется защищённая страница ЮMoney в новой вкладке</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPaidAmount(activeAmount);
                        setStep('step2_message');
                      }}
                      className="text-purple-700 hover:text-purple-900 font-medium underline cursor-pointer"
                    >
                      Уже перевели? Оставить сообщение
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 'step2_message' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    Шаг 2 из 2
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    Укажите имя и сообщение
                  </h2>
                </div>

                <button
                  onClick={() => setStep('step1_pay')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Изменить сумму</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8038d1] text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Сумма перевода: <span className="text-[#8038d1]">{formatRubles(paidAmount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Кошелёк Дмитрия: {formattedWallet}
                    </div>
                  </div>
                </div>

                <a
                  href={buildYooMoneyDirectLink(profile.yoomoneyWallet, paidAmount)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Открыть снова</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <form onSubmit={handlePublishMessage} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      Кто отправил перевод
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#8038d1] focus:ring-purple-200 cursor-pointer"
                      />
                      <span>Отправить анонимно</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isAnonymous}
                      placeholder={isAnonymous ? 'Анонимный перевод' : 'Ваше имя или никнейм'}
                      value={isAnonymous ? '' : senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8038d1] focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      Сообщение к донату для Дмитрия
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {comment.length} / 250
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={250}
                    placeholder="Напишите слова благодарности, пожелание или комментарий к переводу..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8038d1] focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-[#8038d1] hover:bg-[#6f26c0] active:scale-[0.99] transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer text-base"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Отправить сообщение Дмитрию</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('step1_pay')}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Вернуться к выбору суммы
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'step3_done' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-10 shadow-sm space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Спасибо за вашу поддержку!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Ваш перевод на сумму <strong className="text-slate-900 font-mono">{formatRubles(paidAmount)}</strong> и сообщение успешно переданы Дмитрию Переднему.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => {
                    setStep('step1_pay');
                    setComment('');
                    setSenderName('');
                    setIsAnonymous(false);
                  }}
                  className="px-6 py-3 rounded-2xl font-bold text-xs bg-[#8038d1] hover:bg-[#6f26c0] text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сделать ещё один перевод</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
