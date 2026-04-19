/**
 * Test script for round-trip: parse → export → parse
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseUnrealJSON } from './services/parser';
import { exportToUnrealJSON } from './services/exporter';
import { validateGraph } from './services/validator';

// Load output.json from parent directory
const jsonPath = path.join(__dirname, '../../output.json');
const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
const wrappedJson = '[' + jsonContent + ']';
const originalData = JSON.parse(wrappedJson);

console.log('=== ROUND-TRIP TEST ===\n');

console.log('1️⃣ Original JSON:', originalData.length, 'nodes');

// Parse original JSON
const graph1 = parseUnrealJSON(originalData);
console.log('2️⃣ Parsed to graph:', graph1.nodes.size, 'nodes,', graph1.edges.length, 'edges');

// Validate the graph
const validation = validateGraph(graph1);
console.log('3️⃣ Validation:');
console.log('   Valid:', validation.valid);
console.log('   Errors:', validation.errors.length);
console.log('   Warnings:', validation.warnings.length);
if (validation.warnings.length > 0) {
  console.log('   ⚠️  Warnings:');
  validation.warnings.forEach(w => console.log('      -', w));
}

// Export back to JSON
const exportedData = exportToUnrealJSON(graph1);
console.log('\n4️⃣ Exported back to JSON:', exportedData.length, 'nodes');

// Parse again (round-trip test)
const graph2 = parseUnrealJSON(exportedData);
console.log('5️⃣ Re-parsed:', graph2.nodes.size, 'nodes,', graph2.edges.length, 'edges');

// Compare
console.log('\n✅ COMPARISON:');
console.log('   Nodes match:', graph1.nodes.size === graph2.nodes.size);
console.log('   Edges match:', graph1.edges.length === graph2.edges.length);

// Detailed comparison
let allMatch = true;
for (const [id, node1] of graph1.nodes.entries()) {
  const node2 = graph2.nodes.get(id);
  if (!node2) {
    console.log(`   ❌ Node ${id} missing in second parse`);
    allMatch = false;
  } else if (node1.Dialogue !== node2.Dialogue) {
    console.log(`   ❌ Node ${id} dialogue mismatch`);
    allMatch = false;
  }
}

console.log('\n📋 RESULT:', allMatch ? '✅ Round-trip successful!' : '❌ Round-trip failed');

// Show exported JSON sample
console.log('\n📄 Sample exported node:');
console.log(JSON.stringify(exportedData[0], null, 2));
