---
name: react-loop
description: ReAct (Reasoning + Acting) pattern for grounded problem-solving. Interleaves explicit reasoning traces with tool actions and observations.
license: MIT
metadata:
  category: reasoning
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# ReAct Loop

## Purpose

Apply the **ReAct pattern** (Reasoning and Acting) to solve tasks through explicit reasoning traces interleaved with tool actions and observations. This prevents hallucination, enables self-correction, and creates auditable decision chains.

## Why ReAct?

| Traditional Approach | ReAct Approach       |
| -------------------- | -------------------- |
| Jump to solution     | Think before acting  |
| Assume facts         | Observe to confirm   |
| One-shot answer      | Iterative refinement |
| Hidden reasoning     | Explicit trace       |
| Error-prone          | Self-correcting      |

## The ReAct Loop

```
┌─────────────────────────────────────────┐
│              TASK RECEIVED              │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  THOUGHT: Reason about current state    │
│  "I need to... because..."              │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  ACTION: Invoke skill or tool           │
│  INVOKE: skill/category/name            │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│  OBSERVATION: Record what happened      │
│  "The result shows..."                  │
└─────────────────┬───────────────────────┘
                  ▼
        ┌─────────┴─────────┐
        │  Task complete?   │
        └─────────┬─────────┘
              No  │  Yes
        ┌─────────┘    └──────┐
        ▼                     ▼
   (Loop back to        ┌─────────────┐
    THOUGHT)            │  CONCLUDE   │
                        └─────────────┘
```

## Action Space (Available Tools)

Before reasoning, know your available actions. Each agent has access to:

### Universal Actions

| Action                 | Input         | Output         | Use When                |
| ---------------------- | ------------- | -------------- | ----------------------- |
| `grep`                 | pattern, file | matching lines | Finding token locations |
| `jq`                   | query, file   | JSON subset    | Extracting token values |
| `cat`                  | file          | file contents  | Reading small files     |
| `npm run build:output` | -             | build result   | Validating changes      |
| `npm run test:output`  | -             | test result    | Running test suite      |
| `git diff`             | -             | changes        | Reviewing modifications |

### Skill Actions

| Action              | Category    | Input Schema                                | Output                 |
| ------------------- | ----------- | ------------------------------------------- | ---------------------- |
| `token-lookup`      | discovery   | `{ path: string }` or `{ pattern: string }` | Token value(s)         |
| `dependency-graph`  | discovery   | `{ token: string }`                         | Reference chain        |
| `safe-token-edit`   | editing     | `{ path, field, new_value, reason }`        | Edit confirmation      |
| `bulk-transform`    | editing     | `{ pattern, transform }`                    | Batch edit result      |
| `json-validate`     | validation  | `{ file?: string }`                         | Valid/invalid + errors |
| `build-verify`      | validation  | -                                           | Build + test status    |
| `constraint-check`  | validation  | `{ changes: string[] }`                     | Compliance status      |
| `foundation-gate`   | governance  | `{ path: string }`                          | Allowed/blocked        |
| `palette-gate`      | governance  | `{ path: string }`                          | Allowed/blocked        |
| `contrast-check`    | color-ramps | `{ step, background }`                      | Ratio + pass/fail      |
| `dark-mode-mapping` | color-ramps | `{ light_step: string }`                    | Dark equivalent        |

**Rule**: Only invoke actions from this list. If you need something not listed, use a shell command or ask.

## Thought Types

Not all thoughts are the same. Categorize your reasoning:

| Type           | Prefix      | Purpose             | Example                                                  |
| -------------- | ----------- | ------------------- | -------------------------------------------------------- |
| **Planning**   | `[PLAN]`    | Break down task     | "I need to: 1) check governance, 2) find value, 3) edit" |
| **Reasoning**  | `[REASON]`  | Analyze information | "Since neutral.900 = #262626 and we need 4.5:1..."       |
| **Reflection** | `[REFLECT]` | Review progress     | "I've completed steps 1-2, step 3 failed because..."     |
| **Decision**   | `[DECIDE]`  | Choose path         | "Given the error, I should try approach B instead"       |

Example with typed thoughts:

```markdown
**Thought [PLAN]**: Task is to add text.inverse token. Steps:

1. Check governance (foundation-gate)
2. Find existing text tokens for pattern
3. Choose correct palette reference
4. Add token to both light and dark
5. Validate

**Action**: INVOKE skill/governance/foundation-gate { path: "light/ core.text.inverse" }
**Observation**: ✓ Allowed - semantic layer

**Thought [REASON]**: Good. Now I need to understand the pattern. Text.inverse should be
the opposite of text.primary - white text on dark backgrounds in light mode.

**Action**: INVOKE skill/discovery/token-lookup { path: "light/ core.text.primary" }
**Observation**: text.primary = {brand.core.ramp.neutral.950} (near black)

**Thought [DECIDE]**: For inverse, I need near white. That's neutral.50 in light mode.
For dark mode, remember reversal: neutral.50 = black, so I need neutral.1000.
```

