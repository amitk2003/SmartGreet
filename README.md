# 🎉 GreetMaster – Personalized Greetings & Wishes App

> A beautifully designed full-stack web application that lets you create personalized greeting cards with your photo and name, then share them instantly. Now upgraded with a premium experience!

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📸 Overview

ClaasPlus is a complete MERN-stack application (MongoDB, Express, React, Node.js) featuring user authentication, image uploads, template selection, and premium subscription handling via Stripe.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure Email/Password authentication using JWT and bcrypt. |
| 🎨 **Template Library** | Browse various templates for Birthdays, Anniversaries, Festivals, and more. |
| 🖼️ **Image Processing** | Upload user photos (via Multer) to overlay on custom greeting cards. |
| 💳 **Premium Subscriptions** | Stripe integration to upgrade to a Premium tier and unlock exclusive templates. |
| 💬 **Toast Notifications** | Smooth UI feedback using `react-hot-toast`. |
| 📱 **Responsive UI** | Fast and responsive frontend powered by React and Vite. |

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 19 (via Vite)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Styling:** Vanilla CSS (CSS Modules & Global CSS)

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer
- **Payments:** Stripe integration
- **Environment:** dotenv & cors

---

## 📁 Project Structure

```
claasplus/
├── client/                     # Frontend React App (Vite)
│   ├── src/                    # Source code (Components, Pages, CSS)
│   ├── package.json            # Client dependencies
│   └── .env                    # Frontend environment variables
│
├── server/                     # Backend Node.js/Express API
│   ├── controllers/            # Route controllers
│   ├── routes/                 # API route definitions
│   ├── package.json            # Server dependencies
│   └── .env                    # Backend environment variables
│
├── README.md                   # This file
└── TECHNICAL_APPROACH.md       # Technical deep-dive document
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Stripe Account (for payments)

### 1. Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd claasplus
```

### 2. Backend Setup
```bash
cd server
npm install

# Create a .env file based on environment variables needed:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# STRIPE_SECRET_KEY=your_stripe_secret_key

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal
cd client
npm install

# Create a .env file
# VITE_API_URL=http://localhost:5000/api
# VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key

# Start the Vite development server
npm run dev
```

---

## 🚀 Future Improvements

- [ ] **Animated Video Export**: Convert premium CSS animations into Canvas animations and use the `MediaRecorder` API to export cards as `.mp4` or `.webm` short videos.
- [ ] Complete Firebase Auth integration (Google Login).
- [ ] Implement cloud storage (AWS S3 or Cloudinary) for permanent user photo storage.
- [ ] Advanced image editing (drag, drop, scale photos on the canvas).
- [ ] Progressive Web App (PWA) support.

---

## 📄 License

MIT License – free to use, modify, and distribute.

---

Made with ❤️ for the ClaasPlus Project
