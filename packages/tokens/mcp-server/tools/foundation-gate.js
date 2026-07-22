/**
 * Foundation Gate Tool
 * Skill: governance/foundation-gate.md
 *
 * Protect foundation layer tokens from unauthorized modification.
 */

/**
 * Check if a token path targets the protected foundation layer.
 */
export function foundationGate({ tokenPath, operation }) {
  const isFoundation =
    tokenPath.startsWith('foundation.') ||
    tokenPath.startsWith('Foundation.') ||
    tokenPath.toLowerCase().startsWith('foundation/') ||
    tokenPath === 'Foundation' ||
    tokenPath === 'foundation';

  if (!isFoundation) {
    return {
      allowed: true,
      blocked: false,
      tokenPath,
      operation,
      layer: 'non-foundation',
      reason: 'Token is not in the foundation layer. Proceed with edit.'
    };
  }

  if (operation === 'read') {
    return {
      allowed: true,
      blocked: false,
      tokenPath,
      operation,
      layer: 'foundation',
      reason: 'Read access to foundation tokens is always allowed.',
      warning:
        "This is a foundation token. Write/delete operations require explicit human approval and a 'foundation-change' PR label."
    };
  }

  // write or delete
  return {
    allowed: false,
    blocked: true,
    tokenPath,
    operation,
    layer: 'foundation',
    reason:
      "BLOCKED: Foundation tokens are protected. Write/delete requires explicit human approval and a 'foundation-change' PR label.",
    action:
      "STOP. Do not modify this token. Instead: (1) use a different palette step, or (2) get explicit human approval with 'foundation-change' label.",
    alternatives: [
      'Use a Palette ramp step instead (e.g., {brand.core.ramp.neutral.XXX})',
      "Request human approval with 'foundation-change' PR label",
      'Escalate to Design Tokens Owners for review'
    ]
  };
}
