// services/download.service.ts
import axios from 'axios';
import JSZip from 'jszip';
import { DownloadRepository } from '@/repositories/download.repository';
import { PhotoRow } from '@/database/repositories/photo.repository';

const downloadRepo = new DownloadRepository();

export class DownloadService {
  /**
   * Downloads an image from Cloudinary URL and returns it as an ArrayBuffer.
   */
  private async downloadImage(url: string): Promise<ArrayBuffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000, // 15s timeout
    });
    return response.data;
  }

  /**
   * Generates a ZIP archive of the provided photos, verifying permissions for each photo.
   * If any photo fails permission checks, an error is thrown.
   */
  async generateZip(
    photos: PhotoRow[],
    userId: string,
    eventId: string,
    threshold = 0.40
  ): Promise<Buffer> {
    const zip = new JSZip();

    // 1. Validate permissions and download files in limited batches of 3 to optimize memory
    const BATCH_SIZE = 3;
    for (let i = 0; i < photos.length; i += BATCH_SIZE) {
      const batch = photos.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (photo) => {
          // Validate permission
          const hasAccess = await downloadRepo.validateOwnership(photo.id, userId, eventId, threshold);
          if (!hasAccess) {
            throw new Error(`Unauthorized: You do not have permission to download photo ${photo.id}`);
          }

          try {
            // Download binary content from Cloudinary
            const imageBuffer = await this.downloadImage(photo.cloudinary_url);
            
            // Name format: photo_id.ext
            const fileExtension = photo.cloudinary_url.split('.').pop() || 'jpg';
            const filename = `photo-${photo.id}.${fileExtension}`;
            
            zip.file(filename, imageBuffer);
          } catch (err: any) {
            console.error(`Failed to download photo ${photo.id} from Cloudinary:`, err.message);
            // Skip the failed image instead of crashing the entire batch
          }
        })
      );
    }

    // 2. Generate ZIP file as a Node Buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return zipBuffer;
  }

  /**
   * Generates a ZIP archive for all uploads by a user.
   */
  async getUploadedZip(eventId: string, userId: string): Promise<Buffer> {
    const photos = await downloadRepo.getUserUploads(eventId, userId);
    if (photos.length === 0) {
      throw new Error('No uploaded photos found to download');
    }
    return this.generateZip(photos, userId, eventId);
  }

  /**
   * Generates a ZIP archive for all AI matched photos of a user.
   */
  async getMatchedZip(eventId: string, userId: string, threshold = 0.40): Promise<Buffer> {
    const matches = await downloadRepo.getUserMatches(eventId, userId, threshold);
    if (matches.length === 0) {
      throw new Error('No matched photos found to download');
    }

    // Map matched rows back to PhotoRow structure
    const photos = matches.map((m) => ({
      id: m.photo_id,
      event_id: m.event_id,
      uploaded_by: m.uploaded_by,
      cloudinary_public_id: m.cloudinary_public_id,
      cloudinary_url: m.cloudinary_url,
      width: m.width,
      height: m.height,
    })) as PhotoRow[];

    return this.generateZip(photos, userId, eventId, threshold);
  }

  /**
   * Generates a ZIP archive for specific selected photos.
   */
  async getSelectedZip(photoIds: string[], userId: string, eventId: string, threshold = 0.40): Promise<Buffer> {
    const photos = await downloadRepo.getSelectedPhotos(photoIds);
    if (photos.length === 0) {
      throw new Error('No photos found for the provided selection');
    }
    return this.generateZip(photos, userId, eventId, threshold);
  }
}
export const downloadService = new DownloadService();
