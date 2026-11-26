import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Users,
  Send,
  Sparkles,
  ExternalLink,
  Coins,
  X,
  CheckCircle2,
  CreditCard,
  WifiOff,
  Loader2,
  Bot,
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { DmitryTransfer } from '../types/donation';
import { INITIAL_TWITCH_MESSAGES } from '../data/chatData';
import { playTone } from '../utils/audio';
import { buildYooMoneyDirectLink, createYooKassaPayment, formatRubles } from '../utils/yoomoney';
import {
  isFirebaseConfigured,
  subscribeToSiteChat,
  subscribeToFirebaseConnection,
  publishSiteMessage,
  cleanupOldSiteMessages,
  CHAT_AUTO_CLEANUP_THRESHOLD,
  CHAT_KEEP_LATEST_COUNT,
} from '../firebase/chat';
import { pickRandomProgrammaticBotMessage } from '../data/programmaticBots';
import { buildLiveSiteContext } from '../utils/auctionsState';
import hottabychImg from '../assets/images/starik_hottabych_warning_1795604881240.jpg';

const AUTO_BOT_IDLE_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_BOT_LOCK_KEY = 'sotik_autobot_last_post_ts';

interface StreamAndChatsProps {
  wallet?: string;
  onAddTransfer?: (transfer: DmitryTransfer) => void;
}

