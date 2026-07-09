// scratch/benchmark.ts
// Face Recognition Evaluation and Benchmarking Framework.
// Measures Precision, Recall, FPR, FNR, Top-1/5 accuracies, and latency.

import { MatchedPhotoRow } from '../types/selfie';
import { RankingService } from '../services/ranking.service';

const rankingService = new RankingService();

interface GroundTruth {
  faceId: string;
  isMatch: boolean; // True if it is actually the user
}

interface BenchmarkSample {
  candidate: MatchedPhotoRow;
  truth: GroundTruth;
}

// Generate mock event photograph evaluation dataset (300 candidates)
function generateBenchmarkDataset(): BenchmarkSample[] {
  const samples: BenchmarkSample[] = [];

  for (let i = 1; i <= 300; i++) {
    // Determine quality of this face crop
    const isTiny = i % 15 === 0;
    const isBlurry = i % 12 === 0;
    const isExtremePose = i % 10 === 0;
    const isOccluded = i % 18 === 0;

    const baseSimilarity = i <= 60 
      ? 0.42 + Math.random() * 0.20 // Actually the user (True Positives candidates)
      : 0.28 + Math.random() * 0.15; // False candidates

    const face_quality = (isTiny ? 0.2 : 0.8) * (isBlurry ? 0.3 : 0.9) * (isExtremePose ? 0.4 : 0.95);

    const candidate: MatchedPhotoRow = {
      photo_id: `photo_uuid_${Math.ceil(i / 2)}`,
      event_id: 'event_uuid_101',
      uploaded_by: 'user_uuid_999',
      uploader_name: 'Photographer John',
      cloudinary_public_id: `public_id_${i}`,
      cloudinary_url: `https://cloudinary.com/event_101/photo_${i}.jpg`,
      width: 1920,
      height: 1080,
      photo_created_at: new Date(),
      face_id: `face_uuid_${i}`,
      x: 100,
      y: 100,
      face_width: isTiny ? 24 : 120,
      face_height: isTiny ? 24 : 120,
      face_confidence: 0.92,
      face_index: 0,
      yaw: isExtremePose ? 42.0 : 5.0,
      pitch: isExtremePose ? 12.0 : 2.0,
      roll: 2.0,
      blur: isBlurry ? 0.72 : 0.08,
      brightness: 110,
      sharpness: isBlurry ? 12.0 : 380.0,
      face_area: isTiny ? 576 : 14400,
      face_ratio: isTiny ? 0.0002 : 0.007,
      face_quality: face_quality,
      occlusion_score: isOccluded ? 0.65 : 0.02,
      image_width: 1920,
      image_height: 1080,
      crop_url: null,
      processing_version: 'v1',
      similarity: baseSimilarity, // Raw Cosine similarity
    };

    // Ground truth: first 60 are actual matches.
    // However, if the quality is extremely poor (e.g. tiny and blurry),
    // even if it is the user, standard matching might fail or we might classify it as match/non-match.
    const isMatch = i <= 60;

    samples.push({
      candidate,
      truth: {
        faceId: candidate.face_id,
        isMatch,
      },
    });
  }

  return samples;
}

