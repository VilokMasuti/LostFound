import type { Report } from '../type/index.ts';
export function calculateSimilarity(report1: Report, report2: Report): number {
  let score = 0;
  let maxScore = 0;

  // Brand match (40% weight)
  maxScore += 0.4;
  if (report1.brand.toLowerCase() === report2.brand.toLowerCase()) {
    score += 0.4;
  }

  // Color match (30% weight)
  maxScore += 0.3;
  if (report1.color.toLowerCase() === report2.color.toLowerCase()) {
    score += 0.3;
  }

  // Location similarity (30% weight)
  maxScore += 0.3;
  const locationSimilarity = calculateLocationSimilarity(
    report1.location,
    report2.location
  );
  score += 0.3 * locationSimilarity;

  return score / maxScore;
}

function calculateLocationSimilarity(loc1: string, loc2: string): number {
  const words1 = loc1.toLowerCase().split(/\s+/);
  const words2 = loc2.toLowerCase().split(/\s+/);

  let matches = 0;
  const totalWords = Math.max(words1.length, words2.length);

  for (const word1 of words1) {
    if (
      words2.some(
        (word2) =>
          word1.includes(word2) ||
          word2.includes(word1) ||
          levenshteinDistance(word1, word2) <= 2
      )
    ) {
      matches++;
    }
  }

  return matches / totalWords;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export async function findMatches(
  newReport: Report,
  existingReports: Report[]
): Promise<Report[]> {
  const oppositeType = newReport.type === 'lost' ? 'found' : 'lost';

  const potentialMatches = existingReports
    .filter((report) => report.type === oppositeType)
    .map((report) => ({
      report,
      similarity: calculateSimilarity(newReport, report),
    }))
    .filter((match) => match.similarity >= 0.6) // 60% similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5) // Top 5 matches
    .map((match) => match.report);

  return potentialMatches;
}
