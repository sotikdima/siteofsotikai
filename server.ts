import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_BASE_URL =
  process.env.YOOKASSA_WORKER_URL || 'https://yoomoney-donations.sotikdima.workers.dev';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const BOT_SYSTEM_INSTRUCTION = `Ты — СотикБот, дружелюбный и точный AI-помощник и ведущий онлайн-чата «ЧатикСотика» на официальном портале Дмитрия Переднего (FSB Sotik).
Ты полностью знаешь всю информацию и разделы всего сайта:

1. ЭКОСИСТЕМА ПОРТАЛА («ПорталСотика»):
- Единый хаб (/) объединяет 3 проекта:
  • «СайтСотика» (/site): Главная, Обо мне (/site/about), Игры (/site/games), Команда (/site/team), Партнеры (/site/partners), страница донатов (/site/donate).
  • «ДонатыСотика» (/donations): полная страница поддержки стримера.
  • «АукционыСотика» (/auctions): интерактивные аукционы зрителей стрима.

2. СТРИМЕР И ИСТОРИЯ («Обо мне»):
- Дмитрий Передний (ник FSB Sotik), Нижегородская область, Россия. Почта: sotikdima@gmail.com, Twitch: https://www.twitch.tv/fsbsotik.
- В 2006 году после тяжёлого обморожения Дмитрию ампутировали пальцы на обеих руках. В 2017 году он купил Xbox с диском Forza Motorsport 7, научился управлять болидами культями кистей рук на геймпаде и основал международную команду FSB Racing.
- Трансляция на Twitch (fsbsotik) идёт в 1080p 60 FPS; в блоке эфира доступны два чата: «ТвичатикСотика» (официальный чат Twitch) и «ЧатикСотика» (онлайн-чат сайта в Firebase с донатами и тобой).

3. ИГРЫ И НАСТРОЙКИ УПРАВЛЕНИЯ («Игры»):
- Основные дисциплины: Forza Motorsport 7 (куплена в 2017 году) и новая Forza Motorsport (2023) — класс GT3, износ резины, динамическая погода, мультиплеер.
- Настройки управления Дмитрия без пальцев: внутренняя мёртвая зона стиков 0–1%, внешняя 95%, линейность руля 50% (прямая), мёртвая зона тормоза (ABS) отключена, коробка передач — механика со сцеплением.
- На странице «Игры» есть мини-симулятор FSB Time Attack с 4 трассами: Nürburgring Nordschleife (20.83 км, 73 поворота, рекорд 6:43.20), Circuit de Spa-Francorchamps (7.00 км, 19 поворотов, рекорд 2:16.80), Autodromo Nazionale Monza (5.79 км, 11 поворотов, рекорд 1:44.50), Circuit de la Sarthe / Le Mans (13.62 км, 38 поворотов, рекорд 3:50.10).

4. КОМАНДА FSB RACING («Команда», 4 пилота · 3 страны):
- FSB Sotik — Дмитрий Передний (основатель & стример, Нижегородская область, Россия 🇷🇺; болиды: Porsche 911 GT3 R / Corvette C8.R).
- FSB Bosfor — Валера (пилот, г. Волжский, Россия 🇷🇺; болиды: BMW M8 GTE / Ferrari 488 GTE).
- FSB Forest — Антон (пилот, специалист по подвеске и дождевым заездам, Германия 🇩🇪; болиды: Audi R8 LMS / Mercedes-AMG GT3).
- FSB Sensei — Денис (пилот и стратег пит-стопов и тактики резины, Ирландия 🇮🇪; болиды: Aston Martin Vantage GTE / McLaren 720S GT3).

5. ДОНАТЫ И РЕКВИЗИТЫ («ДонатыСотика» и «Партнеры»):
- Активны 5 способов поддержки (получатель лично Дмитрий Передний):
  1) ЮMoney / ЮKassa — кошелёк 4100117753597226 (минимум 10 ₽, быстрые кнопки 250 / 500 / 1000 / 5000 ₽; с кошелька ЮMoney — 0%; при оплате через ЮKassa донат автоматически появляется в «ЧатикСотика»).
  2) СберБанк — СБП по номеру +7 (987) 392-79-02, карта 2202 2080 3540 5993, прямая ссылка сбора: https://messenger.sbrf.ru/sl/mxGjPGQaHaCS4LLTs.
  3) Т-Банк — СБП по номеру +7 (987) 392-79-02, карта 2200 7013 9259 6174.
  4) DonationAlerts — https://www.donationalerts.com/r/fsb_sotik (голосовые алерты в прямом эфире).
  5) CloudTips — https://pay.cloudtips.ru/p/57f3b0e0 (чаевые от Т-Банка, комиссия отправителя от 4%, получателю без удержаний).
- ВТБ и DonateStream сейчас скрыты и не используются.

6. АУКЦИОНЫ, ВЫБОР АВТО И ТОЧНОЕ ВРЕМЯ СТРИМА («АукционыСотика»):
- Зрители делают ставки на 5 лотов: выбор GT3-автомобиля на следующий стрим Forza Motorsport, гонка 1 на 1 против Дмитрия на Nürburgring Nordschleife, индивидуальный тюнинг/телеметрия от FSB Racing, выбор трассы для 2.4-часового марафона, стикерпак и открытка с автографом.
- При ставке на лот «Выбор болида для следующего стрима Forza Motorsport» зритель выбирает конкретную машину класса GT3 из 8 вариантов: Bentley Continental GT3 #17 (2014), Aston Martin V12 Vantage GT3 #7 (2017), BMW M6 GT3 #1 (2017), Dodge Viper GT3-R #93 (2015), Ferrari 488 GT3 (2018), Lexus RC F GT3 (2017), Nissan GT-R NISMO GT3 #23 (2018), Porsche 911 GT3 R (2018).
- Правила аукциона: победитель связывается с Дмитрием через Discord или sotikdima@gmail.com, оплачивает выигранную ставку через «ДонатыСотика» (ЮMoney, СберБанк, Т-Банк, CloudTips или DonationAlerts), а заказы реализуются в эфире Twitch fsbsotik.
- ВАЖНЕЙШЕЕ ПРАВИЛО ВРЕМЕНИ СТРИМА: Стрим начинается ровно в 20:00 МСК (UTC+3), когда заканчивается таймер лотов в разделе «АукционыСотика»!
- Если зритель спрашивает про время начала стрима, расписание эфира или время окончания аукциона/оплаты лота — ты ОБЯЗАН посмотреть блок «АКТУАЛЬНЫЕ ДАННЫЕ САЙТА ПРЯМО СЕЙЧАС» ниже и назвать ТОЧНОЕ время по Москве (20:00 МСК), местное время зрителя и точный остаток по таймеру! Никогда не выдумывай время от себя.

ПРАВИЛА ОТВЕТА:
- Отвечай по-русски, дружелюбно и понятно, без Markdown, без звёздочек и без префикса "СотикБот:".
- Для обычной болтовни пиши 1–2 живых предложения. Для вопросов про время стрима, выбор авто, аукционы, реквизиты, пилотов или настройки игры давай точный и полный ответ (до 3 предложений, до 420 символов) со всеми точными цифрами и временем из актуальных данных сайта.`;

