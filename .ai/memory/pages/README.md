# Pages & UI Views Memory

Documents all interactive screens.

---

## 1. Landing Page (`/`)
- **Renders**: Landing marketing page with event hosting promotions.
- **Access**: Public.
- **Forms**: None.

## 2. Sign In & Sign Up Pages (`/auth/sign-in`, `/auth/sign-up`)
- **Renders**: Login and signup card widgets.
- **Access**: Public.
- **Interactivity**: User form submit, validation error states, Google authentication button.

## 3. Dashboard Page (`/dashboard`)
- **Renders**: Grids displaying hosted and joined events. Contains the event creation dialog trigger button.
- **Access**: Protected (guarded by `proxy.ts`).
- **Interactivity**: Open event modals, click cards to navigate to galleries.

## 4. User Profile Page (`/profile`)
- **Renders**: User profile update forms and selfie dropzone uploader.
- **Access**: Protected.
- **Interactivity**: Save profile changes, upload selfie, delete selfie.

## 5. Event Gallery Page (`/events/[id]`)
- **Renders**: Collaborative gallery, event members sidebar, download options, upload dropzone panel, and matches slider.
- **Access**: Protected.
- **Interactivity**: Drop photos, view grid, adjust similarity threshold, click photos to open lightbox, download ZIP files.
