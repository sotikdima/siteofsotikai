export interface ProgrammaticBot {
  id: string;
  author: string;
  color: string;
  badge?: string;
  badgeColor?: string;
  texts: string[];
}

interface BotSeed {
  author: string;
  color: string;
  badge?: string;
  badgeColor?: string;
  car: string;
  track: string;
  pilot: string;
}

const COLORS = [
  '#0284c7',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0d9488',
  '#db2777',
  '#4f46e5',
  '#ea580c',
  '#16a34a',
];

const CARS = [
  'Porsche 911 GT3 R (2018)',
  'Ferrari 488 GT3 (2018)',
  'BMW M6 GT3 #1 (2017)',
  'Aston Martin V12 Vantage GT3 #7 (2017)',
  'Nissan GT-R NISMO GT3 #23 (2018)',
  'Lexus RC F GT3 (2017)',
  'Dodge Viper GT3-R #93 (2015)',
  'Bentley Continental GT3 #17 (2014)',
];

const TRACKS = [
  'Nürburgring Nordschleife',
  'Circuit de Spa-Francorchamps',
  'Autodromo Nazionale Monza',
  'Circuit de la Sarthe (Le Mans)',
];

const PILOTS = [
  'FSB Sotik',
  'FSB Bosfor',
  'FSB Forest',
  'FSB Sensei',
];

const BOT_NAMES: string[] = [
  'Алекс_НН', 'Никита_GT3', 'ВолгаРейсер', 'Макс_Apex', 'Серёга_Forza',
  'Диман_911', 'Илья_Spa', 'Артём_ЛеМан', 'Кирилл_Дрифт', 'Денис_Трек',
  'Влад_Мотор', 'Рома_Пилот', 'Егор_Турбо', 'Павел_Сибирь', 'Андрей_Урал',
  'Тимур_GT', 'Костя_Болид', 'Женя_ПитСтоп', 'Миша_Руль', 'Саня_Нижний',
  'Глеб_Шина', 'Олег_Тайминг', 'Витя_Геймпад', 'Юра_Монца', 'Даня_Петля',
  'Стас_Эндуранс', 'Игорь_Слипстрим', 'Матвей_Квала', 'Руслан_Спорт', 'Лёха_Борзо',
  'Вадим_Феррари', 'Богдан_БМВ', 'Гриша_Астон', 'Толя_Лексус', 'Слава_Вайпер',
  'Антон_Бентли', 'Фёдор_Ниссан', 'Марк_Телеметрия', 'Ярослав_Сет', 'Сёма_Финиш',
  'Лёня_Старт', 'Гена_Тормоз', 'Петька_Газ', 'Боря_Шикана', 'Ваня_Поребрик',
  'Зритель_52', 'Фанат_FSB', 'Волжанин_RU', 'СимРейс_Про', 'ТопСектор',
  'НеваГонщик', 'КазаньМотор', 'СамараТрек', 'Екат_Драйв', 'Пермь_Спид',
  'Сочи_Круг', 'Ростов_Асфальт', 'Питер_Дождь', 'Тверь_Рейс', 'Воронеж_GT',
  'Омск_Нитро', 'Томск_Трасса', 'Тюмень_Круиз', 'Уфа_Форза', 'Краснодар_Кар',
  'Мурманск_Айс', 'Саратов_Спорт', 'Тула_Брейк', 'Калуга_Тюн', 'Рязань_КПП',
  'Курск_Сцепление', 'Орёл_Оверстейр', 'Липецк_Кастер', 'Пенза_Развал', 'Тамбов_Сход',
  'Брянск_Спринт', 'Псков_Поул', 'Вологда_Флаг', 'Киров_Стинт', 'Ижевск_ПейсКар',
  'Сургут_Питлейн', 'Барнаул_Бокс', 'Иркутск_Лидер', 'Чита_Обгон', 'Хабаровск_Финал',
  'Владик_JDM', 'Калининград_EU', 'Севастополь_Юг', 'Ялта_Серпантин', 'Крым_Трек',
  'Алина_Racer', 'Даша_GT3', 'Катя_Стрим', 'Лена_Forza', 'Марина_Фан',
  'Оля_Твич', 'Таня_Мотор', 'Вика_Гоночки', 'Юля_Пит', 'Настя_Финиш',
];

