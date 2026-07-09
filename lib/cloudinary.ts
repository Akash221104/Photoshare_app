// lib/cloudinary.ts
// Configures Cloudinary Server SDK.
// Provides helper functions for secure image uploading and deletion.

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/**
 * Uploads a file (base64 string or file path) to Cloudinary.
 * Stores files under: events/{eventId}/{photoId}
 */
export const uploadToCloudinary = (
  fileUri: string,
  folder: string
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileUri,
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Failed to upload to Cloudinary'));
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
};

/**
 * Deletes an asset from Cloudinary using its public ID.
 */
export const deleteFromCloudinary = (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

/**
 * Generates an optimized, responsive thumbnail URL with cropped face positioning (requires InsightFace later,
 * but utilizes Cloudinary's default gravity=face cropping here).
 */
export const getThumbnailUrl = (publicId: string, width = 300, height = 300): string => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  });
};