## Scratchpad (Working Memory)

For complex tasks, maintain a scratchpad to track state:

```markdown
## Scratchpad

**Task**: Add text.inverse semantic token
**Status**: In progress (step 3/5)

**Findings**:

- ✓ Governance: allowed (semantic layer)
- ✓ text.primary = neutral.950
- Light mode inverse = neutral.50 (#ffffff)
- Dark mode inverse = neutral.1000 (#ffffff)

**Blockers**: None

**Next**: Add token to tokens.json
```

Update scratchpad after each observation. This prevents context loss in long reasoning chains.

## Max Iterations & Escalation

**Hard limit**: 7 iterations per sub-task

| Iteration | Action                                                                               |
| --------- | ------------------------------------------------------------------------------------ |
| 1-3       | Normal reasoning                                                                     |
| 4-5       | Add `[REFLECT]` thought: "I've tried 4 approaches, let me review what's not working" |
| 6         | Simplify: Try most basic approach                                                    |
| 7         | **STOP**: Escalate to human                                                          |

```markdown
**Thought [REFLECT]**: Iteration 5. I've tried:

1. Direct path reference → circular ref error
2. Full path with layer → not found
3. Shorthand reference → build failed
4. Copied existing pattern → still failing

**Thought [DECIDE]**: Before iteration 6, let me try the simplest possible thing:
hardcode the actual color value temporarily to isolate the issue.

**Action**: Set value to "#262626" directly
**Observation**: Build passes! The issue is reference resolution, not the token structure.

**Thought [REASON]**: Now I know the problem is in how references resolve...
```

## Trajectory Review

Every 3 iterations, add a trajectory review:

```markdown
**Thought [REFLECT - TRAJECTORY REVIEW]**:

- Goal: Add text.inverse token
- Progress: 60% (found values, governance passed)
- On track: Yes
- Drift detected: No
- Confidence: High
- Next milestone: Edit tokens.json
```

If drift detected:

```markdown
**Thought [REFLECT - TRAJECTORY REVIEW]**:

- Goal: Add text.inverse token
- Progress: 30%
- On track: NO - I've been debugging a build error for 3 iterations
- Drift detected: YES - this build error is unrelated to my task
- Confidence: Low
- **Correction**: Stash my changes, verify main builds, then retry
```

## Trace Format

Use this format to structure reasoning:

```markdown
**Thought**: [What I'm trying to accomplish and why]
**Action**: [Skill/tool to invoke]
**Observation**: [What the result tells me]

**Thought**: [What I learned and what to do next]
**Action**: [Next skill/tool]
**Observation**: [Result]

... (repeat until complete)

**Conclusion**: [Final answer/summary]
```

## Compact Format (For Simple Tasks)

When the task is straightforward, use the compact format:

```markdown
T: [Brief thought]
A: [Action]
O: [Observation]
→ [Next step or conclusion]
```

## ReAct Principles

### 1. Think Before Acting

**Bad**: Immediately edit tokens.json  
**Good**: First reason about what change is needed, check governance, then act

```markdown
**Thought**: User wants to change text.primary. I need to:

1. Check if this is foundation (blocked) or semantic (allowed)
2. Find current value
3. Understand what new value should be

**Action**: grep -n "text.primary" packages/tokens/src/tokens.json | head -5
**Observation**: Found in light/ core at line 4521, value is {brand.core.ramp.neutral.950}

**Thought**: Good, it's semantic layer (allowed). Now I need to understand the target change...
```

### 2. Ground in Observation

**Bad**: "The token probably uses neutral.900"  
**Good**: Actually look up the value

```markdown
**Thought**: I need to confirm the current value before making changes.
**Action**: INVOKE skill/discovery/token-lookup { path: "light/ core.text.primary" }
**Observation**: Current value = {brand.core.ramp.neutral.950}

**Thought**: Confirmed. Now I can proceed with the correct baseline.
```

### 3. Self-Correct on Failure

**Bad**: "The build failed. I'll try something else."  
**Good**: Analyze the error, understand why, then correct

```markdown
**Thought**: Build failed. I need to understand the error.
**Action**: npm run build:output 2>&1 | tail -20
**Observation**: Error: Circular reference detected: text.primary → surface.default → text.primary

**Thought**: I introduced a circular reference. I need to use a different token path that doesn't create a cycle.
**Action**: INVOKE skill/discovery/dependency-graph { token: "surface.default" }
**Observation**: surface.default references text.primary. Using it for text.primary creates cycle.

**Thought**: I should reference brand.core.ramp directly instead of surface.default.
```

