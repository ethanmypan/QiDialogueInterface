/**
 * Validator module: Validates dialogue graph integrity
 */

import { DialogueGraph, ValidationResult } from '../types/dialogue';

/**
 * Validates a dialogue graph and returns errors and warnings
 * @param graph - The dialogue graph to validate
 * @returns ValidationResult with valid flag, errors, and warnings
 */
export function validateGraph(graph: DialogueGraph): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ========== Critical Validations (Errors) ==========

  // 1. Check for duplicate node IDs (shouldn't happen with Map, but check anyway)
  const nodeIds = Array.from(graph.nodes.keys());
  const uniqueIds = new Set(nodeIds);
  if (nodeIds.length !== uniqueIds.size) {
    errors.push('Duplicate node IDs detected');
  }

  // 2. Validate all edge references
  for (const edge of graph.edges) {
    // Check if source node exists
    if (!graph.nodes.has(edge.from)) {
      errors.push(`Edge references non-existent source node: "${edge.from}"`);
    }

    // Check if target node exists
    if (!graph.nodes.has(edge.to)) {
      errors.push(`Edge references non-existent target node: "${edge.to}"`);
    }
  }

  // 3. Check edge consistency with node data (givers and FollowUpID)
  for (const [nodeId, node] of graph.nodes.entries()) {
    if (node.DialogueInstance.length === 0) continue;

    const instance = node.DialogueInstance[0];

    // Check that all givers have corresponding choice edges
    for (const giverId of instance.givers) {
      if (giverId && giverId.trim() !== '') {
        const hasEdge = graph.edges.some(
          e => e.from === nodeId && e.to === giverId && e.type === 'choice'
        );
        if (!hasEdge) {
          errors.push(`Node "${nodeId}" has giver "${giverId}" but no corresponding choice edge`);
        }
      }
    }

    // Check that FollowUpID has corresponding followup edge
    if (instance.FollowUpID && instance.FollowUpID.trim() !== '') {
      const hasEdge = graph.edges.some(
        e => e.from === nodeId && e.to === instance.FollowUpID && e.type === 'followup'
      );
      if (!hasEdge) {
        errors.push(`Node "${nodeId}" has FollowUpID "${instance.FollowUpID}" but no corresponding followup edge`);
      }
    }
  }

  // ========== Warning Validations ==========

  // 1. Find orphaned nodes (empty DialogueInstance arrays)
  for (const [nodeId, node] of graph.nodes.entries()) {
    if (node.DialogueInstance.length === 0) {
      warnings.push(`Node "${nodeId}" has empty DialogueInstance array (orphaned)`);
    }
  }

  // 2. Find unreachable nodes (no incoming edges, excluding roots)
  const nodesWithIncoming = new Set(graph.edges.map(e => e.to));
  const rootNodes: string[] = [];

  for (const nodeId of graph.nodes.keys()) {
    if (!nodesWithIncoming.has(nodeId)) {
      rootNodes.push(nodeId);
    }
  }

  if (rootNodes.length === 0 && graph.nodes.size > 0) {
    warnings.push('No root nodes found (all nodes have incoming edges - possible cycle)');
  } else if (rootNodes.length > 1) {
    warnings.push(`Multiple root nodes found: ${rootNodes.join(', ')} (may be intentional for multiple dialogue trees)`);
  }

  // 3. Find dead-end nodes (non-terminal nodes with no outgoing edges)
  for (const [nodeId, node] of graph.nodes.entries()) {
    if (node.DialogueInstance.length === 0) continue;

    const instance = node.DialogueInstance[0];
    const isTerminal = instance.IsLastResponse;

    const hasOutgoingEdges = graph.edges.some(e => e.from === nodeId);

    if (!isTerminal && !hasOutgoingEdges) {
      warnings.push(`Node "${nodeId}" is non-terminal but has no outgoing edges (dead end)`);
    }
  }

  // 4. Find completely isolated nodes (no incoming or outgoing edges)
  const nodesWithOutgoing = new Set(graph.edges.map(e => e.from));

  for (const nodeId of graph.nodes.keys()) {
    const hasIncoming = nodesWithIncoming.has(nodeId);
    const hasOutgoing = nodesWithOutgoing.has(nodeId);

    if (!hasIncoming && !hasOutgoing) {
      warnings.push(`Node "${nodeId}" is completely isolated (no incoming or outgoing edges)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
