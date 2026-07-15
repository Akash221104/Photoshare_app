# Component Library

The application structures components into core UI primitives (styled wrappers around shadcn and Base UI components) and complex functional views.

---

## 1. UI Primitives (`components/ui/`)
- **`button.tsx`**: Custom styled buttons supporting primary, destructive, outline, and ghost variants.
- **`card.tsx`**: Structural blocks (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) for visual containers.
- **`dialog.tsx`**: Modal popup wrappers.
- **`input.tsx`**: Standard HTML text fields.
- **`label.tsx`**: Form labels.
- **`select.tsx`**: Custom dropdown fields.

---

## 2. Shared Functional Components (`components/`)
- **`auth-card.tsx`**: Container card wrapper for registration and sign-in credentials blocks.
- **`login-form.tsx`**: Email/password authentication form integrated with React Hook Form, Zod, and Google Social Sign-In buttons.
- **`register-form.tsx`**: User credentials signup card.
- **`password-input.tsx`**: Password field with show/hide toggle.
- **`submit-button.tsx`**: Form submit button with loading spinner state.
- **`navbar.tsx`**: Main navigation component showing the logo, dashboard links, profile selfie status, and logout options.
- **`event-card.tsx`**: Grid card showing event name, description, role (host/guest), member counts, and a direct link.
- **`create-event-dialog.tsx`**: Modal form with Zod schema verification (`event.schema.ts`) to create new events.
- **`image-uploader.tsx`**: Drag-and-drop zone using `react-dropzone` and `browser-image-compression` to handle multi-file uploading.
- **`photo-grid.tsx`**: Gallery grid displaying event photos with loaders, full-screen lightbox sliders, matched face highlights, and download choices.
- **`selfie-uploader.tsx`**: Profile selfie card containing dropzones, upload loading states, and face matching status.
