import { BloodGroup, DonorBadge } from '@prisma/client';

// Blood compatibility matrix
const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
    A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
    A_NEG: ['A_NEG', 'O_NEG'],
    B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
    B_NEG: ['B_NEG', 'O_NEG'],
    AB_POS: ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
    AB_NEG: ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
    O_POS: ['O_POS', 'O_NEG'],
    O_NEG: ['O_NEG'],
};

// Scoring weights configuration
const WEIGHTS = {
    BLOOD_COMPATIBILITY: 40,  // Most critical factor
    LOCATION_PROXIMITY: 25,   // Important for quick response
    DONOR_RELIABILITY: 20,    // Badge/reputation matters
    AVAILABILITY: 15,         // Can they donate now?
};

// Badge score mapping
const BADGE_SCORES: Record<DonorBadge, number> = {
    NORMAL: 25,
    VERIFIED: 50,
    RELIABLE: 75,
    HERO: 100,
};

interface DonorWithUser {
    id: string;
    userId: string;
    bloodGroup: BloodGroup;
    location: string;
    totalDonations: number;
    lastDonationDate: Date | null;
    nextEligibleDate: Date | null;
    badge: DonorBadge;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
}

interface ScoredDonor extends DonorWithUser {
    matchScore: number;
    scoreBreakdown: {
        bloodCompatibility: number;
        locationProximity: number;
        donorReliability: number;
        availability: number;
        total: number;
    };
}

/**
 * Calculate blood compatibility score
 * Perfect match = 100, Compatible = 70, Incompatible = 0
 */
function calculateBloodCompatibilityScore(
    requestedBloodGroup: BloodGroup,
    donorBloodGroup: BloodGroup
): number {
    if (!BLOOD_COMPATIBILITY[requestedBloodGroup].includes(donorBloodGroup)) {
        return 0; // Incompatible
    }

    // Perfect match (same blood group)
    if (requestedBloodGroup === donorBloodGroup) {
        return 100;
    }

    // Universal donor (O_NEG) gets high score
    if (donorBloodGroup === 'O_NEG') {
        return 90;
    }

    // Compatible but not perfect match
    return 70;
}

/**
 * Calculate location proximity score based on string similarity
 * In production, use actual geocoding/distance calculation
 */
function calculateLocationProximityScore(
    recipientLocation: string,
    donorLocation: string
): number {
    const recipientLower = recipientLocation.toLowerCase().trim();
    const donorLower = donorLocation.toLowerCase().trim();

    // Exact match
    if (recipientLower === donorLower) {
        return 100;
    }

    // Check if one location contains the other (e.g., "Kathmandu" in "Kathmandu, Nepal")
    if (recipientLower.includes(donorLower) || donorLower.includes(recipientLower)) {
        return 80;
    }

    // Calculate simple string similarity (Jaccard similarity on words)
    const recipientWords = new Set(recipientLower.split(/\s+/));
    const donorWords = new Set(donorLower.split(/\s+/));

    const intersection = new Set([...recipientWords].filter(word => donorWords.has(word)));
    const union = new Set([...recipientWords, ...donorWords]);

    const similarity = (intersection.size / union.size) * 100;

    return Math.max(similarity, 20); // Minimum 20 points for any donor
}

/**
 * Calculate donor reliability score based on badge and donation history
 */
function calculateDonorReliabilityScore(
    badge: DonorBadge,
    totalDonations: number
): number {
    const badgeScore = BADGE_SCORES[badge];

    // Bonus for donation history (up to 20 extra points)
    const donationBonus = Math.min(totalDonations * 2, 20);

    return Math.min(badgeScore + donationBonus, 100);
}

/**
 * Calculate availability score based on eligibility date
 */
function calculateAvailabilityScore(
    nextEligibleDate: Date | null,
    lastDonationDate: Date | null
): number {
    const now = new Date();

    // Never donated before - highly available
    if (!lastDonationDate) {
        return 100;
    }

    // No next eligible date set - assume available
    if (!nextEligibleDate) {
        return 100;
    }

    // Already eligible
    if (nextEligibleDate <= now) {
        return 100;
    }

    // Calculate days until eligible
    const daysUntilEligible = Math.ceil(
        (nextEligibleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Score decreases as days increase (0-56 days scale)
    // 0 days = 100, 56 days = 0
    const score = Math.max(0, 100 - (daysUntilEligible / 56) * 100);

    return score;
}

/**
 * Calculate weighted total score for a donor
 */
export function calculateDonorScore(
    requestedBloodGroup: BloodGroup,
    recipientLocation: string,
    donor: DonorWithUser
): ScoredDonor {
    // Calculate individual scores (0-100 scale)
    const bloodCompatibility = calculateBloodCompatibilityScore(
        requestedBloodGroup,
        donor.bloodGroup
    );

    const locationProximity = calculateLocationProximityScore(
        recipientLocation,
        donor.location
    );

    const donorReliability = calculateDonorReliabilityScore(
        donor.badge,
        donor.totalDonations
    );

    const availability = calculateAvailabilityScore(
        donor.nextEligibleDate,
        donor.lastDonationDate
    );

    // Calculate weighted total score
    const total = (
        (bloodCompatibility * WEIGHTS.BLOOD_COMPATIBILITY) +
        (locationProximity * WEIGHTS.LOCATION_PROXIMITY) +
        (donorReliability * WEIGHTS.DONOR_RELIABILITY) +
        (availability * WEIGHTS.AVAILABILITY)
    ) / 100;

    return {
        ...donor,
        matchScore: Math.round(total * 100) / 100, // Round to 2 decimal places
        scoreBreakdown: {
            bloodCompatibility: Math.round(bloodCompatibility * 100) / 100,
            locationProximity: Math.round(locationProximity * 100) / 100,
            donorReliability: Math.round(donorReliability * 100) / 100,
            availability: Math.round(availability * 100) / 100,
            total: Math.round(total * 100) / 100,
        },
    };
}

/**
 * Find and rank best matching donors for a blood request
 */
export function rankDonors(
    requestedBloodGroup: BloodGroup,
    recipientLocation: string,
    donors: DonorWithUser[],
    minScore: number = 0
): ScoredDonor[] {
    // Filter out incompatible blood groups first
    const compatibleDonors = donors.filter(donor =>
        BLOOD_COMPATIBILITY[requestedBloodGroup].includes(donor.bloodGroup)
    );

    // Calculate scores for all compatible donors
    const scoredDonors = compatibleDonors.map(donor =>
        calculateDonorScore(requestedBloodGroup, recipientLocation, donor)
    );

    // Filter by minimum score and sort by total score (descending)
    return scoredDonors
        .filter(donor => donor.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get blood compatibility information
 */
export function getCompatibleBloodGroups(bloodGroup: BloodGroup): BloodGroup[] {
    return BLOOD_COMPATIBILITY[bloodGroup];
}
