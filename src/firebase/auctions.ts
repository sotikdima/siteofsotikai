import {
  getDatabase,
  ref,
  onValue,
  get,
  update,
  push,
  Unsubscribe,
} from 'firebase/database';
import { AuctionLot, AuctionBidRecord } from '../types/auction';
import { getNextStreamTimestampMs } from '../data/auctionData';
import { getFirebaseApp, isFirebaseConfigured } from './chat';

const AUCTIONS_PATH = 'auctions/lots';

interface RemoteAuctionLot {
  id?: string;
  title?: string;
  description?: string;
  category?: AuctionLot['category'];
  categoryLabel?: string;
  currentBid?: number;
  startBid?: number;
  minStep?: number;
  bidsCount?: number;
  leaderName?: string;
  selectedCar?: string;
  endAt?: number;
  imageUrl?: string;
  status?: AuctionLot['status'];
  featured?: boolean;
}

interface RemoteBidRecord {
  bidder?: string;
  amount?: number;
  ts?: number;
  car?: string;
}

export function formatRelativeBidTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Только что';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин. назад`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ч. назад`;
  return `${Math.floor(diff / 86_400_000)} дн. назад`;
}

function mergeRemoteLot(
  remote: RemoteAuctionLot,
  remoteBids: RemoteBidRecord[],
  fallback: AuctionLot
): AuctionLot {
  const sortedBids = [...remoteBids].sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
  const endsAt =
    typeof remote.endAt === 'number' && Number.isFinite(remote.endAt)
      ? remote.endAt
      : getNextStreamTimestampMs();
  const timeLeftSeconds = Math.max(0, Math.round((endsAt - Date.now()) / 1000));

  const mappedHistory: AuctionBidRecord[] =
    sortedBids.length > 0
      ? sortedBids.map((b, idx) => ({
          id: `${remote.id || fallback.id}_${b.ts ?? idx}`,
          bidder: b.bidder || 'Зритель',
          amount: typeof b.amount === 'number' ? b.amount : fallback.currentBid,
          time: formatRelativeBidTime(b.ts ?? Date.now()),
          ...(b.car ? { car: b.car } : {}),
        }))
      : fallback.bidsHistory;

  return {
    id: remote.id || fallback.id,
    title: remote.title || fallback.title,
    description: remote.description || fallback.description,
    category: remote.category || fallback.category,
    categoryLabel: remote.categoryLabel || fallback.categoryLabel,
    currentBid: typeof remote.currentBid === 'number' ? remote.currentBid : fallback.currentBid,
    startBid: typeof remote.startBid === 'number' ? remote.startBid : fallback.startBid,
    minStep: typeof remote.minStep === 'number' ? remote.minStep : fallback.minStep,
    bidsCount: typeof remote.bidsCount === 'number' ? remote.bidsCount : fallback.bidsCount,
    leaderName: remote.leaderName || fallback.leaderName,
    selectedCar: remote.selectedCar || sortedBids.find((b) => b.car)?.car || fallback.selectedCar,
    endsAt,
    timeLeftSeconds,
    imageUrl:
      remote.imageUrl && !remote.imageUrl.includes('unsplash')
        ? remote.imageUrl
        : fallback.imageUrl,
    status: timeLeftSeconds === 0 ? 'completed' : remote.status || fallback.status,
    featured: remote.featured ?? fallback.featured,
    bidsHistory: mappedHistory,
  };
}

export function subscribeToAuctions(
  fallbackLots: AuctionLot[],
  onData: (lots: AuctionLot[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null;

  try {
    const db = getDatabase(getFirebaseApp());
    const lotsRef = ref(db, AUCTIONS_PATH);

    return onValue(
      lotsRef,
      async (snap) => {
        const val = snap.val() as Record<string, RemoteAuctionLot> | null;
        const mergedMap = new Map<string, AuctionLot>(fallbackLots.map((l) => [l.id, l]));

        if (val) {
          await Promise.all(
            Object.entries(val).map(async ([lotId, remoteLot]) => {
              const fallback = mergedMap.get(lotId) || { ...fallbackLots[0], id: lotId };
              try {
                const bidsSnap = await get(ref(db, `${AUCTIONS_PATH}/${lotId}/bids`));
                const bidsObj = bidsSnap.val() as Record<string, RemoteBidRecord> | null;
                const bidsArr = bidsObj ? Object.values(bidsObj) : [];
                mergedMap.set(lotId, mergeRemoteLot({ ...remoteLot, id: lotId }, bidsArr, fallback));
              } catch {
                mergedMap.set(lotId, mergeRemoteLot({ ...remoteLot, id: lotId }, [], fallback));
              }
            })
          );
        }

        onData(Array.from(mergedMap.values()));
      },
      (err) => {
        console.warn('Firebase auction read failed:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firebase auction subscribe error:', err);
    return null;
  }
}

export async function placeAuctionBid(
  lotId: string,
  bidder: string,
  newAmount: number,
  selectedCar?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { ok: false, error: 'Firebase недоступен' };
  }

  try {
    const db = getDatabase(getFirebaseApp());
    const lotRef = ref(db, `${AUCTIONS_PATH}/${lotId}`);
    const snap = await get(lotRef);
    const current = (snap.val() as RemoteAuctionLot | null) ?? {};
    const currentBid = typeof current.currentBid === 'number' ? current.currentBid : 0;

    if (newAmount <= currentBid) {
      return { ok: false, error: `Ставка должна быть больше текущей (${currentBid} ₽)` };
    }

    const bidRecord: RemoteBidRecord = {
      bidder,
      amount: newAmount,
      ts: Date.now(),
      ...(selectedCar ? { car: selectedCar } : {}),
    };

    await update(lotRef, {
      currentBid: newAmount,
      leaderName: bidder,
      bidsCount: (typeof current.bidsCount === 'number' ? current.bidsCount : 0) + 1,
      ...(selectedCar ? { selectedCar } : {}),
    });

    await push(ref(db, `${AUCTIONS_PATH}/${lotId}/bids`), bidRecord);
    return { ok: true };
  } catch (err) {
    console.warn('Firebase auction write failed:', (err as Error).message);
    return { ok: false, error: 'Не удалось сохранить ставку' };
  }
}
