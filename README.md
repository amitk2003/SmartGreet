# 🎉 ClaasPlus – Personalized Greetings & Wishes App

> A beautifully designed web app that lets you create personalized greeting cards with your photo and name, then share them instantly.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge)](./index.html)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📸 Screenshots

| Login Page | Home / Template Grid | Card Preview + Share |
|------------|----------------------|----------------------|
| Auth with Google/Email/Guest | 16+ categorized templates with live preview | Canvas-rendered card with sharing options |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Sign in with Google (simulated), Email/Password, or Guest |
| 🎨 **16+ Templates** | Birthday, Anniversary, Festival, Love, Motivational |
| 👤 **Live Preview** | Your profile photo + name overlaid on every template card |
| 🖼️ **Canvas Composer** | HTML5 Canvas API merges all layers into one downloadable image |
| 💬 **Multi-Platform Share** | WhatsApp, Instagram, Email, Twitter, Web Share API |
| 👑 **Premium System** | Free vs. Premium badges, subscription upsell popup |
| ✏️ **Profile Editor** | Update name and photo anytime |
| 🔍 **Search + Filter** | Filter by category, search by keyword |
| 📱 **Responsive** | Works on mobile and desktop |

---

## 🚀 Getting Started (No Installation Needed!)

This is a **pure HTML/CSS/JavaScript** app. No frameworks, no npm, no build step.

### Option 1: Open Directly in Browser
```bash
# Just open index.html in your browser
# Windows:
start index.html

# Mac:
open index.html
```

### Option 2: Run a Local Server (Recommended)
```bash
# Using Python (built into most systems)
python -m http.server 3000

# Then visit: http://localhost:3000
```

```bash
# Using Node.js live-server
npx live-server --port=3000
```

```bash
# Using VS Code
# Install "Live Server" extension and click "Go Live"
```

---

## 📁 Project Structure

```
claasplus/
├── index.html                  # Entry point – Login/Auth page
├── README.md                   # This file
├── TECHNICAL_APPROACH.md       # Technical deep-dive document
│
├── src/
│   ├── css/
│   │   ├── global.css          # Design tokens, resets, utilities
│   │   ├── auth.css            # Login/Register page styles
│   │   └── home.css            # Home page, grid, modals
│   │
│   ├── js/
│   │   ├── utils.js            # Shared helpers (toast, storage, image)
│   │   ├── auth.js             # Authentication logic
│   │   ├── templates-data.js   # All greeting card template data
│   │   ├── canvas-composer.js  # ⭐ Core: HTML5 Canvas layer rendering
│   │   └── home.js             # Home page controller
│   │
│   └── pages/
│       └── home.html           # Main home/dashboard page
│
└── assets/
    ├── templates/              # (Extensible: add real images here)
    └── icons/                  # App icons
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup, Canvas API |
| **Vanilla CSS** | Custom design system, animations, glassmorphism |
| **Vanilla JavaScript** | No frameworks – pure ES6+ |
| **HTML5 Canvas API** | Image layer composition (background + pattern + user overlay) |
| **Web Share API** | Native device sharing on supported browsers |
| **LocalStorage** | Simulated auth persistence, user profile storage |
| **Google Fonts** | Inter + Poppins typography |

---

## 🎯 App Flow

```
1. User opens app → index.html
2. Chooses: Google / Email / Guest login
3. Redirected to home.html
4. Sees template grid with their photo + name already overlaid
5. Clicks Free template → Card Preview Modal opens
   → Canvas renders their card (background + pattern + user overlay)
   → User can share to WhatsApp, Email, Instagram, etc.
   → Or download as PNG
6. Clicks Premium template → Subscription popup
   → If subscribed → unlocks all premium templates
7. Can edit profile (name, photo) anytime
```

---

## 🧑‍💻 How the Canvas Overlay Works (Simplified)

```javascript
// Think of it like Photoshop layers – drawn bottom to top:

async function composeCard(canvas, template, user) {
  // Layer 1: Background gradient
  drawBackground(ctx, template);
  
  // Layer 2: Decorative patterns (dots, stars, hearts...)
  drawPattern(ctx, template);
  
  // Layer 3: Template emoji + title + wish text
  drawDecorations(ctx, template);
  
  // Layer 4: USER's photo (clipped to circle) + name (text)
  await drawUserOverlay(ctx, template, user);
  
  // → Export as single PNG
}
```

---

## 👤 Demo Credentials

| Method | Details |
|--------|---------|
| Google | Click "Continue with Google" → auto signs in as "Amit Kumar" |
| Email | Any email + password (6+ chars) → creates account |
| Guest | Click "Continue as Guest" → no signup needed |

---

## 📦 Extending the App

### Adding a new template:
```javascript
// In src/js/templates-data.js, add to TEMPLATES array:
{
  id: 'newcat_001',
  category: 'graduation',    // new category
  title: 'Graduation Day',
  wish: '🎓 Congratulations on your achievement!',
  isPremium: false,
  gradient: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
  emoji: '🎓',
  pattern: 'stars',
  accentColor: '#fff'
}
```

### Adding a new category:
```javascript
// In CATEGORIES array:
{ id: 'graduation', label: 'Graduation', emoji: '🎓' }
```

---

## 🚀 Future Improvements

- [ ] Firebase Auth (real Google login)
- [ ] Firebase Firestore (real template database)
- [ ] Cloud Storage for user photos
- [ ] Real payment integration (Razorpay / Stripe)
- [ ] Custom text editor on card
- [ ] More decorative elements (stickers, borders)
- [ ] Progressive Web App (PWA) for mobile install
- [ ] Multi-language support

---

## 📄 License

MIT License – free to use, modify, and distribute.

---

Made with ❤️ for the ClaasPlus Internship Assignment
