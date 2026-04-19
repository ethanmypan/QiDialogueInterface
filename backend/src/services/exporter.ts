/**
 * Exporter module: Converts internal graph structure back to Unreal JSON format
 */

import {
  DialogueGraph,
  UnrealDialogueNode,
  UnrealDialogueInstance,
  DialogueInstance
} from '../types/dialogue';

/**
 * Converts boolean to string format for Unreal
 * @param value - boolean value
 * @returns "true" or "false" as string
 */
function boolToString(value: boolean): string {
  return value ? "true" : "false";
}

/**
 * Converts internal DialogueInstance to Unreal format
 * @param instance - DialogueInstance with boolean types
 * @returns UnrealDialogueInstance with string booleans
 */
function convertToUnrealInstance(instance: DialogueInstance): UnrealDialogueInstance {
  return {
    QuestID: instance.QuestID,
    StageIndex: instance.StageIndex,
    givers: instance.givers,
    FollowUpID: instance.FollowUpID,
    IsLastResponse: boolToString(instance.IsLastResponse),
    SelectedReply: instance.SelectedReply
  };
}

/**
 * Exports dialogue graph back to Unreal JSON format
 * Rebuilds givers[] and FollowUpID from edges
 * @param graph - The dialogue graph to export
 * @returns Array of Unreal dialogue nodes
 */
export function exportToUnrealJSON(graph: DialogueGraph): UnrealDialogueNode[] {
  const unrealNodes: UnrealDialogueNode[] = [];

  for (const [nodeId, node] of graph.nodes.entries()) {
    // Clone the node to avoid mutation
    const unrealNode: UnrealDialogueNode = {
      Dialogue: node.Dialogue,
      ID: node.ID,
      IsResponse: boolToString(node.IsResponse),
      DialogueInstance: node.DialogueInstance.map(instance => {
        // Convert the instance
        const unrealInstance = convertToUnrealInstance(instance);

        // Rebuild givers[] from choice edges
        const choiceEdges = graph.edges.filter(
          e => e.from === nodeId && e.type === 'choice'
        );
        unrealInstance.givers = choiceEdges.map(e => e.to);

        // Rebuild FollowUpID from followup edge
        const followupEdge = graph.edges.find(
          e => e.from === nodeId && e.type === 'followup'
        );
        unrealInstance.FollowUpID = followupEdge ? followupEdge.to : "";

        return unrealInstance;
      })
    };

    unrealNodes.push(unrealNode);
  }

  return unrealNodes;
}
