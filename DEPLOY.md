# Деплой ЛапМаркет

## Сайт в интернете

**Production:** https://lapmarket.vercel.app

Каждый `git push` в подключённый репозиторий автоматически пересобирает сайт на Vercel.

## GitHub + автодеплой (один раз)

В PowerShell из корня проекта:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-github.ps1
```

Скрипт:

1. Войдёт в GitHub через браузер (если ещё не вошли)
2. Создаст публичный репозиторий `lapmarket`
3. Зальёт код
4. Привяжет репозиторий к проекту Vercel

Ручная альтернатива: [vercel.com](https://vercel.com) → проект **lapmarket** → Settings → Git → Connect Repository.

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

## Локальная разработка

```bash
npm run dev
```

## Ручной деплой без Git

```bash
npx vercel deploy --prod --yes
```
