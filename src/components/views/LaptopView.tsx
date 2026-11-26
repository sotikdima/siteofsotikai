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

interface LaptopViewProps {
  profile: DmitryProfile;
  transfers: DmitryTransfer[];
  onAddTransfer: (transfer: DmitryTransfer) => void;
  onUpdateWallet: (newWallet: string) => void;
}

export const LaptopView: React.FC<LaptopViewProps> = ({
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

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
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
    <div className="w-full max-w-4xl mx-auto px-6 py-8 space-y-6 animate-fade-in">
      {/* Official support banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8038d1]"></span>
          Официальная страница поддержки
        </span>
        <span>Прямой перевод Дмитрию Переднему</span>
      </div>

      {/* Recipient Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ЮMoney верифицирован
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
                {profile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingWallet(!isEditingWallet)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <Edit2 className="w-3 h-3 inline mr-1" />
              {isEditingWallet ? 'Отмена' : 'Изменить номер'}
            </button>
          </div>
        </div>

        {/* Wallet Strip */}
        <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8038d1] text-white flex items-center justify-center font-bold text-sm shrink-0">
              Ю
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-900 uppercase">
                Номер кошелька ЮMoney
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                {formattedWallet}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyWallet}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedWallet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Копировать</span>
              </>
            )}
          </button>
        </div>

        {isEditingWallet && (
          <form onSubmit={handleSaveWallet} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-2">
            <input
              type="text"
              value={editWalletValue}
              onChange={(e) => setEditWalletValue(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#8038d1] rounded-lg"
            >
              Сохранить
            </button>
          </form>
        )}
      </div>

      {/* Main Flow */}
      {step === 'step1_pay' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Шаг 1 из 2
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Выберите сумму и перейдите к оплате
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
              Комиссия 0.5%
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[250, 500, 1000, 5000].map((preset) => {
                const isSelected = !customAmount && selectedPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-3 px-3 rounded-2xl text-center text-sm font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#8038d1] text-white border-[#8038d1] shadow-md shadow-purple-600/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
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
                placeholder="Своя сумма..."
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#8038d1]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-slate-400">
                ₽
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-[#8038d1] hover:bg-[#6f26c0] active:scale-[0.99] transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Перейти к переводу на ЮMoney: {formatRubles(activeAmount)}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPaidAmount(activeAmount);
                    setStep('step2_message');
                  }}
                  className="text-xs text-purple-700 hover:text-purple-900 font-medium underline cursor-pointer"
                >
                  Уже перевели? Оставить сообщение к донату
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {step === 'step2_message' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Шаг 2 из 2
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Кто отправил и комментарий
              </h2>
            </div>

            <button
              onClick={() => setStep('step1_pay')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 text-xs font-medium text-purple-900 flex justify-between items-center">
            <span>Перевод на сумму: <strong>{formatRubles(paidAmount)}</strong></span>
            <a
              href={buildYooMoneyDirectLink(profile.yoomoneyWallet, paidAmount)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>ЮMoney ссылка</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handlePublishMessage} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Кто отправил
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#8038d1]"
                  />
                  <span>Анонимно</span>
                </label>
              </div>
              <input
                type="text"
                disabled={isAnonymous}
                placeholder={isAnonymous ? 'Анонимный перевод' : 'Ваше имя или ник'}
                value={isAnonymous ? '' : senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#8038d1]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Сообщение Дмитрию
              </label>
              <textarea
                rows={2}
                maxLength={200}
                placeholder="Слова благодарности или пожелание..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#8038d1] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#8038d1] hover:bg-[#6f26c0] text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Опубликовать сообщение к донату</span>
            </button>
          </form>
        </div>
      )}

      {step === 'step3_done' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Спасибо за поддержку!</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Ваш перевод {formatRubles(paidAmount)} и сообщение успешно переданы Дмитрию.
          </p>
          <button
            onClick={() => {
              setStep('step1_pay');
              setComment('');
              setSenderName('');
            }}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-[#8038d1] text-white hover:bg-[#6f26c0] flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сделать ещё перевод</span>
          </button>
        </div>
      )}

      {/* Thank you notes list */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-600" />
            <span>Слова благодарности ({transfers.length})</span>
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {transfers.slice(0, 5).map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {t.isAnonymous ? 'Аноним' : t.senderName}
                </span>
                {t.message && (
                  <p className="text-xs text-slate-500 mt-0.5">«{t.message}»</p>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-[#8038d1]">
                +{formatRubles(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