const GREETING_LINES = [
  'Всем привет в чатике! Кто сегодня на стриме?',
  'Салют всем гонщикам, как настроение перед заездами?',
  'Заглянул на сайт — дизайн со стеклом и каплями просто огонь!',
  'Привет из Нижегородской области всем нашим!',
  'Кто уже ждёт вечерний стрим в 20:00 МСК?',
  'Доброго времени суток всем фанатам Forza Motorsport!',
  'Всем удачи и чистого асфальта сегодня!',
  'Народ, кто тут давно за FSB Racing болеет?',
  'Зашёл проверить чат и таймеры аукциона перед эфиром.',
  'Всем ровных кругов и отличного настроения в чате!',
];

const STREAM_LINES = [
  'Напоминаю для новеньких: эфиры обычно стартуют ровно в 20:00 МСК.',
  'На Twitch у fsbsotik картинка всегда чёткая в 1080p 60 FPS.',
  'Ждём в 20:00 по Москве запуск лобби и плотную борьбу!',
  'Круто, что на сайте и чат Твича, и наш общий ЧатикСотика рядом.',
  'Кто хочет дуэль 1 на 1 против Димы — заглядывайте в АукционыСотика.',
  'Интересно, какой лот в аукционе сегодня перебьют под самый старт стрима?',
  'Вечерний заезд обещает быть жарким, главное без завалов в первом повороте!',
  'Сегодня к 20:00 МСК народ точно подтянется в прямой эфир.',
  'Если отойти от дел, в ЧатикСотика всё равно приятно почитать ребят.',
  'Смотрю с телефона — интерфейс сам подстроился, очень удобно!',
];

const SKILL_LINES = [
  'До сих пор поражаюсь, как Дима без пальцев так чисто проходит повороты на геймпаде.',
  'Управлять GT3 с механикой и сцеплением без ABS на геймпаде — это высший пилотаж.',
  'История FSB Sotik с 2017 года и Forza Motorsport 7 реально вдохновляет.',
  'Когда кажется, что сложно — вспоминаешь заезды Димы и сразу садишься за руль.',
  'Мёртвая зона 0–1% и прямая линейность руля — вот где нужна ювелирная точность!',
  'Главное на трассе — стабильный темп и беречь резину к концу стинта.',
  'В дождь в Forza Motorsport сразу видно, кто реально чувствует сцепление.',
  'Позднее торможение на апексе решает исход целой гонки.',
  'В драфте на длинной прямой можно отыграть пару десятых перед шиканой.',
  'Правильный баланс тормозов и давление в шинах творят чудеса.',
];

const SITE_CHAT_LINES = [
  'Кто ещё тестил мини-симулятор Time Attack на вкладке Игры?',
  'У кого какой рекорд в FSB Time Attack? Поделитесь цифрами!',
  'Хорошо, что у каждого лота виден точный таймер до начала трансляции.',
  'Донаты через ЮKassa сразу прилетают прямо сюда в ленту чата, удобно.',
  'Приятно пообщаться с нормальными ребятами, пока ждём начало гонки.',
  'Если кто не видел — в разделе Команда расписаны все четыре пилота FSB Racing.',
  'СотикБот тоже забавный, но с живыми зрителями общаться ещё интереснее.',
  'Мужики, какая трасса в Forza Motorsport у вас самая любимая?',
  'Кто на чём сам гоняет: на геймпаде или на руле с педалями?',
  'Всем хороших выходных и побед на виртуальных трассах!',
];

