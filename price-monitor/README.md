# Petrol Scout — Price Monitor

Automated fuel price monitoring for **Tabasco / Centro**, running entirely on Supabase infrastructure.

## Architecture

- **Backend**: Supabase Edge Function (`fetch-prices`) triggered every 30 minutes via `pg_cron` + `pg_net`
- **Database**: PostgreSQL with Realtime enabled for live push notifications
- **Frontend**: Static HTML/JS dashboard (deploy to Netlify)

## How It Works

1. `pg_cron` fires every 30 minutes
2. Calls the `fetch-prices` Edge Function via `pg_net`
3. Edge Function fetches prices from the CNE API (Tabasco/Centro)
4. Compares against stored prices → detects changes
5. Stores snapshots, updates current prices, records changes
6. Optional: sends Telegram notification for detected changes
7. Dashboard receives changes in real-time via Supabase Realtime

## Deploying the Frontend

1. Go to [Netlify](https://app.netlify.com/)
2. Drag and drop the `frontend/` folder
3. The `config.js` file is already pre-configured with your Supabase credentials

## Telegram Setup (Optional)

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Get your chat ID from [@userinfobot](https://t.me/userinfobot)
3. Enter both in the Settings tab of the dashboard

## Database Tables

| Table | Purpose |
|-------|---------|
| `fetch_runs` | Tracks each scheduled fetch execution |
| `station_prices` | Latest known price per station+product |
| `price_snapshots` | Full history of every fetched price |
| `price_changes` | Detected price changes with diff |
| `monitor_config` | Singleton config (active/telegram/interval) |

## Supabase Project

- **Project**: `petrol-scoutapipoller`
- **ID**: `qtqufukpjxpmrfotdqco`
- **URL**: `https://qtqufukpjxpmrfotdqco.supabase.co`
- **Region**: `us-east-1`

## Controls

- **Dashboard toggle**: Pause/resume monitoring from the header
- **Manual refresh**: Click "↻ Refresh" to reload data
- **Browser notifications**: Click the 🔔 bell to enable desktop alerts