export function runBenchmark() {
  console.log('===========================================================');
  console.log('   FACE RECOGNITION BENCHMARKING & EVALUATION FRAMEWORK    ');
  console.log('===========================================================');
  
  const dataset = generateBenchmarkDataset();
  console.log(`Loaded evaluation dataset: ${dataset.length} faces.`);

  // 1. Benchmark Standard Cosine Similarity Matching (baseline)
  const baselineThreshold = 0.40;
  let baselineTP = 0, baselineFP = 0, baselineTN = 0, baselineFN = 0;
  
  const startBaseline = performance.now();
  for (const sample of dataset) {
    const prediction = sample.candidate.similarity >= baselineThreshold;
    const actual = sample.truth.isMatch;
    
    if (prediction && actual) baselineTP++;
    if (prediction && !actual) baselineFP++;
    if (!prediction && !actual) baselineTN++;
    if (!prediction && actual) baselineFN++;
  }
  const endBaseline = performance.now();
  const baselineLatency = (endBaseline - startBaseline) / dataset.length;

  // Calculate Baseline Metrics
  const baselinePrecision = baselineTP / (baselineTP + baselineFP || 1);
  const baselineRecall = baselineTP / (baselineTP + baselineFN || 1);
  const baselineF1 = (2 * baselinePrecision * baselineRecall) / (baselinePrecision + baselineRecall || 1);
  const baselineFPR = baselineFP / (baselineFP + baselineTN || 1);
  const baselineFNR = baselineFN / (baselineTP + baselineFN || 1);

  // 2. Benchmark Re-ranked and Quality-Penalty Pipeline
  let rerankedTP = 0, rerankedFP = 0, rerankedTN = 0, rerankedFN = 0;
  
  const startRerank = performance.now();
  for (const sample of dataset) {
    const passedThreshold = rankingService.passesAdaptiveThreshold(sample.candidate, baselineThreshold);
    const finalScore = rankingService.calculateFinalScore(sample.candidate);
    
    // In our pipeline, we match if they pass the adaptive threshold and final score is in High/Medium (> 0.42)
    const prediction = passedThreshold && finalScore >= 0.42;
    const actual = sample.truth.isMatch;

    if (prediction && actual) rerankedTP++;
    if (prediction && !actual) rerankedFP++;
    if (!prediction && !actual) rerankedTN++;
    if (!prediction && actual) rerankedFN++;
  }
  const endRerank = performance.now();
  const rerankLatency = (endRerank - startRerank) / dataset.length;

  // Calculate Re-ranked Metrics
  const rerankedPrecision = rerankedTP / (rerankedTP + rerankedFP || 1);
  const rerankedRecall = rerankedTP / (rerankedTP + rerankedFN || 1);
  const rerankedF1 = (2 * rerankedPrecision * rerankedRecall) / (rerankedPrecision + rerankedRecall || 1);
  const rerankedFPR = rerankedFP / (rerankedFP + rerankedTN || 1);
  const rerankedFNR = rerankedFN / (rerankedTP + rerankedFN || 1);

  // Measure Top-1 and Top-5 Accuracies on the sorted lists
  const sortedBaseline = [...dataset].sort((a, b) => b.candidate.similarity - a.candidate.similarity);
  const sortedReranked = [...dataset].map(s => ({
    ...s,
    score: rankingService.calculateFinalScore(s.candidate)
  })).sort((a, b) => b.score - a.score);

  const baselineTop1Ok = sortedBaseline[0].truth.isMatch;
  const baselineTop5Ok = sortedBaseline.slice(0, 5).some(s => s.truth.isMatch);

  const rerankedTop1Ok = sortedReranked[0].truth.isMatch;
  const rerankedTop5Ok = sortedReranked.slice(0, 5).some(s => s.truth.isMatch);

  console.log('\n--- PERFORMANCE EVALUATION SUMMARY ---');
  console.table({
    'Metric / Pipeline': {
      'Baseline (Cosine)': 'Standard matching',
      'Enterprise Pipeline': 'Reranked + Penalty + Adaptive'
    },
    'Precision (higher is better)': {
      'Baseline (Cosine)': `${(baselinePrecision * 100).toFixed(2)}%`,
      'Enterprise Pipeline': `${(rerankedPrecision * 100).toFixed(2)}%`
    },
    'Recall (higher is better)': {
      'Baseline (Cosine)': `${(baselineRecall * 100).toFixed(2)}%`,
      'Enterprise Pipeline': `${(rerankedRecall * 100).toFixed(2)}%`
    },
    'F1 Score (higher is better)': {
      'Baseline (Cosine)': `${(baselineF1 * 100).toFixed(2)}%`,
      'Enterprise Pipeline': `${(rerankedF1 * 100).toFixed(2)}%`
    },
    'False Positive Rate (lower)': {
      'Baseline (Cosine)': `${(baselineFPR * 100).toFixed(2)}%`,
      'Enterprise Pipeline': `${(rerankedFPR * 100).toFixed(2)}%`
    },
    'False Negative Rate (lower)': {
      'Baseline (Cosine)': `${(baselineFNR * 100).toFixed(2)}%`,
      'Enterprise Pipeline': `${(rerankedFNR * 100).toFixed(2)}%`
    },
    'Top-1 Accuracy': {
      'Baseline (Cosine)': baselineTop1Ok ? '100%' : '0%',
      'Enterprise Pipeline': rerankedTop1Ok ? '100%' : '0%'
    },
    'Top-5 Accuracy': {
      'Baseline (Cosine)': baselineTop5Ok ? '100%' : '0%',
      'Enterprise Pipeline': rerankedTop5Ok ? '100%' : '0%'
    },
    'Average Query Latency': {
      'Baseline (Cosine)': `${(baselineLatency * 1000).toFixed(3)} µs`,
      'Enterprise Pipeline': `${(rerankLatency * 1000).toFixed(3)} µs`
    }
  });

  console.log('\n=== KEY INSIGHTS ===');
  console.log(`• The Enterprise Pipeline decreased False Positives by: ${((baselineFPR - rerankedFPR) * 100).toFixed(1)}% points.`);
  console.log(`• F1-Score accuracy shift: ${((rerankedF1 - baselineF1) * 100).toFixed(1)}% improvement.`);
  console.log(`• Re-ranking latency penalty: Only +${((rerankLatency - baselineLatency) * 1000).toFixed(2)} microseconds per face.`);
  console.log('===========================================================');
}

// Run benchmark immediately if executed directly
if (require.main === module) {
  runBenchmark();
}
