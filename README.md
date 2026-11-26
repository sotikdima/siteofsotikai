<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# СайтСотика — официальный сайт Дмитрия Переднего (FSB Sotik)

React/Vite сайт: трансляция Twitch (fsbsotik), двойной чат («ТвичатикСотика» на Twitch и «ЧатикСотика» — чат сайта), донаты через ЮMoney/CloudTips, аукционы, игры, команда FSB Racing.

## Run Locally

**Prerequisites:** Node.js

1. Установите зависимости:
   `npm install --legacy-peer-deps`
2. Заполните `.env` (скопируйте из [.env.example](.env.example)) — см. раздел «Онлайн-чат (Firebase)» ниже.
3. Запустите локально:
   `npm run dev`  →  http://localhost:3000

Или запустите `start.bat` (одним кликом: проверка Node, установка пакетов и старт dev-сервера).

## Онлайн-чат «ЧатикСотика» (Firebase Realtime Database)

Чат на сайта хранится раньше в `localStorage` браузера — каждый зритель видел свою локальную историю,
и это НЕ общий онлайн-чат. Чтобы сделать его общим для всех посетителей и в реальном времени,
проект использует **Firebase Realtime Database** (бесплатный план, домен `siteofsotik.ai.studio` при этом НЕ меняется — сайт остаётся на AI Studio).

### Как подключить

1. Перейдите в https://console.firebase.google.com и создайте проект (можно бесплатный план).
2. В проекте добавьте **Web-приложение** (иконка `</>`): настройки проекта → Общие → Добавить приложение.
3. Включите **Realtime Database** (Build → Realtime Database → Create Database → тестовый режим/режим блокировки).
   Для корректной работы чата в **Правила (Rules)** разрешите чтение и запись авторизованным посетителям, например:
   ```json
   {
     "rules": {
       "siteChat": { ".read": true, ".write": true }
     }
   }
   ```
   ⚠️ На время разработки можно поставить открытый доступ, но перед публикацией лучше ограничить.
4. Скопируйте `firebaseConfig` из настроек приложения (SDK setup → config) и впишите в `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_DATABASE_URL=https://ВАШ_ПРОЕКТ-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Пересоберите и задеплойте сайт на AI Studio. Чат станет общим: сообщения всех посетителей появляются у всех в реальном времени.

Пока переменные Firebase пустые — подписка не создаётся, и чат работает как раньше (локально, fallback на localStorage). После заполнения `.env` и деплоя он автоматически станет онлайн-общим.

## Деплой

Приложение собирается через AI Studio (`https://ai.studio/apps/2ed1654b-09c2-4ef1-ad82-0faa46053baf`).

> Важно: Firebase Hosting дал бы домен вида `*.web.app` и заменил бы красивый `siteofsotik.ai.studio`.
> Поэтому сайт остаётся на AI Studio, а онлайн-чат подключается к Firebase **отдельно** — домен сохраняется.