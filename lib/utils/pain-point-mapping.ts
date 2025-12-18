/**
 * Challenge library types and exports.
 * 
 * The actual challenge data is now loaded from markdown files in lib/data/challenges/.
 * This file maintains backward compatibility by re-exporting from the new location.
 */

export type { ChallengeDetail } from "@/lib/data/challenges";

export {
  CHALLENGE_LIBRARY,
  getChallengeDetails,
  getAllChallengeIds,
  challengeExists,
} from "@/lib/data/challenges";
