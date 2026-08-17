# Jeevan (MERN Blood Donation Lifeline)

Jeevan is a premium full-stack MERN (MongoDB, Express, React, Node.js) conversion of the classic Blood Link Python/Flask application. It matches patients in critical need directly with nearby available compatible donors, calculating real-world proximity distances using the Haversine formula and OpenStreetMap geocoding.

---

## 1. Feature Map (Flask & CSV to MERN)

| Blood Link (Flask) | Jeevan (MERN) | Description |
| :--- | :--- | :--- |
| **Flask Backend** | Node.js + Express.js | Robust REST API with MVC pattern. |
| **CSV Storage** | MongoDB Atlas (Mongoose ODM) | Fully queryable documents for Users and Requests. |
| **Bootstrap 5** | React.js + Tailwind CSS | Sleek, dark-mode glassmorphic user interface. |
| **Google OAuth** | Passport.js + Dev Bypass | Google Authentication alongside JWT local email/password sign-in. |
| **WhatsApp Chat** | WhatsApp Click-to-Chat API | Instantly opens a pre-filled emergency template message using free `wa.me` links. |
| **Google Maps** | OpenStreetMap / Nominatim | Translates address strings to coordinates automatically for **free** (no API key needed). |
| **24-hr Expire** | MongoDB TTL Indexes | Automatic document deletion from the database exactly 24 hours after creation. |
| **Matching Query**| Express Route Matrix Logic | Filters available donors based on blood compatibility tables. |

---

## 2. Advanced Innovation Add-ons

1. **Smart Proximity & Proximity Ranking (Innovation A)**:
   - Matches are not just based on blood groups. Jeevan uses the **Haversine formula** to compute physical distances between the donor's coordinates and the hospital coordinates.
   - Donors are sorted in ascending order of distance (closest first), with a secondary sorting key based on their last availability toggle timestamp to prioritize active responses.

2. **SMS Fallback via Twilio (Innovation B)**:
   - When an emergency request is created, Jeevan automatically triggers fallback SMS alerts to the top 3 closest compatible donors.
   - **Simulated Test Feed**: If Twilio credentials are not set in the `.env`, the app automatically logs and routes the message payload to a visual **Live SMS Simulation Outbox Feed** on the dashboard. This allows for zero-cost, seamless testing and demonstrations.

---

## 3. Project Structure

```
Jeevan/
│
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB mongoose connector
│   │   └── passport.js              # Google OAuth passport configuration
│   ├── models/
│   │   ├── User.js                  # User, phone validation, locations, isAvailable
│   │   └── BloodRequest.js          # PatientName, hospital coordinates, TTL index
│   ├── controllers/
│   │   ├── authController.js        # Register, login, mock Google bypass
│   │   ├── userController.js        # Profile edits, availability toggles
│   │   └── requestController.js     # Proximity calculation, compatibility matching, SMS triggers
│   ├── routes/
│   │   ├── authRoutes.js            # Authentication routes
│   │   ├── userRoutes.js            # Availability status triggers
│   │   └── requestRoutes.js         # Match routes and simulation feed
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT header token validator
│   ├── utils/
│   │   ├── geocode.js               # Nominatim OpenStreetMap Geocoder
│   │   └── smsService.js            # Twilio alert dispatcher / Simulation outbox log
│   ├── seed.js                      # DB seeding script with mock Indian metro donors
│   ├── server.js                    # Main Express server entry point
│   └── .env                         # Ports and environment credentials
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Nav header with live availability switch
    │   │   ├── DonorCard.jsx        # Matched donor visualizer (WhatsApp & Map Link)
    │   │   └── RequestCard.jsx      # Active emergency calls (Remaining hours countdown)
    │   ├── context/
    │   │   └── AuthContext.jsx      # Context state for local, Google, and profile events
    │   ├── services/
    │   │   └── api.js               # Intercepted Axios request client
    │   ├── pages/
    │   │   ├── Home.jsx             # Public landing page with Quick Lookup Sandbox
    │   │   ├── Login.jsx            # glassmorphic Auth portal (with 1-click test logs)
    │   │   ├── Register.jsx         # Sign up with Indian phone and location geocoding
    │   │   ├── Dashboard.jsx        # Live stats, user requests, and Live SMS simulation terminal
    │   │   ├── CreateRequest.jsx    # Emergency posting form
    │   │   ├── DonorList.jsx        # Proximity matches list showing active notifications
    │   │   └── Profile.jsx          # Profile settings
    │   ├── App.jsx                  # Router setup and Route Guarding
    │   ├── main.jsx                 # Vite mounting root
    │   └── index.css                # Base Tailwind directives and custom animation classes
    ├── tailwind.config.js           # Theme settings and file directories content scanning
    ├── postcss.config.js            # Styles compiling configs
    └── index.html                   # HTML base template with SEO optimization tags
```

---

## 4. Run Locally

### Prerequisites
- Node.js installed
- MongoDB installed locally and running, or a MongoDB Atlas cloud connection URI.

### Step 1: Clone and install backend packages
```bash
# Go to backend
cd backend
npm install

# Start database seeding to populate mock donors across Chennai, Bangalore, and Mumbai
node seed.js
```

### Step 2: Configure Environment Variables
Edit `backend/.env` (optional, default values will run the app with local database fallback):
- `MONGO_URI`: Set to your MongoDB Atlas connection string (or leave blank to use local `mongodb://127.0.0.1:27017/jeevan`).
- `JWT_SECRET`: Security encryption key.
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`: Twilio SMS settings (optional).

### Step 3: Run Servers

1. **Start backend Express server**:
   ```bash
   cd backend
   npm run dev
   # Binds to port 5000
   ```

2. **Start frontend Vite development server**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   # Opens page at http://localhost:5173/
   ```

---

## 5. Verification Checklist (Interactive Demo Flow)

1. **Proximity Search Sandbox**: On the landing page, perform a search for blood group `O-` at `T Nagar, Chennai`. Observe that matched donor cards load instantly displaying correct distance markings (Rajesh Kumar is at `0.00 km` since he's pre-seeded at T Nagar!).
2. **One-Click Sandbox Authentication**: Navigate to `/login`. Click the **Rajesh (O- Donor)** sandbox button. It logs you in and redirects to the Dashboard.
3. **Live Availability Toggle**: On the dashboard or in the navbar, toggle the Availability switch. The status will change dynamically.
4. **Post an Emergency Request**: Click **Request Blood** in the navbar. Request `A+` blood for patient `Sanjay Dutt`, `2` units, at `Adyar, Chennai`. Submit the request.
5. **Verify Spatial Distance Sorting**: Observe you are redirected to the matching page showing Priya Sundaram `A+` at `0.00 km` (she is pre-seeded at Adyar) and Rajesh Kumar `O-` at `5.51 km` (compatible universal donor at T Nagar, Chennai). Both show green WhatsApp message keys and Map search links.
6. **Live SMS Fallback simulation**: Navigate back to the Dashboard. Verify the **SMS Fallback System Log** block. It will display the simulated SMS alerts dispatched to the matched donors detailing patient name, units, and distance.
