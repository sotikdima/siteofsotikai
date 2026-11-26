import { AuctionLot } from '../types/auction';

export const GT3_CARS: string[] = [
  'Bentley Continental GT3 #17 (2014)',
  'Aston Martin V12 Vantage GT3 #7 (2017)',
  'BMW M6 GT3 #1 (2017)',
  'Dodge Viper GT3-R #93 (2015)',
  'Ferrari 488 GT3 (2018)',
  'Lexus RC F GT3 (2017)',
  'Nissan GT-R NISMO GT3 #23 (2018)',
  'Porsche 911 GT3 R (2018)',
];

// Московское время (UTC+3), старт стрима — ровно в 20:00 МСК
export const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
export const STREAM_START_HOUR_MSK = 20;

export function getNextStreamTimestampMs(nowMs: number = Date.now()): number {
  const mskNow = new Date(nowMs + MSK_OFFSET_MS);
  const targetMskUtc =
    Date.UTC(
      mskNow.getUTCFullYear(),
      mskNow.getUTCMonth(),
      mskNow.getUTCDate(),
      STREAM_START_HOUR_MSK,
      0,
      0
    ) - MSK_OFFSET_MS;

  return targetMskUtc > nowMs ? targetMskUtc : targetMskUtc + 86_400_000;
}

export function getSecondsToNextStream(nowMs: number = Date.now()): number {
  return Math.max(0, Math.round((getNextStreamTimestampMs(nowMs) - nowMs) / 1000));
}

export const INITIAL_AUCTIONS: AuctionLot[] = [
  {
    id: 'auc_1',
    title: 'Выбор болида для следующего стрима Forza Motorsport',
    description:
      'Победитель аукциона определяет автомобиль GT3 для заезда и цветовую ливрею, на которой Дмитрий (FSB Sotik) проведёт весь 4-часовой стрим в мультиплеере!',
    category: 'car',
    categoryLabel: 'Выбор авто на стрим',
    currentBid: 3500,
    startBid: 500,
    minStep: 200,
    bidsCount: 14,
    leaderName: 'ForzaFan_99',
    selectedCar: 'Porsche 911 GT3 R (2018)',
    timeLeftSeconds: getSecondsToNextStream(),
    imageUrl: '/images/auction_car_lot_1794261907868.jpg',
    status: 'active',
    featured: true,
    bidsHistory: [
      {
        id: 'bh_1',
        bidder: 'ForzaFan_99',
        amount: 3500,
        time: '3 мин. назад',
        car: 'Porsche 911 GT3 R (2018)',
      },
      {
        id: 'bh_2',
        bidder: 'NevaRacer',
        amount: 3200,
        time: '11 мин. назад',
        car: 'Ferrari 488 GT3 (2018)',
      },
      {
        id: 'bh_3',
        bidder: 'Sasha_GT',
        amount: 2800,
        time: '24 мин. назад',
        car: 'BMW M6 GT3 #1 (2017)',
      },
      { id: 'bh_4', bidder: 'Alex_Nnov', amount: 2500, time: '38 мин. назад' },
      { id: 'bh_5', bidder: 'SpeedDemon', amount: 2000, time: '1 ч. назад' },
    ],
  },
  {
    id: 'auc_2',
    title: 'Заезд 1 на 1 против Дмитрия (FSB Sotik) на стриме',
    description:
      'Индивидуальная дуэль в прямом эфире Twitch на легендарной петле Nürburgring Nordschleife на одинаковых Porsche 911 GT3. Голосовая связь Discord и разбор ошибок после гонки!',
    category: 'race',
    categoryLabel: 'Гонка 1 на 1',
    currentBid: 5200,
    startBid: 1000,
    minStep: 500,
    bidsCount: 19,
    leaderName: 'ApexHunter_77',
    timeLeftSeconds: getSecondsToNextStream(),
    imageUrl: '/images/dmitry_paddock_garage_1794265022136.jpg',
    status: 'active',
    featured: true,
    bidsHistory: [
      { id: 'bh_21', bidder: 'ApexHunter_77', amount: 5200, time: '5 мин. назад' },
      { id: 'bh_22', bidder: 'CyberDriver_RU', amount: 4700, time: '18 мин. назад' },
      { id: 'bh_23', bidder: 'VolgaRacer', amount: 4000, time: '45 мин. назад' },
    ],
  },
  {
    id: 'auc_3',
    title: 'Индивидуальная настройка телеметрии и тюнинг от FSB Racing',
    description:
      'Командный инженерный разбор: FSB Bosfor и FSB Sotik создадут индивидуальный пресет подвески, дифференциала и передаточных чисел под ваш стиль руления в Forza Motorsport.',
    category: 'tune',
    categoryLabel: 'Тюнинг & Телеметрия',
    currentBid: 2800,
    startBid: 500,
    minStep: 200,
    bidsCount: 8,
    leaderName: 'TrackMaster_MSK',
    timeLeftSeconds: getSecondsToNextStream(),
    imageUrl: '/images/auction_telemetry_coach_1794261908518.jpg',
    status: 'active',
    bidsHistory: [
      { id: 'bh_31', bidder: 'TrackMaster_MSK', amount: 2800, time: '14 мин. назад' },
      { id: 'bh_32', bidder: 'DmitryFan', amount: 2500, time: '50 мин. назад' },
    ],
  },
  {
    id: 'auc_4',
    title: 'Выбор кольцевой трассы для 2.4-часового марафона команды',
    description:
      'Голос победителя определит трассу для следующего большого эндуранса с участием всех 4 пилотов команды FSB Racing (Sotik, Bosfor, Forest, Sensei).',
    category: 'track',
    categoryLabel: 'Выбор трассы',
    currentBid: 1900,
    startBid: 300,
    minStep: 100,
    bidsCount: 11,
    leaderName: 'SpaLover',
    timeLeftSeconds: getSecondsToNextStream(),
    imageUrl: '/images/forza_racing_car_1794261906314.jpg',
    status: 'active',
    bidsHistory: [
      { id: 'bh_41', bidder: 'SpaLover', amount: 1900, time: '22 мин. назад' },
      { id: 'bh_42', bidder: 'MonzaKing', amount: 1800, time: '1 ч. назад' },
    ],
  },
  {
    id: 'auc_5',
    title: 'Фирменный стикерпак и открытка с личным автографом Дмитрия',
    description:
      'Памятный сувенирный набор из Нижегородской области: автовинил команды FSB Racing, нашивка и открытка с тёплыми словами от FSB Sotik. Доставка по РФ включена.',
    category: 'special',
    categoryLabel: 'Мерч & Сувениры',
    currentBid: 2400,
    startBid: 500,
    minStep: 100,
    bidsCount: 16,
    leaderName: 'Pavel_NN',
    timeLeftSeconds: getSecondsToNextStream(),
    imageUrl: '/images/fsb_racing_team_1794261906664.jpg',
    status: 'active',
    bidsHistory: [
      { id: 'bh_51', bidder: 'Pavel_NN', amount: 2400, time: '12 мин. назад' },
      { id: 'bh_52', bidder: 'SotikBrother', amount: 2200, time: '35 мин. назад' },
    ],
  },
];
