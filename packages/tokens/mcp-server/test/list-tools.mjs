/** Verify the server boots and lists the design tools over real MCP stdio.
 *  Requires the MCP SDK to be installed (npm install in this package). If it is
 *  not present this test skips cleanly rather than failing. */
let Client, StdioClientTransport;
try {
  ({ Client } = await import('@modelcontextprotocol/sdk/client/index.js'));
  ({ StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js'));
} catch {
  console.log('⏭  skipped: @modelcontextprotocol/sdk not installed. Run `npm install` in packages/tokens/mcp-server, then re-run.');
  process.exit(0);
}
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const transport = new StdioClientTransport({
  command: 'node',
  args: [resolve(__dirname, '../index.js')]
});
const client = new Client({ name: 'smoke', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
const design = ['design_rules', 'design_score', 'design_route', 'corpus_status'];
const present = design.filter((d) => names.includes(d));
console.log(`Total tools registered: ${names.length}`);
console.log(`Design tools present: ${present.join(', ')}`);
const ok = present.length === design.length;
console.log(ok ? '✅ server boots, all 4 design tools registered' : `❌ missing: ${design.filter((d) => !names.includes(d))}`);
await client.close();
process.exit(ok ? 0 : 1);
