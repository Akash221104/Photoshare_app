// services/selfie.service.ts
import { SelfieRepository } from '@/repositories/selfie.repository';
import { CloudinaryService } from './cloudinary.service';
import { PythonService } from './python.service';
import { SelfieRow } from '@/types/selfie';

const selfieRepo = new SelfieRepository();
const cloudinaryService = new CloudinaryService();
const pythonService = new PythonService();

export class SelfieService {
  /**
   * Fetches user's selfie metadata for a specific event.
   */
  async getUserSelfie(userId: string, eventId: string): Promise<SelfieRow | null> {
    return selfieRepo.getUserSelfie(userId, eventId);
  }

  /**
   * Uploads base64 data to Cloudinary, extracts embedding, and saves to database.
   * Performs conflict handling (updates existing selfie on duplicate).
   */
  async uploadSelfie(
    userId: string,
    eventId: string,
    base64Data: string
  ): Promise<SelfieRow> {
    // 1. Upload to Cloudinary under events/{eventId}/selfies/{userId}/original
    const cloudinaryRes = await cloudinaryService.uploadSelfie(base64Data, eventId, userId);

    try {
      // 2. Call Python FastAPI to detect exactly one face and extract embedding
      const pythonRes = await pythonService.getEmbedding(cloudinaryRes.secure_url);

      // 3. Save to database. If selfie exists, update it. Otherwise, create it.
      const existingSelfie = await selfieRepo.getUserSelfie(userId, eventId);
      if (existingSelfie) {
        return await selfieRepo.updateSelfie(
          userId,
          eventId,
          cloudinaryRes.public_id,
          cloudinaryRes.secure_url,
          pythonRes.embedding
        );
      } else {
        return await selfieRepo.createSelfie(
          userId,
          eventId,
          cloudinaryRes.public_id,
          cloudinaryRes.secure_url,
          pythonRes.embedding
        );
      }
    } catch (err: any) {
      // Clean up uploaded Cloudinary image if face processing failed
      await cloudinaryService.deletePhoto(cloudinaryRes.public_id);
      throw err;
    }
  }

  /**
   * Deletes selfie record from database and deletes asset from Cloudinary.
   */
  async deleteSelfie(userId: string, eventId: string): Promise<boolean> {
    const selfie = await selfieRepo.getUserSelfie(userId, eventId);
    if (!selfie) return false;

    // Delete from Cloudinary
    await cloudinaryService.deletePhoto(selfie.cloudinary_public_id);

    // Delete from Database
    return selfieRepo.deleteSelfie(userId, eventId);
  }
}