### 4. Explicit Stopping Conditions

Always identify when to stop iterating:

- ✅ Task explicitly completed (build passes, tests pass)
- ✅ Blocked by governance (need human approval)
- ✅ Observation contradicts assumptions (pause and report)
- ❌ Never just "give up" without explanation

## ReAct for Each Agent Role

### Architect

```markdown
**Thought**: Planning a new semantic token. Need to determine the right palette references.
**Action**: INVOKE skill/discovery/token-lookup { pattern: "brand.core.ramp.neutral.\*" }
**Observation**: Found 19 steps from 50 to 1000.

**Thought**: For primary text, I need good contrast on white. Let me check which step provides 4.5:1 ratio.
**Action**: INVOKE skill/color-ramps/contrast-check { step: "neutral.900", background: "white" }
**Observation**: neutral.900 = #262626, contrast = 13.5:1 ✓

**Thought**: neutral.900 works for light mode. For dark mode, remember ramps are REVERSED...
**Action**: hex_lookup({ tokenPath: "ramp.neutral.900", mode: "dark" })
**Observation**: ramp.neutral.900 dark = #d9d9d9

**Thought**: That's a light gray - good for dark mode text. Architecture complete.
**Conclusion**: Use neutral.900 for both modes - ramp reversal handles the inversion.
```

### Code Agent

```markdown
**Thought**: Need to edit text.primary. First check governance.
**Action**: INVOKE skill/governance/foundation-gate { path: "light/ core.text.primary" }
**Observation**: ✓ Allowed - semantic layer, not foundation.

**Thought**: Safe to proceed. Now make the edit.
**Action**: INVOKE skill/editing/safe-token-edit {
path: "light/ core.text.primary",
field: "value",
new_value: "{brand.core.ramp.neutral.900}"
}
**Observation**: Edit complete.

**Thought**: Validate the change.
**Action**: INVOKE skill/validation/json-validate
**Observation**: ✓ Valid JSON

**Action**: npm run build:output
**Observation**: ✓ Build passed

**Conclusion**: Change committed. Ready for testing.
```

### Testing Agent

```markdown
**Thought**: Code Agent marked READY_FOR_TESTING. Need to verify the text.primary change.
**Action**: INVOKE skill/validation/build-verify
**Observation**: ✓ Build passes, tests pass

**Thought**: Now check mode-specific behavior.
**Action**: Run mode validation script
**Observation**: light=neutral.900, dark=neutral.900 (same step, but ramps reversed = correct)

**Thought**: Verify the actual computed colors differ.
**Action**: Check resolved values in build output
**Observation**: light=#262626 (dark text), dark=#d9d9d9 (light text) ✓

**Conclusion**: TESTING_PASSED - light/dark correctly inverted.
```

### Architect (Post-Implementation)

```markdown
**Thought**: Code + Testing complete. Need to assess changelog impact.
**Action**: git diff --stat
**Observation**: 1 file changed: tokens.json (+2, -2)

**Thought**: This is a token value change - changelog-worthy per our rules.
**Action**: Check if announcement needed
**Observation**: text.primary is a widely-used token - YES, needs announcement.

**Conclusion**: Approved for merge. Creating release announcement in token-library-release/
```

## Anti-Patterns (What NOT to Do)

### ❌ Acting Without Thinking

```markdown
# BAD - No reasoning before action

Let me edit tokens.json...
[makes change that breaks dark mode]
```

### ❌ Assuming Without Observing

```markdown
# BAD - Assumed rather than checked

**Thought**: The neutral.900 is probably #262626

# Correct approach: Actually look it up!
```

### ❌ Ignoring Observations

```markdown
# BAD - Ignores observation

**Observation**: Build failed with circular reference error
**Thought**: I'll just commit anyway... ← WRONG!
```

### ❌ Infinite Loops

```markdown
# BAD - No stopping condition

**Thought**: Still not working, let me try again...
**Thought**: Still not working, let me try again...

# Correct: After 3 attempts, stop and report the issue to human
```

## Integration with Skills

ReAct enhances all existing skills. Before invoking any skill:

1. **THOUGHT**: Why am I invoking this skill?
2. **ACTION**: Invoke the skill
3. **OBSERVATION**: What did I learn?
4. **THOUGHT**: What does this mean for my next step?

## Debugging with ReAct

When something goes wrong, use ReAct for systematic debugging:

