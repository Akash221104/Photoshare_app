# Known Issues and Limitations

## 1. Browser Cookie Restrictions on HTTP Localhost
- **The Issue:** Neon Auth sets session cookies with the `__Secure-` prefix. Modern browsers block these cookies on unencrypted HTTP connections (`http://localhost:3000`).
- **Workaround:** Developers **must** run `npm run dev:https` to enable HTTPS locally and proceed past the self-signed certificate warnings.

## 2. In-Memory Processing Queue Limits
- **The Issue:** The background pipeline uses an in-memory queue (`ProcessingQueue`). If the Next.js server crashes, reboots, or is scaled horizontally (multiple containers), pending queue tasks will be lost or duplicated.
- **Workaround:** Recommend migrating to a dedicated database or Redis-backed message broker (like BullMQ) for production scaling.

## 3. High ML Cold Starts
- **The Issue:** The Hugging Face FastAPI Python service can take up to 2 minutes to boot on cold starts when hosted on free GPU/CPU tiers. This can cause Next.js HTTP timeouts.
- **Workaround:** Automatic axios retries with exponential backoffs are implemented in `PythonService`, but production environments require dedicated, warm instances.
