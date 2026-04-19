/**
 * Test script for parser module
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseUnrealJSON } from './services/parser';

// Load output.json from parent directory
const jsonPath = path.join(__dirname, '../../output.json');
const jsonContent = fs.readFileSync(jsonPath, 'utf-8');

// Parse the malformed JSON (it's missing brackets and has no line breaks)
// Let's wrap it in brackets first
const wrappedJson = '[' + jsonContent + ']';
const jsonData = JSON.parse(wrappedJson);

console.log('📥 Loaded JSON data:', jsonData.length, 'nodes\n');

// Parse using our parser
const graph = parseUnrealJSON(jsonData);

console.log('📊 Parsed Graph:');
console.log('  Nodes:', graph.nodes.size);
console.log('  Edges:', graph.edges.length);
console.log('\n🔍 Nodes:');
for (const [id, node] of graph.nodes.entries()) {
  console.log(`  - ${id}: "${node.Dialogue}" (IsResponse: ${node.IsResponse})`);
}

console.log('\n🔗 Edges:');
for (const edge of graph.edges) {
  console.log(`  - ${edge.from} --[${edge.type}]--> ${edge.to}`);
}