interface SiteContextPayload {
  currentLocalTime?: unknown;
  timeZone?: unknown;
  streamScheduleMsk?: unknown;
  gt3Cars?: unknown;
  nextStreamStart?: {
    hasActiveLot?: unknown;
    lotTitle?: unknown;
    endsAtMsk?: unknown;
    endsAtTime?: unknown;
    endsAtDateTime?: unknown;
    timeLeftFormatted?: unknown;
  };
  auctions?: Array<{
    id?: unknown;
    title?: unknown;
    currentBid?: unknown;
    leaderName?: unknown;
    selectedCar?: unknown;
    timeLeftFormatted?: unknown;
    endsAtTime?: unknown;
    endsAtDateTime?: unknown;
  }>;
}

function formatLiveContextBlock(raw: unknown): string {
  const ctx = (raw && typeof raw === 'object' ? raw : {}) as SiteContextPayload;
  const nowStr =
    typeof ctx.currentLocalTime === 'string' && ctx.currentLocalTime.trim()
      ? ctx.currentLocalTime.trim().slice(0, 60)
      : new Date().toLocaleString('ru-RU');
  const tzStr =
    typeof ctx.timeZone === 'string' && ctx.timeZone.trim()
      ? ` (${ctx.timeZone.trim().slice(0, 50)})`
      : '';

  const lines: string[] = [`Текущее время у зрителя: ${nowStr}${tzStr}`];

  if (typeof ctx.streamScheduleMsk === 'string' && ctx.streamScheduleMsk.trim()) {
    lines.push(`Время старта стрима по расписанию сайта: ${ctx.streamScheduleMsk.trim().slice(0, 80)}`);
  } else {
    lines.push('Время старта стрима по расписанию сайта: 20:00 МСК (UTC+3)');
  }

  const ns = ctx.nextStreamStart;
  if (ns && typeof ns === 'object') {
    const endsMsk = typeof ns.endsAtMsk === 'string' && ns.endsAtMsk ? ns.endsAtMsk : '20:00 МСК';
    if (ns.hasActiveLot) {
      const lotTitle = typeof ns.lotTitle === 'string' ? ns.lotTitle.slice(0, 120) : 'ближайший лот';
      const endsTime = typeof ns.endsAtTime === 'string' ? ns.endsAtTime : '';
      const endsDate = typeof ns.endsAtDateTime === 'string' ? ns.endsAtDateTime : endsTime;
      const left = typeof ns.timeLeftFormatted === 'string' ? ns.timeLeftFormatted : '';
      lines.push(
        `СТАРТ СТРИМА (окончание времени оплаты/таймера ближайшего лота «${lotTitle}»): ровно в ${endsMsk} (по времени зрителя: ${endsTime}, дата: ${endsDate}, осталось по таймеру: ${left}).`
      );
    } else {
      lines.push(
        `СТАРТ СТРИМА: ближайший эфир в ${endsMsk} (активные лоты завершены, стрим в готовности на Twitch fsbsotik).`
      );
    }
  }

  if (Array.isArray(ctx.gt3Cars) && ctx.gt3Cars.length > 0) {
    const carsList = ctx.gt3Cars
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .slice(0, 10)
      .join(', ');
    if (carsList) {
      lines.push(`Доступные GT3-машины для выбора в лоте авто на стрим: ${carsList}`);
    }
  }

  if (Array.isArray(ctx.auctions) && ctx.auctions.length > 0) {
    lines.push('Текущие лоты в «АукционыСотика» прямо сейчас:');
    for (const lot of ctx.auctions.slice(0, 6)) {
      const title = typeof lot?.title === 'string' ? lot.title.slice(0, 100) : 'Лот';
      const bid = typeof lot?.currentBid === 'number' ? `${lot.currentBid} ₽` : '';
      const leader = typeof lot?.leaderName === 'string' ? lot.leaderName.slice(0, 40) : '';
      const carStr =
        typeof lot?.selectedCar === 'string' && lot.selectedCar.trim()
          ? ` | лидирует GT3-авто: ${lot.selectedCar.trim().slice(0, 60)}`
          : '';
      const left = typeof lot?.timeLeftFormatted === 'string' ? lot.timeLeftFormatted : '';
      const endsAt = typeof lot?.endsAtDateTime === 'string' ? lot.endsAtDateTime : '';
      lines.push(
        `- ${title} | ставка: ${bid} (лидер: ${leader})${carStr} | осталось: ${left} | окончание (время оплаты): ${endsAt}`
      );
    }
  }

  return `АКТУАЛЬНЫЕ ДАННЫЕ САЙТА ПРЯМО СЕЙЧАС:\n${lines.join('\n')}`;
}

