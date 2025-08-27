/**
 * MockAIService - Simulates AI-powered center recommendations using rule-based logic
 * All recommendations are deterministic and work completely offline
 */

export class MockAIService {
  constructor() {
    this.cache = new Map();
    this.recommendationHistory = [];
  }

  /**
   * Generate intelligent center recommendations based on search criteria
   * @param {Array} centers - Array of center objects
   * @param {Object} searchCriteria - Search parameters (location, bodyPart, modalities, etc.)
   * @returns {Array} - Sorted centers with scores and reasoning
   */
  generateRecommendations(centers, searchCriteria = {}) {
    const cacheKey = this.generateCacheKey(centers, searchCriteria);
    
    // Check cache first for consistent results
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const recommendations = centers.map(center => {
      const score = this.calculateScore(center, searchCriteria);
      const reasoning = this.generateReasoning(center, searchCriteria, score);
      
      // Debug logging for scoring
      console.log(`🤖 Scoring ${center.name}:`, {
        distance: center.distance,
        rating: center.rating,
        distanceScore: this.calculateDistanceScore(center, searchCriteria),
        qualityScore: this.calculateQualityScore(center),
        finalScore: score
      });
      
      return {
        ...center,
        aiScore: score,
        aiReasoning: reasoning,
        confidence: this.calculateConfidence(center, searchCriteria)
      };
    });

    // Sort by AI score (highest first)
    recommendations.sort((a, b) => b.aiScore - a.aiScore);

    // Add ranking metadata
    recommendations.forEach((rec, index) => {
      rec.aiRank = index + 1;
      rec.aiRecommendation = this.getRecommendationLevel(rec.aiScore);
    });

    // Cache the results for consistency
    this.cache.set(cacheKey, recommendations);
    
    // Track recommendation history
    this.recommendationHistory.push({
      timestamp: new Date().toISOString(),
      criteria: searchCriteria,
      topRecommendation: recommendations[0]?.id
    });

    return recommendations;
  }

  /**
   * Calculate intelligent score for a center based on search criteria
   * @param {Object} center - Center object
   * @param {Object} criteria - Search criteria
   * @returns {number} - Score from 0-100
   */
  calculateScore(center, criteria) {
    let score = 0;
    
    // Base score from center quality metrics (35% weight)
    const qualityScore = this.calculateQualityScore(center);
    score += qualityScore * 0.35;
    
    // Distance relevance (40% weight) - Increased importance
    const distanceScore = this.calculateDistanceScore(center, criteria);
    score += distanceScore * 0.4;
    
    // Modality and body part match (15% weight)
    const matchScore = this.calculateMatchScore(center, criteria);
    score += matchScore * 0.15;
    
    // Availability and capacity (10% weight)
    const availabilityScore = this.calculateAvailabilityScore(center);
    score += availabilityScore * 0.1;
    
    return Math.round(score * 100) / 100;
  }

