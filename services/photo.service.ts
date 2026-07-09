// services/photo.service.ts
// Service layer for Photo database mapping, deletion permissions, and gallery paginations.

import { PhotoRepository, PhotoRow } from '@/database/repositories/photo.repository';
import { MemberRepository } from '@/database/repositories/member.repository';
import { EventRepository } from '@/database/repositories/event.repository';
import { UserRepository } from '@/database/repositories/user.repository';
import { CloudinaryService } from './cloudinary.service';
import { PhotoResponse, GalleryResponse } from '@/types/photo';
import { processingQueue } from './embedding.service';

const photoRepo = new PhotoRepository();
const memberRepo = new MemberRepository();
const eventRepo = new EventRepository();
const userRepo = new UserRepository();
const cloudinaryService = new CloudinaryService();

export class PhotoService {
  /**
   * Performs uploader membership check, streams image to Cloudinary, and saves metadata in database.
   * Auto-marks status as 'processed' in this phase (no AI processing).
   */
  async uploadPhoto(
    eventId: string,
    uploadedBy: string,
    base64Data: string
  ): Promise<PhotoResponse> {
    try {
      // 1. Authorization Guard: Check if user is a member of the event workspace
      const isMember = await memberRepo.isMember(eventId, uploadedBy);
      if (!isMember) {
        return { success: false, error: 'Unauthorized: You must join the event before uploading' };
      }

      // 2. Check Event settings (Upload Mode)
      const event = await eventRepo.getEventById(eventId);
      if (!event) {
        return { success: false, error: 'Event not found' };
      }
      if (event.upload_mode === 'HOST_ONLY' && event.host_id !== uploadedBy) {
        return { success: false, error: 'Forbidden: Only the event host can upload photos' };
      }

      // 3. Upload asset to Cloudinary
      const cloudinaryRes = await cloudinaryService.uploadPhoto(base64Data, eventId);

      // 3. Register photo in DB (will default status to 'processing' and processing_status to 'PENDING')
      const photo = await photoRepo.uploadPhoto(
        eventId,
        uploadedBy,
        cloudinaryRes.public_id,
        cloudinaryRes.secure_url,
        cloudinaryRes.width,
        cloudinaryRes.height
      );

      // 4. Enqueue in-memory background processing queue
      processingQueue.enqueue(photo.id);

      return { success: true, data: photo };
    } catch (error) {
      console.error('Failed to upload photo in service:', error);
      return { success: false, error: 'Failed to process media upload' };
    }
  }

  /**
   * Retrieves a paginated gallery for an event. Guards against non-members.
   */
  async getEventGallery(
    eventId: string,
    userId: string,
    limit = 12,
    offset = 0
  ): Promise<PhotoResponse<GalleryResponse>> {
    try {
      const isMember = await memberRepo.isMember(eventId, userId);
      if (!isMember) {
        return { success: false, error: 'Unauthorized: You are not a member of this event' };
      }

      const total = await photoRepo.countPhotos(eventId);
      const photos = await photoRepo.getPhotosByEvent(eventId, limit, offset);

      // Self-healing: Enqueue any PENDING photos in the gallery to the queue if not already there
      const pendingPhotos = photos.filter(p => p.processing_status === 'PENDING');
      if (pendingPhotos.length > 0) {
        pendingPhotos.forEach(p => {
          processingQueue.enqueue(p.id);
        });
      }

      // Fetch uploader names for display (optional metadata enhancement)
      const photosWithUploaderNames = await Promise.all(
        photos.map(async (photo) => {
          const uploader = await userRepo.getUserById(photo.uploaded_by);
          return {
            ...photo,
            uploader_name: uploader ? uploader.name : 'Unknown User',
          };
        })
      );

      return {
        success: true,
        data: {
          photos: photosWithUploaderNames,
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve gallery in service:', error);
      return { success: false, error: 'Failed to fetch gallery photos' };
    }
  }

  /**
   * Deletes a photo. Only the event Host or the photo Uploader can delete.
   */
  async deletePhoto(photoId: string, userId: string): Promise<PhotoResponse> {
    try {
      const photo = await photoRepo.getPhotoById(photoId);
      if (!photo) {
        return { success: false, error: 'Photo not found' };
      }

      const event = await eventRepo.getEventById(photo.event_id);
      if (!event) {
        return { success: false, error: 'Associated event workspace not found' };
      }

      const isHost = event.host_id === userId;
      const isUploader = photo.uploaded_by === userId;

      // Permission check
      if (!isHost && !isUploader) {
        return { success: false, error: 'Unauthorized: Only the host or uploader can delete this photo' };
      }

      // 1. Delete from Cloudinary
      await cloudinaryService.deletePhoto(photo.cloudinary_public_id);

      // 2. Delete from Database
      const deleted = await photoRepo.deletePhoto(photoId);

      return { success: true, data: deleted };
    } catch (error) {
      console.error('Failed to delete photo in service:', error);
      return { success: false, error: 'Failed to delete photo' };
    }
  }

  /**
   * Retrieves single photo details.
   */
  async getPhoto(photoId: string, userId: string): Promise<PhotoResponse> {
    try {
      const photo = await photoRepo.getPhotoById(photoId);
      if (!photo) return { success: false, error: 'Photo not found' };

      const isMember = await memberRepo.isMember(photo.event_id, userId);
      if (!isMember) {
        return { success: false, error: 'Unauthorized: You are not a member of this event' };
      }

      const uploader = await userRepo.getUserById(photo.uploaded_by);

      return {
        success: true,
        data: {
          ...photo,
          uploader_name: uploader ? uploader.name : 'Unknown User',
        },
      };
    } catch (error) {
      console.error('Failed to get photo details:', error);
      return { success: false, error: 'Failed to fetch photo details' };
    }
  }
}
