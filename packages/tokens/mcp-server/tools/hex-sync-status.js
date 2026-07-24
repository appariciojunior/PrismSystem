/**
 * Hex Sync Status Tool
 *
 * Check when the resolved hex database was last synced from Figma variables,
 * and how many tokens it covers.
 */

import { getMeta, isDbPopulated } from './hex-db.js';

export async function hexSyncStatus() {
  const meta = getMeta();

  if (!meta || !meta.syncedAt) {
    return {
      populated: false,
      syncedAt: null,
      tokenCount: 0,
      figmaFileKey: meta?.figmaFileKey ?? null,
      message:
        "DB has not been synced yet. Ask user to open Token Library in Figma with Desktop Bridge and say 'sync with figma variables'."
    };
  }

  const syncedAt = new Date(meta.syncedAt);
  const now = new Date();
  const daysSinceSync = Math.floor(
    (now.getTime() - syncedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    syncedAt: meta.syncedAt,
    daysSinceSync,
    tokenCount: meta.tokenCount ?? 0,
    populated: isDbPopulated(),
    figmaFileKey: meta.figmaFileKey ?? null,
    message: `DB synced ${daysSinceSync} day${daysSinceSync === 1 ? '' : 's'} ago. ${meta.tokenCount ?? 0} tokens available.`
  };
}
