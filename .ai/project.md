# Project Overview

## Core Objective
The **AI Event Photo Share** application is a collaborative media hosting platform that allows users to create events, invite guests, and upload photos. Using facial detection and vector similarity matching, guests can upload a "selfie" to automatically filter and locate all photos of themselves across the event galleries.

## Target User Groups
1. **Event Hosts**: Individuals or organizers who create events, customize upload permissions (e.g., host-only or open uploads), and invite guests.
2. **Guests/Members**: Participants who join events using invitation codes, view galleries, upload photos (if allowed), and upload a personal selfie to find photos containing their face.

## Primary Workflows
- **Account Management**: Signing up and signing in with credentials or Google OAuth (handled via `@neondatabase/auth`).
- **Event Lifecycle**: Creating events, generating unique join codes, and handling event joins.
- **Photo Uploading & Processing**: Uploading event photos, storing them on Cloudinary, and queuing them for background facial analysis.
- **Face Embedding & Searching**: Analyzing uploaded images and selfies using a Python-based InsightFace service, storing 512-dimension vector representations in PostgreSQL, and executing cosine similarity search to return matching event photos to the user.
