# Technical Approach Document
**Project:** ClaasPlus – Custom Greetings & Wishes App

---

## 1. Problem-Solving Approach: How Image Overlay Logic Was Implemented

The core challenge of the application was allowing users to seamlessly inject their profile photo and name into custom greeting card templates. To achieve this without relying on heavy third-party image manipulation libraries, the solution was built using the native **HTML5 `<canvas>` 2D API**.

The image overlay logic works by treating the canvas like a layered composition (similar to Photoshop):
1. **Background Layer (`drawBg`):** Draws the base template gradient or fetches and draws an external background image URL.
2. **Decoration Layer (`drawDecorations`):** Renders static template elements such as emojis and the title.
3. **Text Formatting:** Since the native Canvas API does not support text-wrapping, a custom mathematical `wrapText` function splits the user's custom wish into words, measures their pixel width via `ctx.measureText()`, and calculates line breaks to keep the text within the card's boundaries.
4. **User Profile Overlay (`drawUserOverlay`):** This is the crucial layer. It utilizes `ctx.clip()` to create a perfect mathematical circle. It then loads the user's uploaded profile picture (converted to base64) and draws it exactly within that clipped region, ensuring a modern, circular avatar aesthetic, followed by the user's name string.
5. **Advanced Video Export:** For premium animated templates, the static layers are drawn to an off-screen canvas. Then, an active `requestAnimationFrame` loop draws moving elements (like twinkling stars) over the static base. The browser's native `MediaRecorder` API captures this 30fps canvas stream and exports it as a playable `.webm` video.

---

## 2. Tech Stack

The application has been engineered as a robust **MERN Stack** Web App, leveraging the following tools and frameworks:

**Frontend (Client)**
- **React 19 (via Vite):** Chosen for its component-based architecture and Vite's incredibly fast Hot Module Replacement (HMR) during development.
- **React Router v7:** Enables seamless Single Page Application (SPA) navigation without page reloads.
- **Axios:** Handles HTTP requests to the backend, utilizing interceptors to automatically attach authentication headers.
- **React Hot Toast:** Provides elegant, accessible, and non-blocking UI notifications.

**Backend (Server)**
- **Node.js & Express.js:** Provides a fast, non-blocking asynchronous backend to handle REST API requests and Stripe webhook events.
- **MongoDB & Mongoose:** A NoSQL database providing flexible document schemas, ideal for storing varied template metadata and user profiles.
- **JSON Web Tokens (JWT) & bcryptjs:** Handles secure password hashing and stateless, secure user authentication.
- **Multer:** Middleware dedicated to parsing `multipart/form-data`, enabling the processing and storage of user profile photo uploads.
- **Stripe API:** Integrates a secure, real-world payment gateway for users upgrading to the Premium tier.

---

## 3. Challenges & Technical Hurdles

**Hurdle 1: Synchronous Clipboard & WhatsApp Sharing Integration**
- *Problem:* Web browsers require a strict, immediate "user gesture" (like a click) to allow writing to the system clipboard. However, rendering the Canvas to a Blob (`canvas.toBlob`) is an asynchronous operation. By the time the image was generated, the browser dropped the user gesture context, resulting in silent failures when users tried to copy the card to paste into WhatsApp Web.
- *Solution:* The `canvas.toBlob` callback was wrapped in a JavaScript `Promise`. By using `await` directly inside the asynchronous click handler, the browser's execution thread preserved the gesture context, allowing the image to securely copy to the clipboard. For mobile users, the native Web Share API (`navigator.share`) was implemented to directly pass the image file to the WhatsApp app intent.

**Hurdle 2: React State Syncing with Canvas Rendering**
- *Problem:* In React, state updates (like typing a custom wish or changing a color) trigger component re-renders. Constantly clearing and redrawing the heavy HTML5 Canvas on every keystroke caused noticeable UI lag.
- *Solution:* Utilized React's `useRef` to maintain a persistent reference to the DOM canvas element without triggering re-renders. The heavy canvas drawing functions were placed inside optimized `useEffect` hooks with specific dependency arrays, ensuring the canvas only re-composed when absolute necessary.

**Hurdle 3: Animating Canvas Overlays**
- *Problem:* The premium template sparkles were originally CSS DOM overlays. When users downloaded the image, the Canvas API only captured the static image, losing the premium animations.
- *Solution:* Engineered a dynamic rendering engine that captures a `canvas.captureStream()`. It mathematically animates the stars over a static off-screen background and records the stream using `MediaRecorder`, saving the final output as a video file.

---

## 4. Future Improvements & Scalability Considerations

As the ClaasPlus platform grows in user traffic and template volume, the following architectural upgrades will ensure high scalability:

- **Cloud Object Storage & CDN:** Currently, user profile images are processed via Multer directly on the Node server. Moving asset storage to AWS S3 or Cloudinary, delivered via a CDN (like Cloudflare), will significantly reduce the Express server's bandwidth load and ensure images load instantly worldwide.
- **Database Indexing & Cursor Pagination:** As the template database grows from dozens to thousands, queries will become slow. Implementing compound indexes in MongoDB (e.g., on `{ category: 1, isPremium: 1 }`) and migrating from array-loading to Cursor-Based Pagination will keep database lookups under 10ms and prevent the React frontend from rendering too many DOM nodes simultaneously.
- **Background Worker Queues (BullMQ / Redis):** If the Canvas Video generation is ever moved from the client-side to the server-side (using FFmpeg) for higher quality outputs, it will block the Node.js event loop due to high CPU usage. Implementing a Redis-backed message queue will allow the API to accept the request immediately, offloading the heavy rendering to horizontally scalable worker nodes.
- **Progressive Web App (PWA) Architecture:** Implementing Service Workers to aggressively cache the core application shell and popular template images. This will drastically improve First Contentful Paint (FCP) metrics and allow users on poor mobile connections to interact with the app reliably.
