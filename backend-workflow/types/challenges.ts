/**
 * Challenges Type Definition
 * 
 * Re-exports CHALLENGE_LIBRARY from the challenge data module
 * for use in backend workflow services.
 */

import { CHALLENGE_LIBRARY } from "@/lib/data/challenges";

/**
 * CHALLENGES object - contains all 10 challenge definitions
 * 
 * This is a re-export of CHALLENGE_LIBRARY for consistency
 * with the expected backend-workflow structure.
 */
export const CHALLENGES = CHALLENGE_LIBRARY;

/**
 * Re-export challenge-related types and functions
 */
export type { ChallengeDetail } from "@/lib/data/challenges";
export { getChallengeDetails, getAllChallengeIds, challengeExists } from "@/lib/data/challenges";
