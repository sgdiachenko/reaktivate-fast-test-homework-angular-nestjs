# reaktivate-fast-test-homework — Angular + NestJS

Angular/NestJS-версія React-starter для тестового завдання **Fast-Test Homework**.
Саме завдання — у [TASK.md](TASK.md).

Starter навмисно незавершений, як і оригінальний `main`: список книг завантажується
й відображається, кнопка **Add** — заглушка (`alert('TBD')`), логіка живе прямо в компоненті.

## Склад

```
client/              Angular 22 — starter, який треба рефакторити
server/              NestJS 12 + Mongoose — локальна заміна зовнішнього API
docker-compose.yml   MongoDB 8.0, дані в Docker volume reaktivate-books-mongo-data
TASK.md              адаптоване завдання
```

## Вимоги

- Node.js `^22.22.3`, `^24.15.0` або `>=26` (вимога Angular 22), npm 10+
- Docker із Compose v2 (Docker Desktop)
- Вільні порти: `27017` (MongoDB, лише 127.0.0.1), `3000` (API), `4200` (Angular)

## Запуск

Усі команди — з кореня репозиторію.

```bash
# 1. MongoDB (чекає, доки контейнер стане healthy)
docker compose up -d --wait

# 2. API
cd server
npm ci
cp .env.example .env     # необов'язково: значення за замовчуванням ті самі
npm run seed
npm run start:dev        # http://localhost:3000
```

В іншому терміналі:

```bash
# 3. Клієнт
cd client
npm ci
npm start                # http://localhost:4200
```

Відкрийте <http://localhost:4200> — має з'явитися 5 книг із seed і кнопка Add.

Зупинка: `Ctrl+C` у терміналах API та клієнта, потім `docker compose stop` (або `docker compose down`).

## Seed

```bash
cd server
npm run seed
```

Додає 5 синтетичних книг: 3 спільні (без власника) і 2 приватні користувача `demo`.
У кожної фіксований `_id`, тому повторний запуск нічого не дублює
(`Seed: inserted 0, already present 5`). Додані вами книги seed не змінює й не видаляє.

## Дані та перезапуск

MongoDB зберігає дані в окремому named volume `reaktivate-books-mongo-data`.
`docker compose stop`/`start`, `docker compose down`/`up` і перезапуск API дані не видаляють.

Повністю очистити БД: `docker compose down -v` (видаляє volume), потім знову
`docker compose up -d --wait` і `npm run seed` у `server/`.

## Конфігурація

`server/.env` (шаблон — `server/.env.example`, секретів немає):

| Змінна        | За замовчуванням                           |
| ------------- | ------------------------------------------ |
| `PORT`        | `3000`                                     |
| `MONGODB_URI` | `mongodb://localhost:27017/reaktivate-books` |
| `CORS_ORIGIN` | `http://localhost:4200`                    |

Клієнт бере адресу API з `client/src/app/shared/config.ts`
(`http://localhost:3000/v1/books/demo`, як `config.js` в оригіналі). Якщо змінюєте `PORT`
або nickname — змініть і там.

MongoDB запускається без автентифікації й публікується лише на `127.0.0.1` — це локальна
навчальна БД.

## API

Base URL: `http://localhost:3000/v1/books/:user`, де `:user` — ваш nickname.
Контракт повторює swagger старого сервісу (`https://tdd.demo.reaktivate.com/api-docs/`).

| Метод  | Шлях                     | Відповідь                                                  |
| ------ | ------------------------ | ---------------------------------------------------------- |
| `GET`  | `/v1/books/:user`        | `200` масив: спільні книги + книги цього користувача       |
| `GET`  | `/v1/books/:user/private`| `200` масив: лише книги цього користувача                   |
| `POST` | `/v1/books/:user`        | тіло `{ "name": string, "author": string }` → `200 { "status": "ok" }`; порожні/відсутні поля → `400` |
| `PUT`  | `/v1/books/:user/reset`  | `200 { "status": "ok" }`, видаляє книги цього користувача  |

