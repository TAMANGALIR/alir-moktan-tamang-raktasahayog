# Blood Donation Server

A Node.js server built with TypeScript, Express, and Prisma ORM with PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL connection string:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/blood_donation?schema=public"
     ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint (checks database connection)

## Project Structure

```
server/
├── src/
│   └── index.ts          # Main server file
├── prisma/
│   └── schema.prisma     # Prisma schema
├── dist/                 # Compiled JavaScript (generated)
├── node_modules/         # Dependencies
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── prisma.config.ts      # Prisma 7 configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Technologies

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