```markdown
**Thought**: Build failed. I need to understand what went wrong.
**Action**: Review error message
**Observation**: "Cannot resolve reference {brand.core.ramp.neutral.900}"

**Thought**: The reference path might be wrong. Let me check what paths exist.
**Action**: jq 'keys' packages/tokens/src/tokens.json | grep -i brand
**Observation**: "Palette - Light/ Brand", "Palette - Dark/ Brand"

**Thought**: Ah! The brand.core.ramp is inside "Palette - Light/ Brand", not at root.
**Action**: Check how other semantic tokens reference it
**Observation**: They use {brand.core.ramp.neutral.900} - should resolve via theme composition.

**Thought**: The issue must be elsewhere. Let me check theme configuration...
```

## Quick Reference

| Phase       | Question to Ask                      | Action Type |
| ----------- | ------------------------------------ | ----------- |
| THOUGHT     | "What am I trying to do? Why?"       | Reasoning   |
| ACTION      | "What skill/tool achieves this?"     | Execution   |
| OBSERVATION | "What did I learn from the result?"  | Analysis    |
| CONCLUDE    | "Is the task complete? What's next?" | Decision    |

## Error Recovery Pattern

```markdown
**Thought**: [Describe what went wrong]
**Action**: [Gather diagnostic information]
**Observation**: [Analyze error details]
**Thought**: [Identify root cause]
**Action**: [Attempt fix]
**Observation**: [Verify fix worked]
```

If fix fails after 3 attempts:

```markdown
**Conclusion**: BLOCKED - Unable to resolve after 3 attempts.
Root cause: [Best understanding]
Recommended: [Human intervention needed for X]
```

## Prompt Template (Few-Shot Format)

When starting a ReAct reasoning chain, use this template:

```markdown
You are solving a task using the ReAct pattern. You have access to these actions:
[List relevant actions from Action Space]

Follow this format strictly:
Thought: reason about what to do
Action: action_name { input_json }
Observation: (result will appear here)
... (repeat Thought/Action/Observation)
Thought: I have completed the task
Conclusion: [final answer]

Task: [user's task here]

---

Thought: Let me break down what I need to do...
```

### Few-Shot Example (Complete Trace)

```markdown
Task: Find what color value text.primary resolves to in light mode

Thought [PLAN]: I need to:

1. Find the text.primary token path
2. Get its reference value
3. Resolve the reference to actual color

Action: grep -n "text.\*primary" packages/tokens/src/tokens.json | head -3
Observation:
4521: "primary": {
4522: "value": "{brand.core.ramp.neutral.950}",

Thought [REASON]: text.primary references neutral.950. Now I need the actual color.

Action: hex_lookup({ tokenPath: "ramp.neutral.950", mode: "light" })
Observation: ramp.neutral.950 light = #1a1a1a

Thought: Found it.
Conclusion: text.primary in light mode resolves to #1a1a1a (near black)
```

## Observation Parsing

Observations can be:

| Type        | Example                 | How to Handle                             |
| ----------- | ----------------------- | ----------------------------------------- |
| **Success** | `✓ Build passed`        | Proceed to next step                      |
| **Data**    | `neutral.950 = #1a1a1a` | Extract and use in next thought           |
| **Error**   | `Error: Cannot find...` | Diagnose → decide → retry or escalate     |
| **Empty**   | `No matches found`      | Valid data point - absence is information |
| **Partial** | `3 of 5 tests passed`   | Investigate failures before proceeding    |

**Key Rule**: Never ignore observations. Every observation must inform your next thought.

## Chain-of-Thought Integration

ReAct enhances Chain-of-Thought (CoT) by grounding reasoning in observations:

| Pure CoT                              | ReAct                                                       |
| ------------------------------------- | ----------------------------------------------------------- |
| "The token probably uses neutral.900" | **Action**: look it up → **Observation**: it's neutral.950  |
| "This should work because..."         | **Action**: try it → **Observation**: it failed because X   |
| "I think the file is at..."           | **Action**: find it → **Observation**: actual location is Y |

**Rule**: Replace "probably", "should", "I think" with Action → Observation.

## Summary Checklist

Before concluding any ReAct chain, verify:

- [ ] All planned steps completed (check scratchpad)
- [ ] No unaddressed errors in observations
- [ ] Trajectory review shows "on track"
- [ ] Final observation confirms success
- [ ] Conclusion includes actionable summary

## Version History

| Version | Changes                                                                          |
| ------- | -------------------------------------------------------------------------------- |
| 1.0     | Initial ReAct pattern                                                            |
| 1.1     | Added Action Space, Thought Types, Scratchpad, Max Iterations, Trajectory Review |
| 1.2     | Added Prompt Template, Observation Parsing, CoT Integration, Summary Checklist   |
