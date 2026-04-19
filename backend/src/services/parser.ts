/**
 * Parser module: Converts Unreal JSON format to internal graph structure
 */

import {
  DialogueGraph,
  DialogueNode,
  Edge,
  UnrealDialogueNode,
  DialogueInstance,
  UnrealDialogueInstance
} from '../types/dialogue';

/**
 * Converts string boolean to actual boolean
 * @param value - "true" or "false" as string
 * @returns boolean value
 */
export function stringToBool(value: string): boolean {
  return value === "true";
}

/**
 * Converts Unreal DialogueInstance to internal format
 * @param unrealInstance - Raw Unreal DialogueInstance with string booleans
 * @returns DialogueInstance with proper boolean types
 */
function convertDialogueInstance(unrealInstance: UnrealDialogueInstance): DialogueInstance {
  return {
    QuestID: unrealInstance.QuestID,
    StageIndex: unrealInstance.StageIndex,
    givers: unrealInstance.givers,
    FollowUpID: unrealInstance.FollowUpID,
    IsLastResponse: stringToBool(unrealInstance.IsLastResponse),
    SelectedReply: unrealInstance.SelectedReply
  };
}

/**
 * Parses Unreal JSON array and builds a dialogue graph
 * @param jsonData - Array of Unreal dialogue nodes
 * @returns DialogueGraph with nodes Map and edges array
 */
export function parseUnrealJSON(jsonData: UnrealDialogueNode[]): DialogueGraph {
  const nodes = new Map<string, DialogueNode>();
  const edges: Edge[] = [];

  // First pass: Convert all nodes
  for (const unrealNode of jsonData) {
    const node: DialogueNode = {
      ID: unrealNode.ID,
      Dialogue: unrealNode.Dialogue,
      IsResponse: stringToBool(unrealNode.IsResponse),
      DialogueInstance: unrealNode.DialogueInstance.map(convertDialogueInstance)
    };

    nodes.set(node.ID, node);
  }

  // Second pass: Extract edges from DialogueInstance data
  for (const node of nodes.values()) {
    // Skip nodes with empty DialogueInstance arrays
    if (node.DialogueInstance.length === 0) {
      continue;
    }

    const instance = node.DialogueInstance[0]; // Use first DialogueInstance

    // Extract choice edges from givers array
    for (const giverID of instance.givers) {
      if (giverID && giverID.trim() !== "") {
        edges.push({
          from: node.ID,
          to: giverID,
          type: "choice"
        });
      }
    }

    // Extract followup edge from FollowUpID
    if (instance.FollowUpID && instance.FollowUpID.trim() !== "") {
      edges.push({
        from: node.ID,
        to: instance.FollowUpID,
        type: "followup"
      });
    }
  }

  return { nodes, edges };
}
