# Gyro Order App

A mobile-first team lunch ordering app for gyros. Team members open the app on their phones, pick their gyro and sides, and submit — orders appear instantly for everyone.

```
gyro-app/
├── backend/    Python FastAPI — stores orders in SQLite
└── mobile/     Expo (React Native) — iOS, Android & Google Play
```

---

## Quick Start

### 1. Backend (Python)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 2. Mobile App (Expo)

```bash
cd mobile
npm install

# Copy the env file and set your machine's LAN IP
cp .env.example .env
# Edit .env → EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8000

npm start          # opens Expo DevTools
npm run android    # open on Android emulator / device
npm run ios        # open on iOS simulator (macOS only)
```

> **Note:** When testing on a physical device, `localhost` won't reach your
> machine. Find your LAN IP (`ipconfig` / `ifconfig`) and use that in `.env`.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orders` | List all orders (newest first) |
| `POST` | `/orders` | Submit a new order |
| `DELETE` | `/orders/{id}` | Remove a single order |
| `DELETE` | `/orders` | Clear all orders |
| `GET` | `/health` | Health check |

### POST /orders — Request body

```json
{
  "name":      "Alex",
  "gyro_type": "classic",
  "sides":     ["fries", "greek_salad"],
  "notes":     "No onions please"
}
```

**Valid gyro_type values:** `classic` · `chicken` · `pork` · `mixed` · `veggie`  
**Valid sides:** `fries` · `greek_salad` · `rice` · `extra_tzatziki` · `pita`

---

## Menu

### Gyros
| ID | Name | Description |
|----|------|-------------|
| `classic` | 🥙 Classic | Lamb & Beef |
| `chicken` | 🍗 Chicken | Marinated Chicken |
| `pork`    | 🐷 Pork    | Seasoned Pork |
| `mixed`   | 🌯 Mixed   | Lamb, Beef & Pork |
| `veggie`  | 🥦 Veggie  | Grilled Vegetables |

### Sides
| ID | Name |
|----|------|
| `fries` | 🍟 Fries |
| `greek_salad` | 🥗 Greek Salad |
| `rice` | 🍚 Rice |
| `extra_tzatziki` | 🥣 Extra Tzatziki |
| `pita` | 🫓 Extra Pita |

---

## Publishing to Google Play Store

The app uses [EAS Build](https://docs.expo.dev/build/introduction/) — Expo's cloud build service. No local Android SDK needed.

### Step-by-step

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to your Expo account (create one free at expo.dev)
eas login

# 3. Configure the project (run once)
cd mobile
eas build:configure

# 4. Build an Android App Bundle (AAB) for production
npm run build:android
# → EAS builds in the cloud and gives you a download link

# 5. Download the .aab file, then submit to Google Play
eas submit --platform android
```

### Before publishing, update in mobile/app.json:
- `"package"`: change `com.team.gyroapp` to your own reverse-domain package name
- `"versionCode"`: increment for each Play Store release
- `"version"`: human-readable version string

### Assets required (replace placeholders)
- `mobile/assets/icon.png` — 1024×1024 px app icon
- `mobile/assets/splash.png` — 1284×2778 px (or larger) splash image
- `mobile/assets/adaptive-icon.png` — 1024×1024 px Android adaptive icon foreground

---

## Offline Mode

The app works without a backend:

- Orders submitted while offline are stored in `AsyncStorage` on the device
- The Team Orders screen shows cached data with a yellow "Offline" indicator
- When the backend comes back online, pull-to-refresh syncs the latest orders

---

## Development Notes

- **Backend validation** — FastAPI/Pydantic rejects unknown gyro types and sides, caps note length at 300 chars, and strips whitespace from names
- **No auth** — designed for trusted team use on a local network; not suitable for public internet deployment without adding authentication
- **SQLite** — orders persist across server restarts in `backend/orders.db`; for multi-server deployments, swap the DB layer for PostgreSQL
