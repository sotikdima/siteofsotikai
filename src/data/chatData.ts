import { ChatMessage } from '../types/chat';

export const INITIAL_TWITCH_MESSAGES: ChatMessage[] = [
  { id: 'tw_1', author: 'FSB_Bosfor', text: 'Дима, шины спереди прогрелись, держи давление 2.1 bar!', time: '14:48', badge: 'FSB', badgeColor: 'bg-red-600 text-white', isMod: true, color: '#dc2626' },
  { id: 'tw_2', author: 'ForzaRacer99', text: 'Дима красава! Какой сетап подвески на Nordschleife?', time: '14:49', badge: 'VIP', badgeColor: 'bg-amber-500 text-slate-950', isVip: true, color: '#d97706' },
  { id: 'tw_3', author: 'NizhnyNovgorod_Fan', text: 'Привет из Нижнего Новгорода! Держим кулаки за топ-1 🏁', time: '14:50', color: '#2563eb' },
  { id: 'tw_4', author: 'FSB_Sensei', text: 'I am watching from Dublin! Great apex on turn 4! 🔥', time: '14:51', badge: 'FSB', badgeColor: 'bg-emerald-600 text-white', color: '#059669' },
  { id: 'tw_5', author: 'SimRacer_Pro', text: 'Капец он культями рулит лучше чем я двумя руками с педалями 👏 уважение огромное', time: '14:52', color: '#7c3aed' },
  { id: 'tw_6', author: 'FSB_Forest', text: 'Hallo aus Deutschland! Bosfor, er ist 0.3s schneller als gestern!', time: '14:53', badge: 'FSB', badgeColor: 'bg-purple-600 text-white', isMod: true, color: '#9333ea' },
];

export const INITIAL_SITE_MESSAGES: ChatMessage[] = [
  { id: 'st_1', author: 'Дмитрий (FSB Sotik)', text: 'Привет всем зрителям на СайтСотика! Рад видеть каждого на стриме Forza Motorsport 🎮', time: '14:45', badge: 'СТРИМЕР', badgeColor: 'bg-amber-500 text-slate-950', isMod: true, color: '#b45309' },
  { id: 'st_2', author: 'Валера Волжский (FSB Bosfor)', text: 'Команда на месте! Настраиваем лобби для следующей гонки', time: '14:47', badge: 'FSB Racing', badgeColor: 'bg-red-600 text-white', color: '#dc2626' },
  {
    id: 'st_3',
    author: 'Алексей_Кстово',
    text: 'Отправил донат через ЮMoney на развитие канала и команды! Жги, Дима, верим в топ-1 на Nordschleife! 🏁',
    time: '14:50',
    badge: 'ЮMoney 500 ₽',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold',
    color: '#059669',
    donation: {
      amount: 500,
      currency: 'RUB',
      service: 'yoomoney',
      status: 'paid',
      targetWallet: '4100117753597226',
    },
  },
  { id: 'st_4', author: 'ApexKing', text: 'Кто на аукционе за Porsche 911 GT3 бьется? Я ставку поднял!', time: '14:52', color: '#0284c7' },
  {
    id: 'st_5',
    author: 'Mikhail_NN',
    text: 'Дмитрий, уважение за силу духа! Донат на апгрейд сетапа через ЮMoney 💪',
    time: '14:54',
    badge: 'ЮMoney 1 000 ₽',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold',
    color: '#7c3aed',
    donation: {
      amount: 1000,
      currency: 'RUB',
      service: 'yoomoney',
      status: 'paid',
      targetWallet: '4100117753597226',
    },
  },
];
