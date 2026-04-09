# blue-farm-game-backend
## How to run
1. `npm install`
2. `cp .env.example .env.development`
3. Edit POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB_NAME, BOT_TOKEN, APP_URL, FRONTEND_FOLDER
4. `npm run typeorm:generate`
5. `npm run typeorm:migrate`
6. `npm run seed`
7. `npm run start:dev`