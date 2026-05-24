# Маркетплейс услуг (Supabase)

Гибридная схема: **NextAuth + Prisma** для питомцев, маркета и ленты; **Supabase PostgreSQL + Storage** для услуг, записей и верификации специалистов.

## 1. Создайте проект Supabase

1. [supabase.com](https://supabase.com) → New project (бесплатный тариф).
2. **Settings → API**: скопируйте Project URL, `anon` key, `service_role` key.

## 2. Переменные окружения

Добавьте в `.env.local` (и в Vercel → Environment Variables):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 3. SQL-миграция

В **SQL Editor** выполните файл:

`supabase/migrations/001_services_marketplace.sql`

## 4. Storage

1. **Storage → New bucket** → имя `licenses`, **Private**.
2. Policies: загрузка через service role из приложения (MVP).

## 5. Prisma: роль SPECIALIST

```bash
npx prisma db push
# или
npx prisma migrate dev --name add_specialist_role
```

## 6. Перенос демо-провайдеров (опционально)

```bash
npx tsx scripts/migrate-providers-to-supabase.ts
```

## 7. Маршруты

| Путь | Описание |
|------|----------|
| `/services` | Каталог (только `approved`) |
| `/services/[id]` | Карточка + запись по слотам |
| `/specialist/[id]` | Редирект на `/services/[id]` |
| `/dashboard/client` | Записи клиента |
| `/dashboard/specialist` | Кабинет специалиста |
| `/admin` → вкладка «Специалисты Supabase» | Верификация лицензий |

## 8. Регистрация специалиста

На `/register` выберите **Специалист**, загрузите лицензию. До одобрения админом профиль не показывается в каталоге.

## 9. Проверка типов и сборка

```bash
npm run build
npx tsc --noEmit
```

Без Supabase env каталог fallback на Prisma `ServiceProvider`.
