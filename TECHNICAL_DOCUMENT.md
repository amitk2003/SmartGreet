# Technical Approach Document
**Project:** ClaasPlus – Custom Greetings & Wishes App

---

## 1. Problem-Solving Approach: How Image Overlay Logic Was Implemented

The main goal was to let users put their photo and name onto greeting card templates. Instead of using heavy external libraries, I built this using the standard **HTML5 `<canvas>` API**.

I broke the card down into simple layers:
1. **Background:** First, I draw the template's background color or image onto the canvas.
2. **Decorations:** Next, I draw the emoji and the card title.
3. **Text Formatting:** Since the canvas API can't automatically wrap text, I wrote a custom function that splits the user's message into words and moves to a new line when the text gets too wide.
4. **User Profile:** To make the user's photo a circle, I used `ctx.clip()` to draw a circle path, and then placed the uploaded photo inside it. Then I added their name below it.
5. **Video Export:** For animated cards, I draw the base card once. Then, I use a JavaScript animation loop (`requestAnimationFrame`) to draw moving stars on top of it, and record the canvas for 4 seconds using the `MediaRecorder` API to save it as a video file.

---

## 2. Tech Stack

This project was built using the **MERN Stack** (MongoDB, Express, React, Node.js). 

**Frontend (Client)**
- **React 19 & Vite:** Used to build the user interface and components. Vite makes development fast.
- **React Router:** Handles navigating between pages like Home and Login.
- **Axios:** Used for making API calls to the backend.
- **React Hot Toast:** Shows simple popup messages (success/error) to the user.

**Backend (Server)**
- **Node.js & Express.js:** The server that handles API requests and Stripe payments.
- **MongoDB & Mongoose:** The database used to save user accounts and template data.
- **JWT & bcryptjs:** Used for securely hashing passwords and keeping users logged in.
- **Multer:** Handles file uploads so users can upload their profile pictures.
- **Stripe:** Processes real payments for the premium subscription.

---

## 3. Challenges & Technical Hurdles

**Hurdle 1: Copying Images to WhatsApp**
- *Problem:* Browsers have strict security rules: you can only copy something to the clipboard exactly when a user clicks a button. Because generating the image on the canvas takes a split second (it's asynchronous), the browser would block the copy action, and pasting into WhatsApp wouldn't work.
- *Solution:* I used Promises to properly wait for the image generation to finish *inside* the click event. For mobile phones, I used the native Web Share API so the image attaches to WhatsApp automatically.

**Hurdle 2: React Lagging the Canvas**
- *Problem:* Every time a user typed a letter in their custom message, React would re-render. If I cleared and redrew the entire canvas on every single keystroke, the app became very slow and laggy.
- *Solution:* I used React's `useRef` to keep track of the canvas without forcing React to re-render it. I only redraw the canvas when specific things (like the final text or template) actually change.

**Hurdle 3: Exporting Animations**
- *Problem:* The premium sparkles were originally just CSS animations floating on top of the image. When a user downloaded the card, they only got the flat image underneath, and the animation was lost.
- *Solution:* I moved the animation logic into the canvas itself. By using `MediaRecorder`, I recorded the canvas as it was drawing the moving stars and exported it as a `.webm` video file that users can share.

---

## 4. Future Improvements & Scalability

If this app gets a lot of users, here is how I would improve it:

- **Cloud Image Storage:** Right now, profile pictures are saved directly on the server. Moving them to a cloud service like AWS S3 or Cloudinary will save server space and load images faster for users.
- **Database Improvements:** As we add thousands of templates, searching the database will get slower. I would add database indexes (like indexing by category) and add pagination (loading 20 templates at a time) so the page loads instantly.
- **Background Jobs:** Generating video files takes a lot of processing power. In the future, I would move the video rendering to a separate background server (using tools like Redis or BullMQ) so it doesn't slow down the main website for other users.
