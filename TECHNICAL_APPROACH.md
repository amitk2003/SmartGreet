# Technical Approach Document
## ClaasPlus – Custom Greetings & Wishes App (Full-Stack Upgrade)

**Author:** Amit Kumar  
**Project Type:** MERN Stack Web Application Upgrade

---

## 1. Problem-Solving Approach & Architecture Transition

### The Core Challenge
The original application was built using pure Vanilla JS, HTML, and CSS to quickly prototype the canvas-based image overlay system. However, to support real user accounts, persistent templates, and premium payment gateways, the application required a full-stack architecture. 

The main technical challenge shifted from "How do we render an image?" to **"How do we build a scalable, secure, and maintainable platform for digital assets?"**

### Architecture Decision: MERN Stack
I upgraded the architecture to the **MERN Stack (MongoDB, Express, React, Node.js)** because:
- **React (with Vite)** allows for a snappy Single Page Application (SPA) experience and component reusability.
- **Node.js & Express** provide a fast, non-blocking backend ideal for handling REST API requests and Stripe webhooks.
- **MongoDB** offers a flexible schema for storing varied template metadata and user profiles.

---

## 2. Tools & Technologies Used

| Layer | Technology | Purpose & Justification |
|-------|-----------|-------------------------|
| **Frontend Framework** | React 19 (Vite) | Component-based UI, efficient rendering, and extremely fast HMR via Vite. |
| **Routing** | React Router v7 | Client-side routing for seamless navigation between Home, Auth, and Profile pages. |
| **HTTP Client** | Axios | Simplified API requests to the backend with interceptors for JWT token attachment. |
| **UI Feedback** | React Hot Toast | Elegant and accessible toast notifications for success/error messages. |
| **Backend Runtime** | Node.js & Express.js | Creating RESTful API endpoints for auth, templates, and payments. |
| **Database & ORM** | MongoDB & Mongoose | NoSQL database for flexible data modeling of users, templates, and subscriptions. |
| **Authentication** | JWT & bcryptjs | Secure password hashing and stateless session management via JSON Web Tokens. |
| **File Handling** | Multer | Middleware for handling `multipart/form-data` to process user profile photo uploads. |
| **Payments** | Stripe | Handling secure, real-world checkout sessions for the Premium Tier upgrade. |

---

## 3. Implementation Deep Dive

### Authentication Flow (Upgraded)
We migrated from a simulated `localStorage` approach to a secure JWT implementation:
1. User submits credentials (React).
2. Backend hashes password using `bcryptjs` and saves to MongoDB.
3. Backend issues a JWT signed with a secret key.
4. React stores the JWT and attaches it as a `Bearer` token in the `Authorization` header for subsequent Axios requests.

### Stripe Payment Integration
We replaced the mock premium popup with a real Stripe integration:
- **Frontend:** Uses the Stripe Publishable Key to redirect users to a secure Stripe Checkout page.
- **Backend:** Uses the Stripe Secret Key to create the checkout session and securely verify transactions to grant "Premium" status to the user's database record.

### Canvas Integration in React
Instead of querying the DOM globally (`document.getElementById`), the HTML5 Canvas logic was refactored to use React's `useRef` hook. This ensures the canvas rendering functions only interact with the DOM elements managed by the specific component, preventing side-effects.

---

## 4. Key Challenges Faced & Solutions

### Challenge 1: Migrating Canvas Logic to React
**Problem:** The original Vanilla JS code heavily relied on direct DOM manipulation to read user inputs and draw on the canvas, which contradicts React's declarative nature.
**Solution:** I utilized the `useRef` hook to get a reference to the `<canvas>` element and encapsulated the drawing logic (`composeCard`, `drawBackground`, `drawUserOverlay`) within `useEffect` hooks or specific event handlers.

### Challenge 2: Secure Payment Integration (Stripe)
**Problem:** Need to transition from a fake premium toggle to a secure, real-world payment flow without exposing sensitive API keys on the client.
**Solution:** I split the logic. The frontend only holds the **Publishable Key** to initiate the UI flow. The actual checkout session generation and payment verification happen on the Express backend using the **Secret Key**. 

### Challenge 3: Handling Multipart Image Uploads
**Problem:** Sending user profile photos alongside JSON data (like name and email) to the backend. JSON standard doesn't support binary file data well.
**Solution:** Integrated `multer` on the Express backend. The React frontend sends data as `FormData` instead of `application/json`. Multer parses the incoming files and makes them available in the `req.file` object for processing or saving to disk/cloud.

### Challenge 4: Managing Global User State
**Problem:** The user's authentication state and premium status need to be accessed by multiple components (Header, Template Grid, Premium Modal). Passing props down deeply (prop drilling) became messy.
**Solution:** Used React Context API (or state management) to wrap the application in an `AuthProvider`, making user data easily accessible to any component via a custom `useAuth` hook.

---

## 5. Future Improvements

- **Cloud Storage:** Transition from local filesystem uploads (Multer disk storage) to AWS S3 or Cloudinary for scalable image hosting.
- **Webhooks:** Implement Stripe webhooks to automatically handle subscription renewals and cancellations asynchronously.
- **Optimization:** Implement lazy loading for the template grid images to improve Initial Page Load performance.

---

*Document updated for ClaasPlus Full-Stack Transition*
