# UI & Reusable Components Memory

This file documents interactive UI component behaviors and styling tokens.

---

## 1. Navbar Component (`components/navbar.tsx`)
- **State**: Responsive mobile menu open state, current user session status.
- **Styling**: Blurry glassmorphism header (`backdrop-blur-md bg-white/70`).

## 2. Register & Login Forms (`components/register-form.tsx`, `components/login-form.tsx`)
- **State**: Form validation using Zod and React Hook Form. Shows submission spinner in loading state. Handles redirecting to `/dashboard` on login success.
- **Interactivity**: Social Google Sign-In redirect triggers.

## 3. Image Uploader (`components/image-uploader.tsx`)
- **State**: Drag-and-drop file inputs, compress percentage loaders, upload progress tracker.
- **Interactivity**: Drag event listeners, file compression pipelines (`browser-image-compression`).

## 4. Photo Grid Component (`components/photo-grid.tsx`)
- **State**: Lightbox active index slider, matched face coordinates rendering, filter toggles (show all vs. matched faces).
- **Interactivity**: Lightbox transitions, ZIP download streams.