function buildBotTexts(seed: BotSeed, index: number): string[] {
  const g1 = GREETING_LINES[index % GREETING_LINES.length];
  const g2 = GREETING_LINES[(index + 3) % GREETING_LINES.length];
  const s1 = STREAM_LINES[index % STREAM_LINES.length];
  const s2 = STREAM_LINES[(index + 4) % STREAM_LINES.length];
  const k1 = SKILL_LINES[index % SKILL_LINES.length];
  const k2 = SKILL_LINES[(index + 5) % SKILL_LINES.length];
  const c1 = SITE_CHAT_LINES[index % SITE_CHAT_LINES.length];
  const c2 = SITE_CHAT_LINES[(index + 6) % SITE_CHAT_LINES.length];

  const personalized: string[] = [
    g1,
    `Я сегодня голосую за болид ${seed.car} — звук и держак у него шикарные!`,
    `На трассе ${seed.track} любая ошибка в связке сразу стоит пары секунд.`,
    `Болею за пилота ${seed.pilot} — в командных заездах всегда красиво едет!`,
    s1,
    `Интересно, потянет ли кто в аукционе ставку за ${seed.car} на этот стрим?`,
    k1,
    `Лично для меня ${seed.track} — самая атмосферная трасса в календаре Forza.`,
    c1,
    `Как думаете, ${seed.pilot} сегодня зайдёт с нами в мультиплеерное лобби?`,
    g2,
    `В классе GT3 машина ${seed.car} очень стабильно держит быстрые дуги.`,
    s2,
    `Кто-нибудь уже пробовал побить рекорд времени круга на ${seed.track}?`,
    k2,
    `Для ночной или дождевой гонки ${seed.car} подходит просто идеально.`,
    c2,
    `Респект ${seed.pilot} и всей команде FSB Racing за крутые командные эфиры!`,
    `Сравнивал настройки подвески под ${seed.track} — мягкий стаб спереди очень помогает.`,
    `Ждём всех на трассе в 20:00 МСК, пусть победит сильнейший пилот!`,
  ];

  // Guarantee exact 20 unique strings per bot
  const unique = Array.from(new Set(personalized));
  let extraIdx = 0;
  const fallbacks = [...GREETING_LINES, ...STREAM_LINES, ...SKILL_LINES, ...SITE_CHAT_LINES];
  while (unique.length < 20 && extraIdx < fallbacks.length) {
    const candidate = fallbacks[(index + extraIdx) % fallbacks.length];
    if (!unique.includes(candidate)) {
      unique.push(candidate);
    }
    extraIdx++;
  }
  return unique.slice(0, 20);
}

export const PROGRAMMATIC_BOTS: ProgrammaticBot[] = BOT_NAMES.map((author, idx) => {
  const seed: BotSeed = {
    author,
    color: COLORS[idx % COLORS.length],
    ...(idx % 5 === 0
      ? {
          badge: idx % 10 === 0 ? 'FSB Фан' : 'Гонщик',
          badgeColor:
            idx % 10 === 0 ? 'bg-amber-200 text-amber-950' : 'bg-sky-100 text-sky-900',
        }
      : {}),
    car: CARS[idx % CARS.length],
    track: TRACKS[idx % TRACKS.length],
    pilot: PILOTS[idx % PILOTS.length],
  };

  return {
    id: `pbot_${idx + 1}`,
    author: seed.author,
    color: seed.color,
    ...(seed.badge ? { badge: seed.badge, badgeColor: seed.badgeColor } : {}),
    texts: buildBotTexts(seed, idx),
  };
});

export function pickRandomProgrammaticBotMessage(recentTexts: string[] = []): {
  bot: ProgrammaticBot;
  text: string;
} {
  const recentSet = new Set(recentTexts.slice(-25).map((t) => t.trim()));
  const bot = PROGRAMMATIC_BOTS[Math.floor(Math.random() * PROGRAMMATIC_BOTS.length)];
  const freshTexts = bot.texts.filter((t) => !recentSet.has(t.trim()));
  const pool = freshTexts.length > 0 ? freshTexts : bot.texts;
  const text = pool[Math.floor(Math.random() * pool.length)];
  return { bot, text };
}
