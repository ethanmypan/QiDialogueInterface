/**
 * Type definitions for the Dialogue Graph Editor
 * Based on Unreal Engine dialogue JSON format
 */

/**
 * DialogueInstance contains quest/stage-specific metadata for a dialogue node
 */
export interface DialogueInstance {
  QuestID: string;
  StageIndex: string;
  givers: string[];        // Array of node IDs for player choice options
  FollowUpID: string;      // Single node ID for automatic followup
  IsLastResponse: boolean;
  SelectedReply: string;   // Runtime field (empty in source files)
}

/**
 * DialogueNode represents a single line of dialogue with metadata
 */
export interface DialogueNode {
  ID: string;
  Dialogue: string;
  IsResponse: boolean;     // true if player response, false if NPC line
  DialogueInstance: DialogueInstance[];
  // Optional editor layout fields
  x?: number;
  y?: number;
}

/**
 * Edge types for dialogue graph
 */
export type EdgeType = "choice" | "followup";

/**
 * Edge represents a directed connection between two dialogue nodes
 */
export interface Edge {
  from: string;           // Source node ID
  to: string;             // Target node ID
  type: EdgeType;
  choiceText?: string;    // Optional text for choice edges
}

/**
 * DialogueGraph represents the complete graph structure
 */
export interface DialogueGraph {
  nodes: Map<string, DialogueNode>;
  edges: Edge[];
}

/**
 * ValidationResult contains the results of graph validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Raw Unreal JSON node format (with string booleans)
 */
export interface UnrealDialogueNode {
  ID: string;
  Dialogue: string;
  IsResponse: string;     // "true" or "false" as string
  DialogueInstance: UnrealDialogueInstance[];
}

/**
 * Raw Unreal JSON DialogueInstance format (with string booleans)
 */
export interface UnrealDialogueInstance {
  QuestID: string;
  StageIndex: string;
  givers: string[];
  FollowUpID: string;
  IsLastResponse: string; // "true" or "false" as string
  SelectedReply: string;
}
