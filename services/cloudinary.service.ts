// services/cloudinary.service.ts
// Service layer for Cloudinary actions.

import { uploadToCloudinary, deleteFromCloudinary, CloudinaryUploadResponse, cloudinary } from '@/lib/cloudinary';

export class CloudinaryService {
  /**
   * Streams/uploads base64 image data to a specific event folder on Cloudinary.
   */
  async uploadPhoto(
    base64Data: string,
    eventId: string
  ): Promise<CloudinaryUploadResponse> {
    const folderPath = `events/${eventId}`;
    return uploadToCloudinary(base64Data, folderPath);
  }

  /**
   * Uploads user selfie to Cloudinary using a deterministic folder structure:
   * events/{eventId}/selfies/{userId}/original
   */
  async uploadSelfie(
    base64Data: string,
    eventId: string,
    userId: string
  ): Promise<CloudinaryUploadResponse> {
    const folderPath = `events/${eventId}/selfies/${userId}`;
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          folder: folderPath,
          public_id: 'original',
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Failed to upload selfie to Cloudinary'));
          }
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );
    });
  }

  /**
   * Deletes an asset from Cloudinary using its public ID.
   */
  async deletePhoto(publicId: string): Promise<boolean> {
    try {
      await deleteFromCloudinary(publicId);
      return true;
    } catch (error) {
      console.error('Failed to delete asset from Cloudinary:', error);
      return false;
    }
  }
}
