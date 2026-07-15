# Changelog

*Placeholder for Changelog:*
This file will log all major updates to the codebase:
- Initial project scaffold
- Integration of `@neondatabase/auth` and Cloudinary
- Renamed Next.js middleware handler from `middleware.ts` to `proxy.ts` according to Next.js 16 requirements.
- Configured local secure server options using `--experimental-https` for local authentication.
- Migrated photo upload pipeline from server-proxy architecture to direct browser-to-Cloudinary upload.
- Implemented global `UploadContext` background manager with batching, max 3 concurrent uploads, auto-retry logic (3 attempts), real-time speed, and ETA indicators.
- Created `FloatingUploadTray` displaying detailed upload progress, and updated `PhotoUploader` to close immediately upon drop.
- Added background polling for backend AI processing status with tray updates (`"AI Processing (2/10 Completed)"`) and custom `'gallery-update'` event listeners for silent, flash-free gallery reloads.
- Created `NotificationContext` and hook `useNotification` with online/offline browser listeners and `localStorage` state syncing.
- Built `<NotificationCenter />` popover component with unread badges, date grouping, priority cards, and quick actions (e.g. Copy Invite Link / Open Gallery).
- Integrated notification dispatcher triggers into the background upload pipeline inside `UploadContext.tsx`.
- Registered `NotificationProvider` at root layout and embedded `<NotificationCenter />` into dashboard layout header, events list navigation, and event details workspace top navigations.
- Integrated host mode active view switcher tabs ("Host Dashboard" vs "Event Gallery") in event detail page `app/events/[eventId]/page.tsx`.
- Embedded `<GalleryGrid />` collaborative view for hosts to check, preview, and delete/moderate all uploaded photos in the event gallery.
- Optimized header navigation and action buttons with responsive layouts (`hidden sm:inline` labels) to adapt button sizes dynamically on mobile viewports.
- Wired direct tap actions to the gallery thumbnails (`PhotoCard`) to allow mobile/tablet users to preview photos without relying on hover overlays.
- Standardized viewport max-widths (`max-w-[calc(100vw-32px)]`) on the popover notification dropdown to eliminate page overflows.
- Refined selfie camera hook to avoid rigid webcam resolution configurations that throw OverconstrainedError, and added auto fallback default stream captures.
