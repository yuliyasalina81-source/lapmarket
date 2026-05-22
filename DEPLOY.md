# Деплой ЛапМаркет

## Сайт в интернете

**Production:** https://lapmarket.vercel.app

Каждый `git push` в подключённый репозиторий автоматически пересобирает сайт на Vercel.

## GitHub + автодеплой (один раз)

### Автоматически

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-github.ps1
```

### Если ошибка SSL / «certificate is valid for dns.google»

На ПК часто мешает AdGuard, антивирус или DNS-фильтр. Временно отключите их или смените DNS на `8.8.8.8`, затем снова запустите скрипт.

**Или вручную (5 минут):**

1. Откройте https://github.com/new → имя `lapmarket` → Create repository (без README).
2. В PowerShell в папке проекта (подставьте свой логин GitHub):

```powershell
git remote add origin https://github.com/ВАШ_ЛОГИН/lapmarket.git
git branch -M main
git push -u origin main
```

3. https://vercel.com → проект **lapmarket** → **Settings** → **Git** → **Connect Git Repository** → выберите `lapmarket`.

После этого каждый `git push` будет автоматически обновлять сайт.

## Свой домен (например lapmarket.ru)

1. Купите домен у регистратора (Reg.ru, Timeweb, Namecheap и т.д.) или через Vercel:
   ```bash
   npx vercel domains price lapmarket.ru
   npx vercel domains buy lapmarket.ru
   ```
2. Добавьте домен к проекту:
   ```bash
   npx vercel domains add lapmarket.ru lapmarket
   ```
3. У регистратора укажите DNS по подсказке Vercel (обычно A `76.76.21.21` или CNAME на `cname.vercel-dns.com`).

Проверка: `npx vercel domains inspect lapmarket.ru`

## Переменные окружения (Vercel)

В **Settings → Environment Variables** добавьте:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | PostgreSQL (Neon, Vercel Postgres и т.п.) |
| `AUTH_SECRET` | Секрет сессии (`openssl rand -base64 32`) |
| `AUTH_URL` | URL production, напр. `https://lapmarket.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard → **Storage** → **Blob** → Create → скопировать токен |
| `RESEND_API_KEY` | Resend.com — письма сброса пароля |
| `EMAIL_FROM` | Отправитель, напр. `LapMarket <onboarding@resend.dev>` |
| `CRON_SECRET` | Секрет для `GET /api/cron/reminders` (заголовок `Authorization: Bearer …`) |

Без `BLOB_READ_WRITE_TOKEN` загрузка фото (посты, товары, объявления, аватар) не будет работать.

После первого подключения БД выполните миграции (локально или в CI):

```bash
npm run db:migrate:deploy
```

Опционально seed для демо-данных: `npm run db:seed` (только dev/staging).

## Локальная разработка

```bash
cp .env.example .env
# заполните DATABASE_URL, AUTH_SECRET, AUTH_URL, BLOB_READ_WRITE_TOKEN
npm run db:migrate
npm run db:seed
npm run dev
```

## Ручной деплой без Git

```bash
npx vercel deploy --prod --yes
```
