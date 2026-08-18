# 🩸 Jeevan — Proximity-Based Real-Time Blood Donation Lifeline

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory%2FAtlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

> **Jeevan** is an AI-powered, proximity-based MERN stack blood donation platform engineered to bridge the life-critical gap between emergency patients and compatible donors in real-time. Featuring Server-Sent Events (SSE), MSG91 SMS alerts, gamified impact tracking, and dual English/Hindi multi-language accessibility.

---

## 🌟 Key Architectural Innovations

### 1. ⚡ Real-Time SSE Stream & Push Toast Alerts
- **Server-Sent Events (SSE)** architecture (`/api/requests/live-stream`) delivers sub-second push notifications when donors toggle availability or emergency requests are posted.
- **Zero Polling Overhead**: Keeps long-lived connections with 20-second heartbeat pings and auto-reconnection logic.

### 2. 🏆 Gamified Donation Streak & Impact Dashboard
- **Impact Metrics**: Tracks lifetime donations, estimated lives saved (1 unit = 3 lives saved), and 50-day next-eligible countdown timers.
- **Retention Badges**: Unlocks badges such as **Universal Hero** (O- / O+), **Master Lifesaver** (5+ donations), **Blood Champion** (3+ donations), **First Lifesaver**, and **Verified Lifeline**.

### 3. 🌐 Native English & Hindi Multi-Language Support (`EN` | `हिंदी`)
- Native translation engine with instant header navbar toggle pill (`🌐 EN | हिंदी`).
- Translates navigation links, emergency forms, compatibility guides, dashboard stats, and achievement badges seamlessly with `localStorage` state persistence.

### 4. 📍 AI Proximity Matching & Leaflet Live Donor Maps
- Uses the **Haversine formula** to calculate precise geodesic distances between patient hospitals and nearby active donors.
- Embeds interactive Leaflet map markers with auto-cleanup lifecycle logic preventing memory leaks.
- Integrates **MSG91 SMS gateway** with PII phone masking (`98****1234`) for privacy protection.

---

## 🛠️ System Architecture

```mermaid
graph TD
    User[Client Browser / Mobile] -->|React 18 + Tailwind| Frontend[Vite Frontend]
    Frontend -->|REST API Requests| Express[Node.js Express Server]
    Frontend <--|SSE Event Stream| SSEService[Server-Sent Events Stream Manager]
    Express -->|Haversine Proximity Sorting| MatchEngine[AI Matching & Compatibility Engine]
    Express -->|SMS Dispatch| MSG91[MSG91 SMS Gateway]
    Express -->|CRUD Operations| MongoDB[(MongoDB Atlas / In-Memory Server)]
    MatchEngine -->|Push Event| SSEService
```

---

## 📋 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive glassmorphic UI, high-performance bundling |
| **State & i18n** | React Context API, Custom Translation Engine | Global Auth, SSE Alerts, English & Hindi translation |
| **Backend** | Node.js, Express.js (MVC Pattern) | Scalable REST API with CORS security & JWT Auth |
| **Database** | MongoDB Mongoose ODM, MongoMemoryServer | Hybrid production cloud DB with zero-config in-memory fallback |
| **Real-time** | Server-Sent Events (SSE) | Server push notifications for live emergency requests |
| **SMS Gateway** | MSG91 REST API | Instant SMS dispatch to compatible donors near hospital |
| **Deployment** | Vercel Serverless Functions | Serverless deployment via `vercel.json` |

---

## 📁 Repository Structure

```
Jeevan/
├── backend/
│   ├── config/              # Database connection & JWT secret validator
│   ├── controllers/         # Auth, User, and Blood Request controllers
│   ├── middleware/          # JWT auth guards & security headers
│   ├── models/              # Mongoose schemas (User, BloodRequest)
│   ├── routes/              # Express API endpoint definitions
│   ├── services/            # SSE Manager & MSG91 SMS Service
│   ├── tests/               # Automated unit test suite (Eligibility, Security, SSE, Impact, i18n)
│   ├── utils/               # Haversine distance calculator & Impact badge computer
│   ├── seed.js              # Database seeder with Indian metro donors
│   └── server.js            # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, DonationImpactCard, LiveDonorMap, RequestCard, LiveToast
│   │   ├── context/         # AuthContext, LiveAlertContext, LanguageContext
│   │   ├── i18n/            # English & Hindi translation dictionaries
│   │   ├── pages/           # Home, Dashboard, CreateRequest, MyDonations, Profile, Register
│   │   └── services/        # Axios API interceptor client
│   └── vite.config.js       # Vite bundler configuration
├── vercel.json              # Vercel serverless deployment manifest
└── README.md                # Project documentation
```

---

## ⚡ Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/kanchan874/Jeevan.git
cd Jeevan

# Install backend dependencies
cd backend
npm install

# Populate mock donor database (17 pre-seeded donors across Mumbai, Chennai, Bangalore)
node seed.js

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend App (Port 5173)
cd frontend
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser!

---

## 🧪 Automated Unit Testing

Execute the automated test suite covering eligibility calculation, JWT security, SSE streaming, impact badges, and i18n key parity:

```bash
cd backend
npm test
```

**Test Output:**
```
TAP version 13
ok 1 - Eligibility Calculator - Healthy Adult Donor should be Eligible
ok 2 - Eligibility Calculator - Underage Donor should require Medical Review
ok 3 - Eligibility Calculator - Low Hemoglobin should be Temporarily Deferred
ok 4 - Multi-Language i18n - English and Hindi dictionaries have matching keys
ok 5 - Impact Calculator - Calculates lives saved as 3x donation count
ok 6 - Impact Calculator - Unlocks Universal Hero badge for O- donors
ok 7 - Impact Calculator - Calculates countdown for recent donation
ok 8 - JWT Config - Returns development fallback secret in non-production mode
ok 9 - JWT Config - Throws error in production if JWT_SECRET is missing
```

---

## 🚀 Deploy to Vercel

Jeevan comes pre-configured for 1-click **Vercel Serverless Deployment**:

1. Import repository [`https://github.com/kanchan874/Jeevan`](https://github.com/kanchan874/Jeevan) on Vercel.
2. Set Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `<your_secure_random_key>`
   - `MSG91_AUTH_KEY` = `561614AjnBgvmrZj6a83419bP1`
3. Click **Deploy**!

---

## 👥 Engineering Team & Contributors

| Contributor | Role / Core Focus | GitHub / Profile |
| :--- | :--- | :--- |
| **Kanchan Gaikwad** | Lead MERN Developer & Architecture | [@kanchan874](https://github.com/kanchan874) |
| **Shrushti** | Frontend UI/UX Specialist | [@shrushti88](https://github.com/shrushti88) |
| **Gayatri Vidhate** | Backend & Database Systems | [@gayatri-vidhate](https://github.com/gayatri-vidhate) |
| **Dipansh** | Real-time SSE & API Integration | [@dipansh876](https://github.com/dipansh876) |
| **Utkarsh Punkar** | QA & Security Hardening | [@utkarsh-punkar](https://github.com/utkarsh-punkar) |

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
