# PriceTrack

A full-stack price tracking platform for Amazon and Flipkart products. View price history graphs, see the lowest recorded price, and get email alerts when a product drops to your target price.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Auth | Firebase Authentication (Email/Password + Google) |
| Database | MongoDB (Mongoose) |
| Scraping | Axios + Cheerio |
| Notifications | Nodemailer (Email) |
| Scheduling | node-cron (price updates every 6h) |

---

## Project Structure

```
price-track/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Firebase Admin & MongoDB setup
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth (Firebase token) & rate limiter
│   │   ├── models/           # Mongoose schemas (User, Product, PriceHistory, TrackedProduct)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Scrapers, price tracker cron, email notifications
│   │   └── server.ts         # App entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # Next.js web application
    ├── src/
    │   ├── app/              # App Router pages
    │   │   ├── page.tsx            # Landing page
    │   │   ├── (auth)/login/       # Login page
    │   │   ├── (auth)/signup/      # Signup page
    │   │   ├── dashboard/          # User's tracked products
    │   │   └── product/[id]/       # Product detail + price chart
    │   ├── components/       # Navbar, PriceChart, ProductCard, SearchBar, AlertForm, TrackButton
    │   ├── context/          # AuthContext (Firebase)
    │   ├── lib/              # Firebase client, API client (Axios)
    │   └── types/            # TypeScript interfaces
    ├── .env.local.example
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for email alerts)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd price-track
npm install          # installs all workspace dependencies
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pricetrack

# From Firebase Console > Project Settings > Service Accounts > Generate new private key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password

FRONTEND_URL=http://localhost:3000
SCRAPE_INTERVAL_HOURS=6
```

### 3. Configure the frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
# From Firebase Console > Project Settings > General > Your apps > Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Enable Firebase Auth

In the Firebase Console, go to **Authentication > Sign-in method** and enable:
- Email/Password
- Google

---

## Running in Development

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Or from the root (requires `concurrently`):

```bash
npm run dev
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/products/track` | Track a product by URL |
| `GET` | `/api/products/tracked` | Get user's tracked products |
| `DELETE` | `/api/products/tracked/:id` | Remove product from tracking |
| `GET` | `/api/products/:id` | Get product details |
| `GET` | `/api/products/:id/history?days=90` | Get price history |

### Alerts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/alerts` | Set/update a price alert |
| `DELETE` | `/api/alerts/:productId` | Remove an alert |

All endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

---

## Manual Price Update

To trigger a price update immediately (outside the cron schedule):

```bash
cd backend
npm run track
```

---

## Building for Production

```bash
# Backend
cd backend && npm run build
node dist/server.js

# Frontend
cd frontend && npm run build
npm start
```

---

## Supported URL Formats

**Amazon:**
```
https://www.amazon.in/Product-Name/dp/B0XXXXXXXXX
https://www.amazon.in/dp/B0XXXXXXXXX
```

**Flipkart:**
```
https://www.flipkart.com/product-name/p/ITEMIDXXXXXXXX
https://www.flipkart.com/product?pid=ITEMIDXXXXXXXX
```

---

## Roadmap

- [ ] Chrome extension
- [ ] AI price prediction
- [ ] Telegram / push notifications
- [ ] Price comparison across platforms
- [ ] Deal discovery feed
- [ ] Multi-country support (amazon.com, amazon.co.uk)
