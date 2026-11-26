import { AuctionLot } from '../types/auction';
import {
  INITIAL_AUCTIONS,
  GT3_CARS,
  getNextStreamTimestampMs,
  MSK_OFFSET_MS,
  STREAM_START_HOUR_MSK,
} from '../data/auctionData';

const STORAGE_KEY = 'sotik_auctions_v3';

export function formatAuctionCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Торги завершены';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}ч ${String(minutes).padStart(2, '0')}м ${String(seconds).padStart(2, '0')}с`;
}

export function formatExactLocalDateTime(timestampMs: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestampMs));
  } catch {
    return new Date(timestampMs).toLocaleString('ru-RU');
  }
}

export function formatExactLocalTime(timestampMs: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestampMs));
  } catch {
    return new Date(timestampMs).toLocaleTimeString('ru-RU');
  }
}

export function formatMskDateTime(timestampMs: number): string {
  try {
    const msk = new Date(timestampMs + MSK_OFFSET_MS);
    const dd = String(msk.getUTCDate()).padStart(2, '0');
    const mm = String(msk.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = msk.getUTCFullYear();
    const hh = String(msk.getUTCHours()).padStart(2, '0');
    const min = String(msk.getUTCMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy}, ${hh}:${min} МСК`;
  } catch {
    return `${STREAM_START_HOUR_MSK}:00 МСК`;
  }
}

function withLiveEndsAt(lots: AuctionLot[], now: number): AuctionLot[] {
  const defaultStreamEnd = getNextStreamTimestampMs(now);
  return lots.map((lot) => {
    const rawEndsAt =
      typeof lot.endsAt === 'number' && Number.isFinite(lot.endsAt)
        ? lot.endsAt
        : defaultStreamEnd;
    // If default stream deadline passed, advance to next 20:00 МСК stream slot
    const endsAt = rawEndsAt <= now ? getNextStreamTimestampMs(now) : rawEndsAt;
    const timeLeftSeconds = Math.max(0, Math.round((endsAt - now) / 1000));
    return {
      ...lot,
      endsAt,
      timeLeftSeconds,
      status: timeLeftSeconds === 0 ? 'completed' : 'active',
    };
  });
}

export function saveAuctionsState(lots: AuctionLot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lots));
  } catch {}
}

export function loadAuctionsWithLiveTimers(): AuctionLot[] {
  const now = Date.now();
  try {
    localStorage.removeItem('sotik_auctions_v1');
    localStorage.removeItem('sotik_auctions_v2');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AuctionLot[];
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].imageUrl?.includes('unsplash')) {
        const synced = withLiveEndsAt(parsed, now);
        saveAuctionsState(synced);
        return synced;
      }
    }
  } catch {}

  const initialized = withLiveEndsAt(INITIAL_AUCTIONS, now);
  saveAuctionsState(initialized);
  return initialized;
}

export interface LiveBotSiteContext {
  currentLocalTime: string;
  timeZone: string;
  streamScheduleMsk: string;
  gt3Cars: string[];
  nextStreamStart: {
    hasActiveLot: boolean;
    lotId?: string;
    lotTitle?: string;
    endsAtMsk?: string;
    endsAtTime?: string;
    endsAtDateTime?: string;
    timeLeftFormatted?: string;
    timeLeftSeconds?: number;
  };
  auctions: Array<{
    id: string;
    title: string;
    categoryLabel: string;
    currentBid: number;
    leaderName: string;
    selectedCar?: string;
    bidsCount: number;
    timeLeftSeconds: number;
    timeLeftFormatted: string;
    endsAtTime: string;
    endsAtDateTime: string;
  }>;
}

export function buildLiveSiteContext(): LiveBotSiteContext {
  const now = Date.now();
  const lots = loadAuctionsWithLiveTimers();

  let timeZone = 'местное время';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'местное время';
  } catch {}

  const nextStreamMs = getNextStreamTimestampMs(now);

  const mappedLots = lots.map((lot) => {
    const endsAt = lot.endsAt ?? nextStreamMs;
    return {
      id: lot.id,
      title: lot.title,
      categoryLabel: lot.categoryLabel,
      currentBid: lot.currentBid,
      leaderName: lot.leaderName,
      ...(lot.selectedCar ? { selectedCar: lot.selectedCar } : {}),
      bidsCount: lot.bidsCount,
      timeLeftSeconds: lot.timeLeftSeconds,
      timeLeftFormatted: formatAuctionCountdown(lot.timeLeftSeconds),
      endsAtTime: formatExactLocalTime(endsAt),
      endsAtDateTime: formatExactLocalDateTime(endsAt),
      endsAtMs: endsAt,
    };
  });

  const activeLots = mappedLots
    .filter((l) => l.timeLeftSeconds > 0)
    .sort((a, b) => a.endsAtMs - b.endsAtMs);

  const soonest = activeLots[0];

  return {
    currentLocalTime: formatExactLocalDateTime(now),
    timeZone,
    streamScheduleMsk: `${STREAM_START_HOUR_MSK}:00 МСК (UTC+3) — ${formatMskDateTime(soonest ? soonest.endsAtMs : nextStreamMs)}`,
    gt3Cars: GT3_CARS,
    nextStreamStart: soonest
      ? {
          hasActiveLot: true,
          lotId: soonest.id,
          lotTitle: soonest.title,
          endsAtMsk: formatMskDateTime(soonest.endsAtMs),
          endsAtTime: soonest.endsAtTime,
          endsAtDateTime: soonest.endsAtDateTime,
          timeLeftFormatted: soonest.timeLeftFormatted,
          timeLeftSeconds: soonest.timeLeftSeconds,
        }
      : {
          hasActiveLot: false,
          endsAtMsk: formatMskDateTime(nextStreamMs),
          endsAtTime: formatExactLocalTime(nextStreamMs),
          endsAtDateTime: formatExactLocalDateTime(nextStreamMs),
        },
    auctions: mappedLots.map(({ endsAtMs: _ignore, ...rest }) => rest),
  };
}