export const StreamAndChats: React.FC<StreamAndChatsProps> = ({
  wallet = '4100117753597226',
  onAddTransfer,
}) => {
  const [activeChatTab, setActiveChatTab] = useState<'twitch' | 'site'>(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const payment = q.get('payment') || q.get('yookassa') || q.get('donation') || q.get('status');
      const paid = q.get('paid');
      if (payment === 'success' || payment === 'paid' || payment === 'succeeded' || paid === '1' || paid === 'true') {
        return 'site';
      }
    } catch {}
    return 'twitch';
  });
  const [twitchMessages, setTwitchMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sotik_twitch_chat');
      return saved ? JSON.parse(saved) : INITIAL_TWITCH_MESSAGES;
    } catch {
      return INITIAL_TWITCH_MESSAGES;
    }
  });

  // ЧатикСотика хранится ТОЛЬКО в Firebase Realtime Database онлайн.
  // Никаких локальных/фолбэк-чатов: чат работает напрямую через Firebase.
  const [siteMessages, setSiteMessages] = useState<ChatMessage[]>([]);
  const [browserOnline, setBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const isFirebaseActive = isFirebaseConfigured();
  const isOnlineChat = isFirebaseActive && browserOnline;
  const hasLoadedSiteChatRef = useRef<boolean>(false);
  const siteMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    siteMessagesRef.current = siteMessages;
  }, [siteMessages]);

  // Live online sync with Firebase Realtime Database
  useEffect(() => {
    if (!isFirebaseActive) return;

    // Track online/offline status from Firebase
    const unsubConn = subscribeToFirebaseConnection((connected) => {
      setFirebaseConnected(connected);
      if (connected) {
        void cleanupOldSiteMessages(CHAT_AUTO_CLEANUP_THRESHOLD, CHAT_KEEP_LATEST_COUNT);
      }
    });

    // Subscribe to incoming messages in real-time directly from Firebase
    const unsubChat = subscribeToSiteChat(CHAT_AUTO_CLEANUP_THRESHOLD, (incomingMsgs) => {
      hasLoadedSiteChatRef.current = true;
      setSiteMessages(incomingMsgs);
      if (incomingMsgs.length >= CHAT_AUTO_CLEANUP_THRESHOLD) {
        void cleanupOldSiteMessages(CHAT_AUTO_CLEANUP_THRESHOLD, CHAT_KEEP_LATEST_COUNT);
      }
    });

    return () => {
      if (unsubConn) unsubConn();
      if (unsubChat) unsubChat();
    };
  }, [isFirebaseActive]);

  // Programmatic bots: publish 1 message roughly every 5 minutes when the chat is empty/idle
  useEffect(() => {
    if (!isOnlineChat || !firebaseConnected) return;

    const tryAutoBotMessage = () => {
      if (!hasLoadedSiteChatRef.current) return;
      const msgs = siteMessagesRef.current;
      const now = Date.now();

      let latestMsgTs = 0;
      for (const m of msgs) {
        if (typeof m.ts === 'number' && m.ts > latestMsgTs) {
          latestMsgTs = m.ts;
        }
      }

      let lockTs = 0;
      try {
        lockTs = Number(localStorage.getItem(AUTO_BOT_LOCK_KEY) || '0') || 0;
      } catch {}

      const effectiveLastActivity = Math.max(latestMsgTs, lockTs);
      const isIdleLongEnough = now - effectiveLastActivity >= AUTO_BOT_IDLE_INTERVAL_MS;
      const isEmptyAndReady = msgs.length === 0 && now - lockTs >= AUTO_BOT_IDLE_INTERVAL_MS;

      if (!isIdleLongEnough && !isEmptyAndReady) return;

      try {
        localStorage.setItem(AUTO_BOT_LOCK_KEY, String(now));
      } catch {}

      const { bot, text } = pickRandomProgrammaticBotMessage(msgs.map((m) => m.text));
      const dt = new Date();
      const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      const autoBotMsg: ChatMessage = {
        id: `ab_${bot.id}_${Date.now()}`,
        author: bot.author,
        text,
        time: timeStr,
        ...(bot.badge ? { badge: bot.badge, badgeColor: bot.badgeColor } : {}),
        color: bot.color,
        isBot: true,
        isAutoBot: true,
      };

      void publishSiteMessage(autoBotMsg);
    };

    const initialTimer = setTimeout(tryAutoBotMessage, 9000);
    const interval = setInterval(tryAutoBotMessage, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isOnlineChat, firebaseConnected]);

  // Track real browser network state
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // User input states for site chat
  const [authorName, setAuthorName] = useState<string>(() => {
    return localStorage.getItem('sotik_chat_author') || 'Болельщик FSB';
  });
  const [inputText, setInputText] = useState<string>('');
  const [viewerCount, setViewerCount] = useState<number>(142);
  const [twitchParentQuery] = useState<string>(() => {
    if (typeof window === 'undefined') return 'parent=localhost';
    const parents = new Set<string>();
    const currentHost = (window.location.hostname || '').trim().toLowerCase();
    if (currentHost) {
      parents.add(currentHost);
      if (currentHost.startsWith('www.')) {
        parents.add(currentHost.slice(4));
      } else if (currentHost.includes('.') && currentHost !== 'localhost') {
        parents.add(`www.${currentHost}`);
      }
    }
    try {
      const origins = (window.location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
      if (origins && origins.length > 0) {
        for (let i = 0; i < origins.length; i++) {
          try {
            const h = new URL(origins[i]).hostname.trim().toLowerCase();
            if (h) parents.add(h);
          } catch {}
        }
      }
    } catch {}
    if (parents.size === 0) parents.add('localhost');
    return Array.from(parents)
      .map((p) => `parent=${encodeURIComponent(p)}`)
      .join('&');
  });

  // YooMoney / YooKassa Donation states
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [donationAmount, setDonationAmount] = useState<number>(500);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [donationMessageText, setDonationMessageText] = useState<string>('');
  const [donationLoading, setDonationLoading] = useState<boolean>(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [paymentConfirmationUrl, setPaymentConfirmationUrl] = useState<string | null>(null);
  const [donationSuccessToast, setDonationSuccessToast] = useState<string | null>(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const payment = q.get('payment') || q.get('yookassa') || q.get('donation') || q.get('status');
      const paid = q.get('paid');
      if (payment === 'success' || payment === 'paid' || payment === 'succeeded' || paid === '1' || paid === 'true') {
        return 'Спасибо за донат! После подтверждения ЮKassa он автоматически появится в ленте «ЧатикСотика».';
      }
    } catch {}
    return null;
  });
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [isBotEnabled, setIsBotEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sotik_chat_bot_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [botError, setBotError] = useState<string | null>(null);
  const [isHottabychVisible, setIsHottabychVisible] = useState<boolean>(false);
  const [hottabychCooldownSec, setHottabychCooldownSec] = useState<number>(0);
  const [hottabychImgError, setHottabychImgError] = useState<boolean>(false);

  const siteChatContainerRef = useRef<HTMLDivElement>(null);
  const botCooldownUntilRef = useRef<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('sotik_chat_bot_enabled', String(isBotEnabled));
    } catch {}
  }, [isBotEnabled]);

  // Viewer count gentle random fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(80, prev + Math.floor(Math.random() * 5) - 2));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Countdown ticker for Starik Hottabych IP rate-limit cooldown
  useEffect(() => {
    if (hottabychCooldownSec <= 0) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((botCooldownUntilRef.current - Date.now()) / 1000));
      setHottabychCooldownSec(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [hottabychCooldownSec]);

  // Close Hottabych overlay with Escape
  useEffect(() => {
    if (!isHottabychVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsHottabychVisible(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHottabychVisible]);

  const effectiveAmount = parseFloat(customAmountInput) || donationAmount || 500;
  const cleanTargetWallet = wallet.trim() || '4100117753597226';
  const yooMoneyPaymentUrl = buildYooMoneyDirectLink(
    cleanTargetWallet,
    effectiveAmount,
    `Донат в чате СайтСотика от ${authorName.trim() || 'Зритель'}: ${donationMessageText.trim() || 'Поддержка стрима'}`
  );

  // Очищаем старый локальный кэш мок-сообщений, если он когда-либо остался
  useEffect(() => {
    try {
      localStorage.removeItem('sotik_site_chat');
      localStorage.removeItem('sotik_site_chat_v2');
    } catch {}
  }, []);

  const requestBotReply = async (
    messagesSnapshot: ChatMessage[],
    mode: 'reply' | 'topic',
    triggerMessage?: { author: string; text: string }
  ) => {
    if (!isOnlineChat || isBotTyping) return;
    setIsBotTyping(true);
    setBotError(null);

    try {
      const res = await fetch('/api/chat/bot-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          recentMessages: messagesSnapshot.slice(-12).map((m) => ({
            author: m.author,
            text: m.text,
            isBot: Boolean(m.isBot),
          })),
          triggerMessage,
          siteContext: buildLiveSiteContext(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        rateLimitedByIp?: boolean;
        retryAfterSec?: number;
      };

      if (res.status === 429 && data.rateLimitedByIp) {
        const waitSec =
          typeof data.retryAfterSec === 'number' && data.retryAfterSec > 0 ? data.retryAfterSec : 60;
        botCooldownUntilRef.current = Date.now() + waitSec * 1000;
        setHottabychCooldownSec(waitSec);
        setIsHottabychVisible(true);
        setBotError(null);
        playTone(440, 'triangle', 0.14, 0.08);
        return;
      }

      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Не удалось получить ответ от AI бота');
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        author: 'СотикБот',
        text: data.reply,
        time: timeStr,
        badge: 'AI Бот',
        badgeColor: 'bg-purple-600 text-white',
        color: '#7c3aed',
        isBot: true,
      };

      const published = await publishSiteMessage(botMsg);
      if (!published) {
        throw new Error('Не удалось отправить ответ бота в Firebase чат');
      }

      setTimeout(() => {
        if (siteChatContainerRef.current) {
          siteChatContainerRef.current.scrollTop = siteChatContainerRef.current.scrollHeight;
        }
      }, 60);
    } catch (err) {
      setBotError(err instanceof Error ? err.message : 'Ошибка AI бота');
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSendSiteMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnlineChat) return;
    const cleanText = inputText.trim();
    if (!cleanText) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cleanAuthor = authorName.trim() || 'Зритель СайтСотика';

    const newMsg: ChatMessage = {
      id: `st_${Date.now()}`,
      author: cleanAuthor,
      text: cleanText,
      time: timeStr,
      badge: 'Сайт',
      badgeColor: 'bg-amber-400 text-slate-950',
      color: '#0284c7',
    };

    // Публикуем напрямую в Firebase Realtime Database онлайн
    publishSiteMessage(newMsg).catch((err) => {
      console.warn('Firebase publish failed:', err);
    });

    try {
      localStorage.setItem('sotik_chat_author', cleanAuthor);
    } catch {}

    setInputText('');
    setBotError(null);
    playTone(720, 'sine', 0.08, 0.08);

    // Scroll only internal container, never the page
    setTimeout(() => {
      if (siteChatContainerRef.current) {
        siteChatContainerRef.current.scrollTop = siteChatContainerRef.current.scrollHeight;
      }
    }, 50);

    if (isBotEnabled && Date.now() >= botCooldownUntilRef.current) {
      const updatedContext = [...siteMessages, newMsg];
      setTimeout(() => {
        void requestBotReply(updatedContext, 'reply', {
          author: cleanAuthor,
          text: cleanText,
        });
      }, 650);
    }
  };

  const handleCreateYooKassaDonation = async () => {
    if (effectiveAmount < 10) {
      setDonationError('Минимальная сумма доната — 10 ₽');
      return;
    }

    const cleanAuthor = authorName.trim() || 'Зритель СайтСотика';
    const cleanMessage = donationMessageText.trim() || 'Донат на поддержку стрима и команды FSB Racing!';

    setDonationLoading(true);
    setDonationError(null);
    setPaymentConfirmationUrl(null);

    try {
      localStorage.setItem('sotik_chat_author', cleanAuthor);
    } catch {}

    try {
      const result = await createYooKassaPayment({
        amount: effectiveAmount,
        name: cleanAuthor,
        message: cleanMessage,
      });

      if (result.paymentId) {
        try {
          sessionStorage.setItem('yy_pending', result.paymentId);
        } catch {}
      }

      setPaymentConfirmationUrl(result.confirmationUrl);
      playTone(659, 'triangle', 0.12, 0.1);
      setDonationSuccessToast(
        `Счёт на ${formatRubles(effectiveAmount)} создан! Нажмите кнопку оплаты — после оплаты донат автоматически появится в чате.`
      );
      setTimeout(() => setDonationSuccessToast(null), 7000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось создать платёж';
      setDonationError(msg);
    } finally {
      setDonationLoading(false);
    }
  };

  const handlePublishDonationMessage = async () => {
    const cleanMessage = donationMessageText.trim();
    if (!cleanMessage) {
      setDonationError('Напишите текст сообщения для Дмитрия перед отправкой в чат.');
      return;
    }
    if (effectiveAmount < 10) {
      setDonationError('Минимальная сумма доната — 10 ₽');
      return;
    }

    const cleanAuthor = authorName.trim() || 'Зритель СайтСотика';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const msgId = `don_${Date.now()}`;

    setDonationLoading(true);
    setDonationError(null);

    try {
      localStorage.setItem('sotik_chat_author', cleanAuthor);
    } catch {}

    try {
      const chatMsg: ChatMessage = {
        id: msgId,
        author: cleanAuthor,
        text: cleanMessage,
        time: timeStr,
        badge: 'Донат',
        badgeColor: 'bg-amber-400 text-slate-950',
        color: '#7c3aed',
        donation: {
          amount: effectiveAmount,
          currency: 'RUB',
          service: 'yoomoney',
          status: 'pending',
          targetWallet: cleanTargetWallet,
          channelLabel: 'ЮMoney / СБП',
        },
      };

      const published = await publishSiteMessage(chatMsg);
      if (!published) {
        throw new Error('Не удалось отправить сообщение в Firebase чат. Проверьте подключение.');
      }

      onAddTransfer?.({
        id: msgId,
        senderName: cleanAuthor,
        isAnonymous: false,
        amount: effectiveAmount,
        message: cleanMessage,
        timestamp: 'Только что',
        status: 'completed',
      });

      setDonationMessageText('');
      setPaymentConfirmationUrl(null);
      setIsDonateOpen(false);
      playTone(659, 'triangle', 0.12, 0.1);
      setDonationSuccessToast('Спасибо! Ваше сообщение к донату опубликовано в «ЧатикСотика»!');
      setTimeout(() => setDonationSuccessToast(null), 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось опубликовать сообщение';
      setDonationError(msg);
    } finally {
      setDonationLoading(false);
    }
  };

  const handleSendQuickEmoji = (emoji: string) => {
    setInputText((prev) => `${prev} ${emoji}`.trim());
  };

  const donationMessages = siteMessages.filter((m) => !!m.donation);

  return (
    <div className="rounded-[32px] border-[5px] border-amber-400/65 bg-white/85 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.06),0_0_25px_rgba(251,191,36,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-6">
      {/* Header bar of the Stream & Chats block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#9146FF] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-400/50">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-mono">
                Трансляция Twitch: <span className="text-[#9146FF]">fsbsotik</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Стрим Дмитрия Переднего (FSB Sotik) · Forza Motorsport · Команда FSB Racing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold font-mono">
            <Users className="w-3.5 h-3.5 text-[#9146FF]" />
            <span>{viewerCount} зрителей</span>
          </div>

          <a
            href="https://www.twitch.tv/fsbsotik"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#9146FF] hover:bg-[#7c2cf1] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Twitch.tv</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: Stream Player (Left) + Online Chats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Twitch Stream Player */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-[3px] border-amber-400/60 shadow-lg">
            {/* Live Twitch Embed Iframe */}
            <iframe
              src={`https://player.twitch.tv/?channel=fsbsotik&${twitchParentQuery}&autoplay=true&muted=true`}
              title="Twitch Stream fsbsotik"
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0 z-10"
            />

            {/* Fallback frame */}
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-slate-950 via-[#180f28] to-slate-950">
              <div className="w-16 h-16 rounded-2xl bg-[#9146FF]/30 border border-[#9146FF] flex items-center justify-center mb-3 text-3xl">
                🎮
              </div>
              <h3 className="text-lg font-bold">Стрим канала fsbsotik на Twitch</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Прямой эфир заездов Forza Motorsport 7 и Forza Motorsport команды FSB Racing!
              </p>
              <a
                href="https://www.twitch.tv/fsbsotik"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Открыть прямой эфир на Twitch.tv</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Under player telemetry bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-300/60 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">Forza Motorsport:</span>
              <span>Класс GT3 & заезды команды FSB Racing</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span>Нижегородская область</span>
              <span>·</span>
              <span className="font-semibold text-amber-800">1080p 60 FPS</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dual Online Chats (ТвичатикСотика & ЧатикСотика с донатами ЮMoney) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border-[3px] border-amber-400/60 bg-white/95 overflow-hidden shadow-md">
          {/* Chat Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => setActiveChatTab('twitch')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChatTab === 'twitch'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#9146FF]" />
              <span className="truncate">ТвичатикСотика</span>
            </button>

            <button
              onClick={() => setActiveChatTab('site')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeChatTab === 'site'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate">ЧатикСотика (ЮMoney)</span>
            </button>
          </div>

          {/* CHAT TAB 1: ТвичатикСотика (Официальный чат Twitch fsbsotik) */}
          {activeChatTab === 'twitch' && (
            <div className="flex-1 flex flex-col justify-between min-h-[420px] bg-[#0e0e10]">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9146FF] animate-pulse" />
                  <span className="font-extrabold text-white text-xs">ТвичатикСотика</span>
                  <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/50">
                    Чат на Twitch · fsbsotik
                  </span>
                </div>
                <a
                  href="https://www.twitch.tv/popout/fsbsotik/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#bf94ff] hover:text-white flex items-center gap-1 transition-colors text-xs font-semibold"
                  title="Открыть чат Twitch в отдельном окне"
                >
                  <span>Popout чат</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Official Twitch Chat Iframe */}
              <div className="flex-1 relative w-full min-h-[350px] bg-[#0e0e10]">
                <iframe
                  src={`https://www.twitch.tv/embed/fsbsotik/chat?${twitchParentQuery}&darkpopout`}
                  title="ТвичатикСотика — Официальный чат Twitch канала fsbsotik"
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>

              {/* Twitch info / action bar */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Чат на Twitch канале <strong className="text-purple-300">fsbsotik</strong></span>
                </div>
                <a
                  href="https://www.twitch.tv/fsbsotik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#9146FF] hover:bg-[#7a2eed] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <span>Писать на Twitch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* CHAT TAB 2: ЧатикСотика — Онлайн чат с возможностью донатов через ЮMoney */}
          {activeChatTab === 'site' && (
            <div className="flex-1 flex flex-col justify-between min-h-[420px] bg-slate-50/50 relative">
              {/* Top Sub-Header with YooMoney Wallet & Quick Donate CTA */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-white border-b border-slate-200 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isOnlineChat ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-bold text-slate-900">ЧатикСотика</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-purple-700 font-bold">ЮMoney 0%</span>
                  </div>
                  {isOnlineChat ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        firebaseConnected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                      title={
                        firebaseConnected
                          ? 'Firebase Realtime Database: подключено онлайн, сообщения синхронизируются в реальном времени'
                          : 'Firebase: подключение к базе данных...'
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          firebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span>Firebase {firebaseConnected ? 'Онлайн' : 'Подключение...'}</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-300"
                      title="Чат отключен. Он активируется автоматически, как только сервер будет в сети."
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>Чат не в сети</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDonateOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm shadow-amber-400/30 transition-all cursor-pointer border border-amber-300"
                >
                  <Coins className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isDonateOpen ? 'Скрыть донат' : '💰 Донат через ЮMoney'}</span>
                </button>
              </div>

              {/* Toast alert on successful donation */}
              {donationSuccessToast && (
                <div className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fade-in z-20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>{donationSuccessToast}</span>
                  </div>
                  <button
                    onClick={() => setDonationSuccessToast(null)}
                    className="p-1 hover:bg-emerald-700 rounded text-emerald-200 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pinned Recent SuperChat / Donors Strip */}
              {donationMessages.length > 0 && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-amber-50 via-purple-50 to-amber-50 border-b border-amber-200/80 flex items-center gap-2 overflow-x-auto text-[11px] select-none">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1 shrink-0 font-mono text-[10px]">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Донаты в эфире:</span>
                  </span>
                  {donationMessages.slice(-5).map((dm) => (
                    <button
                      key={dm.id}
                      onClick={() => {
                        setHighlightedMsgId(dm.id);
                        setTimeout(() => setHighlightedMsgId(null), 3000);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-white/95 border border-amber-400/60 font-bold text-slate-800 shrink-0 hover:bg-amber-100/90 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer text-[10px]"
                      title="Кликните чтобы подсветить сообщение"
                    >
                      <span className="text-amber-600">★</span>
                      <span>{dm.author}</span>
                      <span className="text-amber-800 font-mono font-extrabold">
                        {formatRubles(dm.donation!.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* POPUP / DRAWER: Send Donation via YooMoney with Live Preview */}
              {isDonateOpen && (
                <div className="bg-amber-50/95 border-b-2 border-amber-400/80 p-3.5 space-y-3 shadow-md animate-fade-in z-10">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200/70">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                        Ю
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 font-mono">
                        Отправка доната через ЮMoney в чат
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDonateOpen(false)}
                      className="p-1 hover:bg-amber-200/60 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recipient info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono bg-white/90 p-2 rounded-xl border border-amber-200">
                    <span>Кошелёк Дмитрия (ЮMoney):</span>
                    <strong className="text-slate-900">{cleanTargetWallet}</strong>
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 font-mono">Сумма доната:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[100, 300, 500, 1000, 2500, 5000].map((amt) => {
                        const isSelected = !customAmountInput && donationAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setDonationAmount(amt);
                              setCustomAmountInput('');
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs'
                                : 'bg-white hover:bg-amber-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {amt} ₽
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom amount + Donor name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Своя сумма (₽)..."
                        value={customAmountInput}
                        onChange={(e) => setCustomAmountInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Ваше имя..."
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Donation message */}
                  <div className="space-y-1 relative z-20 pointer-events-auto">
                    <div className="flex items-center justify-between">
                      <label htmlFor="chat-donation-msg" className="text-[10px] font-bold text-slate-600 font-mono">
                        Сообщение для Дмитрия и чата:
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {donationMessageText.length} / 160
                      </span>
                    </div>
                    <textarea
                      id="chat-donation-msg"
                      rows={2}
                      placeholder="Напишите пожелание на стрим (до 160 симв.)..."
                      value={donationMessageText}
                      onChange={(e) => {
                        setDonationMessageText(e.target.value);
                        setDonationError(null);
                        setPaymentConfirmationUrl(null);
                      }}
                      maxLength={160}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {/* SuperChat Live Preview */}
                  <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-300/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold font-mono">
                      <span>Предпросмотр сообщения в чате:</span>
                      <span className="text-amber-800">⭐ Суперчат</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border-2 border-amber-400 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">
                          {authorName.trim() || 'Ваше имя'}
                        </span>
                        <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                          {formatRubles(effectiveAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 italic">
                        {donationMessageText.trim() || 'Ваше тёплое сообщение Дмитрию...'}
                      </p>
                    </div>
                  </div>

                  {donationError && (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                      {donationError}
                    </div>
                  )}

                  {paymentConfirmationUrl ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-400 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                        <span>✓ Ссылка на оплату готова!</span>
                        <button
                          type="button"
                          onClick={() => setPaymentConfirmationUrl(null)}
                          className="text-emerald-700 underline cursor-pointer"
                        >
                          Изменить
                        </button>
                      </div>
                      <a
                        href={paymentConfirmationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Перейти к оплате {formatRubles(effectiveAmount)} в ЮKassa →</span>
                      </a>
                      <p className="text-[10px] text-emerald-800 text-center">
                        После подтверждения платежа сообщение автоматически появится в «ЧатикСотика»!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          type="button"
                          disabled={donationLoading}
                          onClick={handleCreateYooKassaDonation}
                          className="w-full sm:w-2/3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-60 text-center"
                        >
                          {donationLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Создаём счёт ЮKassa...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Оплатить {formatRubles(effectiveAmount)} через ЮKassa →</span>
                            </>
                          )}
                        </button>

                        <a
                          href={yooMoneyPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-1/3 py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] border border-amber-300 flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
                          title="Прямой перевод на кошелёк ЮMoney"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>На кошелёк</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        disabled={donationLoading || !isOnlineChat}
                        onClick={() => void handlePublishDonationMessage()}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition-colors cursor-pointer disabled:opacity-50 text-center"
                      >
                        Уже перевели на кошелёк или СБП? Опубликовать сообщение в «ЧатикСотика»
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Messages feed */}
              <div
                ref={siteChatContainerRef}
                className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs max-h-[360px]"
              >
                {isOnlineChat ? (
                  siteMessages.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400 p-4">
                      <p className="text-xs">Сообщений в Firebase пока нет. Напишите первое сообщение!</p>
                    </div>
                  ) : (
                    siteMessages.map((msg) => {
                      const isDonation = !!msg.donation;
                      const isHighlighted = highlightedMsgId === msg.id;

                      if (isDonation) {
                        const amount = msg.donation!.amount;
                        const isHighTier = amount >= 1000;

                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl border-[3px] transition-all shadow-sm ${
                              isHighlighted
                                ? 'ring-4 ring-amber-400 scale-[1.02]'
                                : ''
                            } ${
                              isHighTier
                                ? 'border-amber-500 bg-gradient-to-br from-amber-50 via-purple-50/60 to-white'
                                : 'border-amber-400/80 bg-gradient-to-br from-amber-50/90 to-white'
                            }`}
                          >
                            {/* SuperChat Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
                              <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                  💰
                                </span>
                                <span className="font-extrabold text-slate-950">
                                  {msg.author}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                                  {msg.donation!.channelLabel ||
                                    (msg.donation!.service === 'sber'
                                      ? 'СберБанк'
                                      : msg.donation!.service === 'tbank'
                                      ? 'Т-Банк'
                                      : msg.donation!.service === 'donationalerts'
                                      ? 'DonationAlerts'
                                      : msg.donation!.service === 'cloudtips'
                                      ? 'CloudTips'
                                      : 'ЮMoney')}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-2xs">
                                  {formatRubles(amount)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {msg.time}
                                </span>
                              </div>
                            </div>

                            {/* Message text */}
                            <div className="pt-2 text-slate-900 font-medium text-xs leading-relaxed break-words">
                              {msg.text}
                            </div>

                            {/* Quiet verification footer */}
                            <div className="pt-1.5 flex items-center justify-between text-[10px] text-amber-800/80 font-mono">
                              <span>
                                {msg.donation!.status === 'paid'
                                  ? 'Прямой донат без комиссии'
                                  : 'Сообщение к переводу от зрителя'}
                              </span>
                              <span>
                                {msg.donation!.status === 'paid'
                                  ? '✓ Зачислено Дмитрию'
                                  : '💛 Поддержка стрима'}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Standard, programmatic viewer bot, or AI host bot chat message
                      const isAiHostBot = Boolean(msg.isBot && !msg.isAutoBot);
                      return (
                        <div
                          key={msg.id}
                          className={`p-2 rounded-xl border transition-colors shadow-2xs ${
                            isAiHostBot
                              ? 'bg-purple-50/75 border-purple-200/90 hover:bg-purple-50'
                              : 'bg-white border-slate-200/70 hover:bg-amber-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.badge && (
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                  msg.badgeColor || 'bg-amber-400 text-slate-950'
                                }`}
                              >
                                {msg.badge}
                              </span>
                            )}
                            <span
                              className={`font-bold ${isAiHostBot ? 'text-purple-900' : 'text-slate-900'}`}
                              style={!isAiHostBot && msg.color ? { color: msg.color } : undefined}
                            >
                              {msg.author}:
                            </span>
                            <span className="text-slate-800 break-words">{msg.text}</span>
                            <span className="text-[10px] text-slate-400 ml-auto font-mono">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 p-4">
                    <WifiOff className="w-8 h-8 mb-2 text-red-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-800">Чат отключен</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Он активируется автоматически, как только сервер будет в сети.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Bot typing & error indicators */}
              {(isBotTyping || botError) && (
                <div className="px-3.5 py-1.5 bg-white border-t border-slate-100 text-[11px] flex items-center justify-between gap-2">
                  {isBotTyping ? (
                    <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>СотикБот печатает...</span>
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold leading-snug break-words">{botError}</span>
                  )}
                  {botError && !isBotTyping && (
                    <button
                      type="button"
                      onClick={() => setBotError(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                      title="Скрыть ошибку"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Message composer for ЧатикСотика */}
              <form onSubmit={handleSendSiteMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ваше имя..."
                    disabled={!isOnlineChat}
                    className="w-full sm:w-1/3 px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                    title="Ваш никнейм в ЧатикСотика"
                  />

                  <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsBotEnabled((prev) => !prev)}
                      disabled={!isOnlineChat}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 border transition-colors cursor-pointer shrink-0 disabled:opacity-40 ${
                        isBotEnabled
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={isBotEnabled ? 'AI Бот включён и отвечает в чате (нажмите, чтобы поставить на паузу)' : 'AI Бот на паузе (нажмите, чтобы включить)'}
                    >
                      <Bot className="w-3 h-3" />
                      <span>{isBotEnabled ? 'Бот Вкл' : 'Бот Выкл'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void requestBotReply(siteMessages, 'topic')}
                      disabled={!isOnlineChat || isBotTyping}
                      className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center gap-1 border border-purple-200 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                      title="Попросить СотикБота предложить тему для беседы"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Тема</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDonateOpen((prev) => !prev)}
                      disabled={!isOnlineChat}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                      title="Отправить донат через ЮMoney с выделением в чате"
                    >
                      <Coins className="w-3 h-3 text-amber-700" />
                      <span>Донат</span>
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto text-xs">
                      {['🏎️', '🔥', '🏆', '👏', '🏁', '💜'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSendQuickEmoji(emoji)}
                          disabled={!isOnlineChat}
                          className="p-1 hover:bg-slate-100 rounded text-xs cursor-pointer disabled:opacity-30"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isOnlineChat
                        ? "Напишите в ЧатикСотика..."
                        : "Чат отключен (нет соединения с сервером)"
                    }
                    maxLength={150}
                    disabled={!isOnlineChat}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!isOnlineChat}
                    className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                    title="Отправить сообщение"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Cartoon Starik Hottabych screen overlay when IP bot limit (2 questions) is exceeded */}
      {isHottabychVisible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hottabych-title"
          onClick={() => setIsHottabychVisible(false)}
        >
          <div
            className="animate-hottabych-pop relative max-w-md w-full rounded-[30px] border-[5px] border-amber-400 bg-gradient-to-b from-amber-50 via-white to-amber-50/90 p-5 sm:p-6 shadow-[0_25px_70px_rgba(15,23,42,0.45)] text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsHottabychVisible(false)}
              className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-amber-100 transition-colors cursor-pointer"
              aria-label="Закрыть предупреждение"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Speech bubble */}
            <div className="relative bg-white border-2 border-amber-400 rounded-2xl px-4 py-3 shadow-sm mx-2 mt-1">
              <h3
                id="hottabych-title"
                className="text-lg sm:text-xl font-extrabold text-slate-950 leading-tight"
              >
                Только два вопроса, мужики!
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-snug">
                А так чат общий — общайтесь смело между собой в «ЧатикСотика»!
              </p>
              <div
                aria-hidden="true"
                className="w-4 h-4 bg-white border-r-2 border-b-2 border-amber-400 rotate-45 mx-auto -mb-5 mt-1.5"
              />
            </div>

            {/* Cartoon Starik Hottabych character wagging his finger */}
            <div className="relative flex justify-center pt-2">
              <div className="animate-hottabych-wag relative w-52 h-52 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-lg bg-amber-50 flex items-center justify-center">
                {!hottabychImgError ? (
                  <img
                    src={hottabychImg}
                    alt="Мультяшный Старик Хоттабыч грозит пальцем: только два вопроса, мужики!"
                    referrerPolicy="no-referrer"
                    onError={() => setHottabychImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-100 to-purple-100 w-full h-full">
                    <span className="text-6xl leading-none">🧙‍♂️</span>
                    <span className="text-xs font-bold text-amber-950 mt-2">Старик Хоттабыч</span>
                  </div>
                )}
              </div>

              {/* Animated wagging finger indicator next to Hottabych */}
              <div
                aria-hidden="true"
                className="animate-hottabych-finger absolute -right-1 sm:right-6 top-6 w-12 h-12 rounded-2xl bg-amber-400 border-2 border-white shadow-md flex items-center justify-center text-2xl select-none"
              >
                ☝️
              </div>
            </div>

            {/* Quiet unboxed countdown & action button */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-medium text-slate-600 tabular-nums">
                {hottabychCooldownSec > 0
                  ? `СотикБот передохнёт и снова ответит через ${hottabychCooldownSec} сек.`
                  : 'Перерыв закончился — можете снова задать вопрос СотикБоту!'}
              </p>

              <button
                type="button"
                onClick={() => setIsHottabychVisible(false)}
                className="w-full py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Понял, общаемся в чате!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
