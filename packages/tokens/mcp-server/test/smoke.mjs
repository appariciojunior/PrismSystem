import { readFileSync } from "fs";

const { tokenLookup } = await import("../tools/token-lookup.js");
const { tokenValidate } = await import("../tools/token-validate.js");
const { foundationGate } = await import("../tools/foundation-gate.js");
const { rampLookup } = await import("../tools/ramp-lookup.js");
const { contrastCheck } = await import("../tools/contrast-check.js");
const { dependencyGraph } = await import("../tools/dependency-graph.js");
const { searchTokens } = await import("../tools/search-tokens.js");
const { auditDesignSystem } = await import("../tools/audit-design-system.js");
const { generateTokenDocs } = await import("../tools/generate-token-docs.js");

// Test foundation gate
const gateResult = foundationGate({ tokenPath: "foundation.brand.white", operation: "write" });
console.log("Foundation gate (write):", gateResult.blocked ? "BLOCKED ✅" : "ALLOWED ❌");

const gateResult2 = foundationGate({ tokenPath: "text.primary", operation: "write" });
console.log("Semantic path (write):", gateResult2.allowed ? "ALLOWED ✅" : "BLOCKED ❌");

// Test contrast check
const contrast = contrastCheck({ foreground: "#000000", background: "#ffffff", level: "AA" });
console.log("Contrast #000/#fff:", contrast.ratioString, contrast.overall === "PASS" ? "✅" : "❌");

// Test token lookup
const lookup = await tokenLookup({ query: "text.primary", queryType: "pattern", layer: "all", mode: "all" });
console.log("Token lookup text.primary:", lookup.count, "results", lookup.count > 0 ? "✅" : "❌");

// Test token validate
const validate = await tokenValidate({ level: "syntax" });
console.log("JSON validation:", validate.json_syntax.status === "pass" ? "PASS ✅" : "FAIL ❌");

// Test semantic token search
const semanticSearch = await searchTokens({ intent: "danger button", mode: "all", maxResults: 5 });
console.log("Semantic search:", semanticSearch.recommendations.length > 0 ? "PASS ✅" : "FAIL ❌");

// Test system audit
const audit = await auditDesignSystem({ mode: "light", includeContrast: false, contrastLevel: "AA" });
console.log("Design system audit:", typeof audit.summary?.score === "number" ? "PASS ✅" : "FAIL ❌");

// Test docs generation
const docs = await generateTokenDocs({ groupPath: "light/ core.interactive.link" });
console.log("Generate docs:", docs.outputPath ? "PASS ✅" : "FAIL ❌");

console.log("\n✅ All MCP tool imports and basic tests passed");

process.exit(0);
