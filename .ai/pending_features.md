# Pending Features

Below are the scheduled backlogs and future enhancements:

---

## 1. Real-Time Activity and Matches
- **Real-Time WebSockets**: Notify users via WS channels when new photos matching their face are processed.
- **Push Notifications**: Mobile push notifications when a guest is detected in an event gallery.

## 2. Advanced AI Pipeline Extensions
- **Multi-Face Profile (Person Clusters)**: Allow users to upload multiple selfies from different angles to construct a more robust multi-vector reference persona.
- **Vector search threshold optimization**: Add UI sliders inside event grids to let users dynamically adjust similarity matching threshold (e.g., from `0.35` to `0.55`).

## 3. Scale and Infrastructure upgrades
- **External Message Broker**: Migrate the lightweight in-memory `ProcessingQueue` to a persistent queue (like `BullMQ` or `RabbitMQ` backed by Redis) for enterprise scaling.
- **Dedicated Face Crops Storage**: Enable Cloudinary-backed face cropping storage (the database schema contains the `crop_url` column which is currently set to `null`).