Книга: `{ "id": string, "name": string, "author": string, "ownerId"?: string }`
(`ownerId` є лише в книг користувачів; власником стає `:user` зі шляху, а не поле з тіла).

```bash
curl http://localhost:3000/v1/books/demo/
curl http://localhost:3000/v1/books/demo/private
curl -X POST -H 'Content-Type: application/json' \
  -d '{"name":"My Book","author":"Me"}' http://localhost:3000/v1/books/demo/
```

### Як працював старий API і що замінено

Що вдалося з'ясувати лише безпечними запитами (`GET`, `OPTIONS`, swagger), нічого не
записуючи в старий сервіс:

- `GET /v1/books/{user}/` повертає 3 дефолтні книги (однакові для будь-якого nickname)
  плюс книги, додані цим користувачем; `GET /{user}/private` — лише додані.
- Запис за swagger — `POST /v1/books/{user}/` (тіло — довільний JSON-об'єкт). За формою
  наявних записів схоже, що сервіс зберігає тіло без нормалізації. `PUT /{user}/reset` є в
  swagger, але його поведінку не перевіряли, бо виклик змінив би дані. Тут він видаляє книги
  користувача.
- Сервіс відповідає як Express за проксі Caddy. Яке сховище в нього всередині — невідомо.
  Тут дані зберігаються в MongoDB.

## Перевірки

```bash
# збірка
(cd client && npm run build)
(cd server && npm run build)

# MongoDB healthy
docker compose ps

# API → MongoDB (потрібні запущені MongoDB і API)
curl -s http://localhost:3000/v1/books/demo/

# збереження після перезапуску
docker compose down && docker compose up -d --wait
curl -s http://localhost:3000/v1/books/demo/

# unit-тести (Vitest через ng test)
(cd client && npm test -- --watch=false)
```

Тестів у starter немає, як і в оригіналі. Тому `npm test` завершується з
`No tests found matching the following patterns`, доки не з'явиться перший `*.spec.ts`
у `client/src`. Це очікувано. `npm test` без прапорців запускає watch-режим.

## Відмінності від React-оригіналу

| Оригінал (React)                                 | Тут (Angular)                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `useState` + `useEffect` у `App`                 | `signal` + `ngOnInit` у `App` (`client/src/app/app.ts`)           |
| JSX `list.map(...)`                              | `@for` у `app.html`                                               |
| модульні синглтони `booksRepository`, `ApiGateway` | `@Injectable({ providedIn: 'root' })` + `inject()`                |
| `fetch`                                          | `HttpClient` + `firstValueFrom` (той самий Promise-інтерфейс). На відміну від `fetch`, відповіді не 2xx відхиляють Promise |
| MobX/mobx-react у залежностях, `observer` закоментовано | MobX не потрібен: Signals вбудовані в Angular                 |
| `API_BASE` → `tdd.demo.reaktivate.com/.../postnikov` | `API_BASE` → локальний NestJS, nickname `demo`                 |
| `addBook` робив `POST` на `/books`, якого немає у swagger | `addBook` робить `POST` на `/`, як у контракті. Метод досі ніде не викликається |

## Що залишено для виконання

Усе з [TASK.md](TASK.md):

- **Part 1:** відокремити логіку від View (MVP/MVVM, controllers, Signals), реалізувати
  створення книг через UI, покрити логіку тестами.
- **Part 2:** перемикач All books / Private books, sticky header із лічильником приватних книг
  («Your books: N»).

Готових presenters/controllers, state-management архітектури й тестів у starter немає.

## Примітки щодо залежностей

- `@nestjs/common|core|platform-express` 12.3.2 — у 12.2.0 була вразлива версія `multer`
  (GHSA-q7qp-rjg7-q26m).
- `client/package.json` → `overrides.vite = 8.3.5`: `@angular/build` 22.2.4 фіксує `vite` 8.3.0
  з вразливостями dev-сервера (виправлено у 8.3.3+). Override можна прибрати, коли
  `@angular/build` оновить vite сам.
- `npm audit` для обох застосунків: 0 вразливостей на момент створення.