const BOT_MODEL = 'gemini-3.1-flash-lite';
const BOT_RATE_LIMIT_WINDOW_MS = 60_000;
const BOT_MAX_REQUESTS_PER_IP = 2;
const botIpHits = new Map<string, number[]>();

const cleanupInterval = setInterval(() => {
  const cutoff = Date.now() - BOT_RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of botIpHits.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      botIpHits.delete(ip);
    } else {
      botIpHits.set(ip, active);
    }
  }
}, BOT_RATE_LIMIT_WINDOW_MS);
cleanupInterval.unref();

function getClientIp(req: express.Request): string {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  return rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;
}

function checkBotIpRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - BOT_RATE_LIMIT_WINDOW_MS;
  const recent = (botIpHits.get(ip) ?? []).filter((ts) => ts > cutoff);

  if (recent.length >= BOT_MAX_REQUESTS_PER_IP) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + BOT_RATE_LIMIT_WINDOW_MS - now) / 1000));
    botIpHits.set(ip, recent);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  botIpHits.set(ip, recent);
  return { allowed: true, retryAfterSec: 0 };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '64kb' }));

  // AI chat companion endpoint for «ЧатикСотика»
  app.post('/api/chat/bot-reply', async (req, res) => {
    const clientIp = getClientIp(req);
    const rateLimit = checkBotIpRateLimit(clientIp);
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfterSec));
      return res.status(429).json({
        error: `Только два вопроса, мужики! СотикБот ответит снова через ${rateLimit.retryAfterSec} сек., а пока общайтесь в общем чате.`,
        rateLimitedByIp: true,
        retryAfterSec: rateLimit.retryAfterSec,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY не настроен. Укажите ключ в Settings > Secrets.',
      });
    }

    try {
      const body = (req.body ?? {}) as {
        recentMessages?: Array<{ author?: unknown; text?: unknown; isBot?: unknown }>;
        triggerMessage?: { author?: unknown; text?: unknown };
        mode?: unknown;
        siteContext?: unknown;
      };

      const mode = body.mode === 'topic' ? 'topic' : 'reply';
      const rawRecent = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-12) : [];
      const historyLines = rawRecent
        .map((m) => {
          const author = typeof m?.author === 'string' ? m.author.trim().slice(0, 40) : 'Зритель';
          const text = typeof m?.text === 'string' ? m.text.trim().slice(0, 240) : '';
          if (!text) return '';
          const prefix = m?.isBot ? `${author} (бот)` : author;
          return `${prefix}: ${text}`;
        })
        .filter(Boolean);

      const triggerAuthor =
        typeof body.triggerMessage?.author === 'string'
          ? body.triggerMessage.author.trim().slice(0, 40)
          : '';
      const triggerText =
        typeof body.triggerMessage?.text === 'string'
          ? body.triggerMessage.text.trim().slice(0, 240)
          : '';

      const liveContextBlock = formatLiveContextBlock(body.siteContext);

      const prompt =
        mode === 'topic'
          ? [
              liveContextBlock,
              historyLines.length > 0
                ? `Последние сообщения в чате:\n${historyLines.join('\n')}`
                : 'Чат пока пуст.',
              'Предложи новую короткую, интересную реплику или вопрос зрителям про стрим, ближайший лот аукциона, Forza Motorsport, трассы или команду FSB Racing, чтобы оживить беседу.',
            ].join('\n\n')
          : [
              liveContextBlock,
              historyLines.length > 0
                ? `Контекст последних сообщений в чате:\n${historyLines.join('\n')}`
                : '',
              triggerText
                ? `Ответь живо, дружелюбно и точно (опираясь на актуальные данные сайта выше!) на сообщение от «${triggerAuthor || 'Зритель'}»: «${triggerText}»`
                : 'Поддержи беседу в чате коротким дружелюбным сообщением.',
            ]
              .filter(Boolean)
              .join('\n\n');

      const callModel = async () => {
        const delays = [500, 1200];
        let lastErr: unknown;
        for (let attempt = 0; attempt <= delays.length; attempt++) {
          try {
            return await ai.models.generateContent({
              model: BOT_MODEL,
              contents: prompt,
              config: {
                systemInstruction: BOT_SYSTEM_INSTRUCTION,
                thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              },
            });
          } catch (err: unknown) {
            lastErr = err;
            const status = (err as { status?: number })?.status;
            const isTransient = status === 503 || status === 429;
            if (!isTransient || attempt === delays.length) {
              throw err;
            }
            await new Promise((r) => setTimeout(r, delays[attempt]));
          }
        }
        throw lastErr;
      };

      const response = await callModel();

      const rawReply = (response.text ?? '').trim();
      const cleanedReply = rawReply
        .replace(/^СотикБот\s*:\s*/i, '')
        .replace(/\*\*/g, '')
        .trim();

      if (!cleanedReply) {
        return res.status(502).json({ error: 'Бот вернул пустой ответ. Попробуйте ещё раз.' });
      }

      return res.json({ reply: cleanedReply });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      console.error('AI chat bot error:', err);
      const status = typeof e?.status === 'number' && e.status >= 400 && e.status < 600 ? e.status : 502;
      if (status === 400 || status === 403) {
        return res.status(status).json({
          error: 'Проверьте GEMINI_API_KEY в Settings > Secrets.',
        });
      }
      if (status === 429) {
        return res.status(429).json({
          error: 'Превышен лимит запросов к Gemini API. Попробуйте чуть позже.',
        });
      }
      if (status === 503) {
        return res.status(503).json({
          error: 'Сервер AI сейчас перегружен. Попробуйте отправить сообщение ещё раз.',
        });
      }
      return res.status(status).json({
        error: 'Не удалось получить ответ от AI бота. Попробуйте позже.',
      });
    }
  });

  // Proxy payment creation to Cloudflare Worker (avoids browser CORS issues)
  app.post('/api/yookassa/create-payment', async (req, res) => {
    try {
      const { amount, name, message, returnUrl } = req.body ?? {};
      const workerRes = await fetch(`${WORKER_BASE_URL}/createPayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          name,
          message,
          ...(typeof returnUrl === 'string' && returnUrl ? { returnUrl } : {}),
        }),
      });

      const text = await workerRes.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        return res.status(502).json({ error: 'Invalid response from payment worker' });
      }

      return res.status(workerRes.status).json(data);
    } catch (err) {
      console.error('Payment proxy error:', err);
      return res.status(502).json({ error: 'Не удалось связаться с платёжным сервисом' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
