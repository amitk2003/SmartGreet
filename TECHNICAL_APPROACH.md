# Technical Approach Document
## ClaasPlus – Custom Greetings & Wishes App

**Author:** Amit Kumar  
**Date:** April 2026  
**Project Type:** Internship Assignment – Frontend Web App

---

## 1. Problem-Solving Approach

### The Core Challenge
The main technical challenge was: **"How do we show a user's photo and name overlaid on a background template — and let them download it as a single merged image?"**

As a fresher, I broke this problem into small steps:

1. **First, understand the data** — What is a "greeting card"? It's layers:
   - Layer 1: A colorful background (gradient or image)
   - Layer 2: Decorative patterns (dots, stars, hearts)
   - Layer 3: Template emoji + title text + wish message
   - Layer 4: User's profile photo (in a circle) + their name

2. **Find the right tool** — HTML5 `<canvas>` API can draw multiple layers on top of each other, just like Photoshop. Then you can export everything as a single PNG.

3. **Fake the preview in the grid** — For the template grid, we don't need to render a full canvas for every card. Instead, we use CSS positioning to overlay an `<img>` (user's photo) and `<p>` (user's name) on top of a CSS background-gradient div. This is fast and lightweight.

4. **Full canvas render on click** — When the user clicks a template, we render the actual full-resolution card on a `<canvas>` element. This is the downloadable version.

### Architecture Decision: No Framework

I chose **pure Vanilla JS + HTML + CSS** because:
- A fresher should understand fundamentals before frameworks
- No build step, no npm errors, no configuration — just open and run
- The browser's native APIs (Canvas, Web Share, Clipboard) are powerful enough
- Easier for a recruiter to review (no setup needed)

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Markup** | HTML5 (Semantic) | `<canvas>`, `<dialog>`, `<nav>`, `<main>` |
| **Styling** | Vanilla CSS with CSS Variables | Full control, no dependencies, custom dark theme |
| **Logic** | Vanilla JavaScript (ES6+) | Async/await, Modules, Canvas API |
| **Image Composition** | HTML5 Canvas 2D API | Draw layered graphics, export as PNG |
| **Auth Simulation** | LocalStorage | No backend needed for demo |
| **Sharing** | Web Share API + WhatsApp Deep Links | Native mobile sharing |
| **Typography** | Google Fonts (Inter + Poppins) | Professional look |
| **Hosting** | Static (any HTTP server) | No server-side code needed |

**No third-party libraries** were used. Everything is built from scratch.

---

## 3. Image Overlay Logic – Deep Dive

### How `canvas-composer.js` Works

```
User clicks template → openCardPreviewModal() called
    ↓
renderCardCanvas() creates a <canvas> element
    ↓
composeCard(canvas, template, user) is called
    ↓
  ┌─────────────────────────────────────┐
  │  drawBackground(ctx, template)      │  ← Gradient fill (parsed from CSS string)
  │  drawPattern(ctx, template)         │  ← Dots / Stars / Hearts (based on category)
  │  drawDecorations(ctx, template)     │  ← Emoji, Title, Wish Text
  │  drawUserOverlay(ctx, template, user)│  ← Photo circle + Name text
  └─────────────────────────────────────┘
    ↓
Canvas is appended to modal
    ↓
User clicks Download → canvas.toDataURL('image/png') → file download
User clicks Share → canvas.toBlob() → Web Share API / WhatsApp link
```

### Key Code: Drawing the User Photo (Circle Clip)

```javascript
// Step 1: Clip a circular region
ctx.save();
ctx.beginPath();
ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);  // draw circle path
ctx.clip();  // all drawing after this is clipped to the circle

// Step 2: Draw user's photo inside the clipped circle
const img = await loadImage(user.photo);  // loads base64 → Image object
ctx.drawImage(img, x, y, width, height);

ctx.restore();  // remove clip
```

This is the key technique — **canvas clipping** — that makes the avatar appear as a perfect circle.

### Text Rendering on Canvas

```javascript
ctx.font = 'bold 38px Poppins, Inter, sans-serif';
ctx.fillStyle = '#fff';
ctx.shadowColor = 'rgba(0,0,0,0.5)';
ctx.shadowBlur = 8;
ctx.fillText(user.name, textX, nameY);
```

Text shadows are added for readability over bright backgrounds.

---

## 4. Authentication Flow

Since this is a frontend-only demo (no real backend), authentication is simulated using `localStorage`:

```
Google Login  ─┐
Email Login   ─┼── Creates user object → stores in localStorage → redirects to home
Guest Login   ─┘

On home page load: reads user from localStorage → if null, redirect back to login
On logout: clears localStorage → redirect to login
```

**Real-world implementation would use:**
- Firebase Authentication (Google OAuth + Email/Password)
- JWT tokens stored in httpOnly cookies
- Server-side session validation

---

## 5. Premium / Subscription System

```javascript
// When user clicks a premium card:
if (template.isPremium && !currentUser.isPremium) {
    openPremiumModal(template);  // show upsell popup
} else {
    openCardPreviewModal(template);  // go directly to preview
}

// After "Subscribe":
currentUser.isPremium = true;
Storage.set('user', currentUser);  // persist subscription state
```

**Real-world implementation would use:**
- Razorpay / Stripe for payment processing
- Webhook to update user's subscription status in database
- Backend validation of premium status on each template request

---

## 6. Challenges Faced

### Challenge 1: Canvas Text Wrapping
**Problem:** Canvas `fillText()` doesn't support word-wrap. Long wish messages overflow the canvas.

**Solution:** Built a custom `drawWrappedText()` function:
```javascript
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    words.forEach(word => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, x, y);
}
```

### Challenge 2: Loading Images Asynchronously
**Problem:** The canvas `drawImage()` call fails if the image hasn't loaded yet.

**Solution:** Wrapped image loading in a Promise:
```javascript
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
// Usage: const img = await loadImage(user.photo);
```

### Challenge 3: Profile Photo Processing
**Problem:** Users upload large photos in arbitrary aspect ratios. We need a 200×200 circular avatar.

**Solution:** Built `cropImageToSquare()` that:
1. Reads the file as base64
2. Draws it on a temporary canvas with a `ctx.arc()` clip path
3. Exports the cropped result as base64 PNG

### Challenge 4: Sharing on Different Platforms
**Problem:** Web Share API is only available on mobile browsers. Desktop needs different flows.

**Solution:** Platform detection with graceful fallbacks:
```javascript
if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: '...', text: '...' });
} else {
    // Fallback: download the file + open platform URL
    downloadCanvas(canvas, 'greeting.png');
    window.open('https://wa.me/?text=...', '_blank');
}
```

---

## 7. Future Improvements & Scalability

### Short-Term (Next Sprint)
- [ ] **Firebase Auth** – Real Google OAuth, Email verification
- [ ] **Firebase Firestore** – Dynamic template database (admin can add templates)
- [ ] **Firebase Storage** – Store user profile photos in cloud
- [ ] **Custom text editing** – Let users customize the wish text on the card

### Medium-Term
- [ ] **Payment Gateway** – Razorpay / Stripe integration for real subscriptions
- [ ] **PWA Support** – Service worker for offline access, install on mobile home screen
- [ ] **Admin Dashboard** – Add/manage templates without touching code
- [ ] **Analytics** – Track which templates are most popular (Firebase Analytics / Mixpanel)

### Long-Term (Scalable Architecture)
```
Frontend (React/Next.js)
    ↓
API Layer (Node.js + Express or Firebase Functions)
    ↓
Database (Firestore for templates, PostgreSQL for subscriptions)
    ↓
Storage (Firebase Storage / AWS S3 for images)
    ↓
CDN (Cloudflare) for fast global delivery
    ↓
Payment (Razorpay / Stripe) for subscriptions
    ↓
Push Notifications (FCM) for seasonal templates
```

### Performance at Scale
- **Lazy-load** template images (IntersectionObserver)
- **Cache** canvas renders so re-opening same card is instant
- **Paginate** template API (20 templates per page)
- **WebP** format for background images (40% smaller than PNG)
- **CDN** for serving template images globally

---

## 8. Code Quality Practices Used

| Practice | Implementation |
|----------|---------------|
| **Separation of Concerns** | CSS, HTML, JS all separate |
| **DRY Principle** | Shared utils.js for reusable functions |
| **XSS Prevention** | `escapeHtml()` used for all user-generated content |
| **Graceful Degradation** | Fallbacks for Web Share API, Clipboard API |
| **Error Handling** | `try/catch` around all async operations |
| **Comments** | Every function explains the "why", not just the "what" |
| **Accessibility** | `aria-label`, `aria-modal`, semantic HTML |

---

*Document prepared for ClaasPlus Internship Task Submission*
