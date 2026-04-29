# 📚 NeetNotes — NEET Study Notes Marketplace

A full-stack MERN marketplace where NEET aspirants can browse, purchase, and securely download premium study notes for Class 11 & 12.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Storage | Cloudinary (authenticated PDFs) |
| Payments | Razorpay |
| Auth | JWT (JSON Web Tokens) |

---

## 📁 Project Structure

```
neet-notes/
├── server/
│   ├── models/
│   │   ├── Note.js          # Note schema (subject, class, chapter, price, Cloudinary refs)
│   │   └── User.js          # User schema with purchase history
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Admin Login, /me
│   │   ├── notes.js         # CRUD + secure download route
│   │   └── payment.js       # Razorpay order creation + signature verification
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + adminOnly middleware
│   │   └── cloudinary.js    # Cloudinary config, multer storage, signed URL generator
│   ├── server.js            # Express app entry point
│   └── .env.example         # Environment variables template
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Responsive navbar with auth state
    │   │   └── NotesCard.jsx      # Note card with Razorpay payment flow
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state (JWT, user, purchases)
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page with hero + features
    │   │   ├── NotesPage.jsx      # Browse notes with filters
    │   │   ├── LoginPage.jsx      # User login
    │   │   ├── RegisterPage.jsx   # User registration
    │   │   ├── SuccessPage.jsx    # Post-payment download page
    │   │   ├── MyPurchases.jsx    # User's purchased notes
    │   │   └── AdminDashboard.jsx # Admin CRUD panel
    │   └── App.jsx                # Router + protected routes
    └── .env.example
```

---

## ⚙️ Environment Variables Setup

### Server (`server/.env`)

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
# Get from: https://cloud.mongodb.com → Connect → Connect your application
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/neet-notes?retryWrites=true&w=majority

# JWT — Use a strong random secret in production!
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d

# Cloudinary — https://cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay — https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Razorpay account (test mode for development)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Server
cd server
cp .env.example .env
# Fill in all values in .env

# Client
cd ../client
cp .env.example .env
```

### 3. Create First Admin User

After starting the server, use a REST client (Postman/Thunder Client) or curl:

```bash
# Register a regular user first, then manually update role in MongoDB Atlas:
# Collection: users → find your document → change role from "user" to "admin"

# Or use MongoDB Compass / Atlas Data Explorer to set role: "admin"
```

### 4. Cloudinary Setup — IMPORTANT

To keep PDFs private (not publicly accessible by URL):

1. Log into [Cloudinary Console](https://console.cloudinary.com)
2. Go to **Settings → Security**
3. Enable **"Restricted media types"** or ensure the `neet-notes/pdfs` folder uses **authenticated delivery**
4. The code sets `access_mode: "authenticated"` which requires signed URLs for access ✅

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev      # Uses nodemon for hot reload

# Terminal 2 — Frontend
cd client
npm run dev      # Vite dev server at http://localhost:5173
```

---

## 💳 Razorpay Integration Flow

```
User clicks "Buy Now"
    ↓
POST /api/payment/create-order  ← Creates Razorpay order server-side
    ↓
Razorpay Checkout Modal opens (client-side)
    ↓
User completes payment
    ↓
POST /api/payment/verify  ← Validates HMAC SHA256 signature + amount
    ↓
Purchase recorded in User.purchases[]
    ↓
Signed Cloudinary URL generated (expires in 1 hour)
    ↓
User redirected to /success with download link
```

### Test Cards (Razorpay Test Mode)
| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | 1234 |

---

## 🔒 Security Architecture

| Threat | Mitigation |
|--------|-----------|
| PDF URL leakage | Cloudinary `authenticated` access mode — URLs don't work without signature |
| Payment tampering | Server-side HMAC SHA256 signature verification |
| Price manipulation | Server fetches order amount from Razorpay and verifies against DB price |
| Unauthorized download | JWT-protected `/download` route + purchase history check |
| Admin impersonation | Separate admin login endpoint + `role: "admin"` check on every admin route |
| Replay attacks | Razorpay order IDs are single-use |

---

## 📡 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | User login → JWT |
| POST | `/api/auth/admin/login` | Public | Admin login → JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Notes
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/notes` | Public | List notes (no PDF URLs) |
| GET | `/api/notes/:id` | Public | Single note details |
| GET | `/api/notes/:id/download` | Protected + Purchased | Get signed URL |
| POST | `/api/notes` | Admin | Upload note + PDF |
| PUT | `/api/notes/:id` | Admin | Update note metadata |
| DELETE | `/api/notes/:id` | Admin | Delete note + Cloudinary file |
| GET | `/api/notes/admin/all` | Admin | All notes including inactive |

### Payment
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/payment/create-order` | Protected | Create Razorpay order |
| POST | `/api/payment/verify` | Protected | Verify payment signature |
| GET | `/api/payment/purchases` | Protected | User's purchase history |

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Set all environment variables in platform dashboard
2. `npm start` as the start command
3. Update `CLIENT_URL` to your deployed frontend URL

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 🛠️ Production Checklist

- [ ] Use `rzp_live_` Razorpay keys (not test keys)
- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set `CLIENT_URL` to exact production domain
- [ ] Verify Cloudinary folder access mode is `authenticated`
- [ ] Set up MongoDB Atlas IP allowlist
- [ ] Enable Razorpay Webhook for payment failure handling

---

## 📄 License

MIT — Build something great for NEET aspirants! 🎯
