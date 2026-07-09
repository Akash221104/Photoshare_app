// services/search.service.ts
import { SearchRepository } from '@/repositories/search.repository';
import { MatchedPhotoRow, PersonalGalleryStats } from '@/types/selfie';
import { RankingService } from './ranking.service';

const searchRepo = new SearchRepository();
const rankingService = new RankingService();

export class SearchService {
  /**
   * Performs vector search for Top 500 candidates, applies Quality Filtering,
   * Penalty Engine, Weighted Re-ranking, and Adaptive Thresholding,
   * then removes duplicates per photo and splits into confidence categories.
   */
  async searchPersonalGallery(
    eventId: string,
    selfieEmbedding: number[],
    options: {
      threshold: number;
      limit: number;
      offset: number;
      sortBy: 'similarity' | 'date' | 'photographer';
    }
  ): Promise<{ 
    photos: MatchedPhotoRow[]; 
    total: number;
    categories?: {
      high: MatchedPhotoRow[];
      medium: MatchedPhotoRow[];
      possible: MatchedPhotoRow[];
    };
  }> {
    // 1. Fetch Top 500 candidates with a lower baseline threshold to allow re-ranking to promote matches
    const baselineThreshold = Math.max(0.28, options.threshold - 0.08);
    const rawMatches = await searchRepo.vectorSearch(eventId, selfieEmbedding, baselineThreshold, 500);

    // 2. Perform Quality Filtering, Penalty scoring, Re-ranking & Adaptive thresholding
    const { high, medium, possible } = rankingService.rankAndFilter(rawMatches, options.threshold);
    const allMatches = [...high, ...medium, ...possible];

    // 3. Deduplicate by photo_id, keeping only the highest similarity face match per photo
    const uniqueMap = new Map<string, MatchedPhotoRow>();
    for (const match of allMatches) {
      const existing = uniqueMap.get(match.photo_id);
      if (!existing || match.similarity > existing.similarity) {
        uniqueMap.set(match.photo_id, match);
      }
    }

    let deduplicated = Array.from(uniqueMap.values());

    // 4. Sort
    if (options.sortBy === 'similarity') {
      deduplicated.sort((a, b) => b.similarity - a.similarity);
    } else if (options.sortBy === 'date') {
      deduplicated.sort((a, b) => b.photo_created_at.getTime() - a.photo_created_at.getTime());
    } else if (options.sortBy === 'photographer') {
      deduplicated.sort((a, b) => a.uploader_name.localeCompare(b.uploader_name));
    }

    const total = deduplicated.length;

    // 5. Paginate
    const paginated = deduplicated.slice(options.offset, options.offset + options.limit);

    // 6. Build categorized results matching deduplicated photos
    const uniquePhotoIds = new Set(deduplicated.map(p => p.photo_id));
    const categorized = {
      high: high.filter(p => uniquePhotoIds.has(p.photo_id)),
      medium: medium.filter(p => uniquePhotoIds.has(p.photo_id)),
      possible: possible.filter(p => uniquePhotoIds.has(p.photo_id)),
    };

    return {
      photos: paginated,
      total,
      categories: categorized,
    };
  }

  /**
   * Computes aggregate statistics for the user's matched photos.
   */
  async getGalleryStats(
    eventId: string,
    selfieEmbedding: number[],
    threshold: number,
    selfieUpdatedAt: Date | null
  ): Promise<PersonalGalleryStats> {
    const baselineThreshold = Math.max(0.28, threshold - 0.08);
    const rawMatches = await searchRepo.vectorSearch(eventId, selfieEmbedding, baselineThreshold, 500);

    const { high, medium, possible } = rankingService.rankAndFilter(rawMatches, threshold);
    const allMatches = [...high, ...medium, ...possible];

    // Deduplicate to count unique photos
    const uniqueMap = new Map<string, MatchedPhotoRow>();
    for (const match of allMatches) {
      const existing = uniqueMap.get(match.photo_id);
      if (!existing || match.similarity > existing.similarity) {
        uniqueMap.set(match.photo_id, match);
      }
    }

    const deduplicated = Array.from(uniqueMap.values());

    if (deduplicated.length === 0) {
      return {
        totalPhotosFound: 0,
        highestSimilarity: 0,
        averageSimilarity: 0,
        lastUpdated: selfieUpdatedAt,
      };
    }

    let highestSimilarity = 0;
    let sumSimilarity = 0;

    for (const item of deduplicated) {
      if (item.similarity > highestSimilarity) {
        highestSimilarity = item.similarity;
      }
      sumSimilarity += item.similarity;
    }

    const averageSimilarity = sumSimilarity / deduplicated.length;

    return {
      totalPhotosFound: deduplicated.length,
      highestSimilarity,
      averageSimilarity,
      lastUpdated: selfieUpdatedAt,
    };
  }
}