  /**
   * Calculate quality score based on center performance metrics
   */
  calculateQualityScore(center) {
    let score = 0;
    
    // Rating contribution (0-5 scale converted to 0-100)
    if (center.rating) {
      score += (center.rating / 5) * 40;
    }
    
    // Turnaround time contribution (lower TAT = higher score)
    if (center.avgTat) {
      const tatScore = Math.max(0, 30 - (center.avgTat * 5));
      score += tatScore;
    }
    
    // Satisfaction score contribution
    if (center.satisfactionScore) {
      score += (center.satisfactionScore / 100) * 20;
    }
    
    // Accreditation bonus
    if (center.accreditations && center.accreditations.length > 0) {
      score += Math.min(10, center.accreditations.length * 2);
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate distance relevance score
   */
  calculateDistanceScore(center, criteria) {
    if (!center.distance) {
      return 50; // Neutral score if no distance info
    }
    
    // Always apply distance scoring regardless of search criteria
    // Convert distance to score (closer = higher score)
    // More balanced scoring that gives proper weight to distance
    // 0-2 miles: 100-90, 2-5 miles: 90-75, 5-10 miles: 75-60, 10+ miles: 60-40
    if (center.distance <= 2) {
      return 100 - (center.distance * 5); // 100, 95, 90
    } else if (center.distance <= 5) {
      return 90 - ((center.distance - 2) * 5); // 85, 80, 75
    } else if (center.distance <= 10) {
      return 75 - ((center.distance - 5) * 3); // 72, 69, 66, 63, 60
    } else {
      return Math.max(40, 60 - ((center.distance - 10) * 2));
    }
  }

  /**
   * Calculate modality and body part match score
   */
  calculateMatchScore(center, criteria) {
    let score = 0;
    
    // Modality match
    if (criteria.modalities && criteria.modalities.length > 0) {
      const modalityMatches = criteria.modalities.filter(mod => 
        center.modalities.includes(mod)
      );
      score += (modalityMatches.length / criteria.modalities.length) * 50;
    }
    
    // Body part match
    if (criteria.bodyPart && center.bodyParts) {
      if (center.bodyParts.includes(criteria.bodyPart)) {
        score += 30;
      }
      
      // Bonus for specialty match
      if (center.specialties) {
        const specialtyMatch = this.getBodyPartSpecialty(criteria.bodyPart);
        if (center.specialties.includes(specialtyMatch)) {
          score += 20;
        }
      }
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate availability and capacity score
   */
  calculateAvailabilityScore(center) {
    let score = 0;
    
    // Utilization score (lower utilization = higher availability)
    if (center.utilization !== undefined) {
      score += Math.max(0, 50 - (center.utilization * 0.5));
    }
    
    // No-show rate consideration (lower = better)
    if (center.noShowRate !== undefined) {
      score += Math.max(0, 30 - (center.noShowRate * 2));
    }
    
    // Operating hours bonus
    if (center.hours) {
      const totalHours = this.calculateTotalHours(center.hours);
      if (totalHours >= 60) score += 20; // Extended hours
      else if (totalHours >= 40) score += 10; // Standard hours
    }
    
    return Math.min(100, score);
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  generateReasoning(center, criteria, score) {
    const reasons = [];
    
    // Quality-based reasoning
    if (center.rating >= 4.5) {
      reasons.push(`High rating (${center.rating}/5) with ${center.reviewCount} reviews`);
    }
    
    if (center.avgTat && center.avgTat <= 2.5) {
      reasons.push(`Fast turnaround time (${center.avgTat} days)`);
    }
    
    // Distance reasoning
    if (center.distance && center.distance <= 5) {
      reasons.push(`Conveniently located (${center.distance} miles away)`);
    }
    
    // Modality reasoning
    if (criteria.modalities && criteria.modalities.length > 0) {
      const availableModalities = criteria.modalities.filter(mod => 
        center.modalities.includes(mod)
      );
      if (availableModalities.length > 0) {
        reasons.push(`Offers ${availableModalities.join(', ')} imaging`);
      }
    }
    
    // Specialty reasoning
    if (criteria.bodyPart && center.specialties) {
      const specialty = this.getBodyPartSpecialty(criteria.bodyPart);
      if (center.specialties.includes(specialty)) {
        reasons.push(`Specializes in ${specialty} imaging`);
      }
    }
    
    // Technology reasoning
    if (center.magnetStrength === '3T') {
      reasons.push('Advanced 3T MRI technology');
    }
    
    // Accessibility reasoning
    if (center.adaCompliant) {
      reasons.push('ADA compliant facility');
    }
    
    return reasons.length > 0 ? reasons.join('. ') : 'Comprehensive imaging services available';
  }

  /**
   * Calculate confidence level for the recommendation
   */
  calculateConfidence(center, criteria) {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on data completeness
    if (center.rating && center.avgTat && center.utilization) {
      confidence += 15;
    }
    
    // Increase confidence for strong modality matches
    if (criteria.modalities && criteria.modalities.length > 0) {
      const modalityMatches = criteria.modalities.filter(mod => 
        center.modalities.includes(mod)
      );
      if (modalityMatches.length === criteria.modalities.length) {
        confidence += 10;
      }
    }
    
    // Increase confidence for specialty matches
    if (criteria.bodyPart && center.specialties) {
      const specialty = this.getBodyPartSpecialty(criteria.bodyPart);
      if (center.specialties.includes(specialty)) {
        confidence += 5;
      }
    }
    
    return Math.min(100, confidence);
  }

  /**
   * Get recommendation level based on score
   */
  getRecommendationLevel(score) {
    if (score >= 85) return 'Highly Recommended';
    if (score >= 70) return 'Recommended';
    if (score >= 50) return 'Good Option';
    return 'Consider';
  }

  /**
   * Get body part specialty mapping
   */
  getBodyPartSpecialty(bodyPart) {
    const specialtyMap = {
      'Head': 'Neurological',
      'Spine': 'Spine',
      'Chest': 'Cardiac',
      'Breast': 'Breast Imaging',
      'Abdomen': 'General Radiology',
      'Pelvis': 'General Radiology',
      'Extremities': 'Orthopedic'
    };
    return specialtyMap[bodyPart] || 'General Radiology';
  }

  /**
   * Calculate total operating hours per week
   */
  calculateTotalHours(hours) {
    let total = 0;
    const dayHours = {
      'monday': 12, 'tuesday': 12, 'wednesday': 12, 'thursday': 12,
      'friday': 9, 'saturday': 7, 'sunday': 0
    };
    
    Object.keys(dayHours).forEach(day => {
      if (hours[day] && hours[day] !== 'Closed') {
        total += dayHours[day];
      }
    });
    
    return total;
  }

  /**
   * Generate cache key for consistent results
   */
  generateCacheKey(centers, criteria) {
    const centerIds = centers.map(c => c.id).sort().join(',');
    const criteriaStr = JSON.stringify(criteria);
    return `${centerIds}|${criteriaStr}`;
  }

  /**
   * Get recommendation history for analytics
   */
  getRecommendationHistory() {
    return this.recommendationHistory;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get popular search combinations based on center data
   */
  getPopularSearches(centers) {
    const popularCombos = [
      { bodyPart: 'Head', modalities: ['MRI'], description: 'Brain MRI scans' },
      { bodyPart: 'Spine', modalities: ['MRI'], description: 'Spine MRI imaging' },
      { bodyPart: 'Chest', modalities: ['CT'], description: 'Chest CT scans' },
      { bodyPart: 'Breast', modalities: ['Mammography'], description: 'Breast screening' },
      { bodyPart: 'Abdomen', modalities: ['CT', 'MRI'], description: 'Abdominal imaging' }
    ];

    return popularCombos.map(combo => ({
      ...combo,
      estimatedResults: centers.filter(c => 
        c.bodyParts.includes(combo.bodyPart) && 
        combo.modalities.some(mod => c.modalities.includes(mod))
      ).length
    }));
  }
}

// Export singleton instance
export const mockAIService = new MockAIService();
