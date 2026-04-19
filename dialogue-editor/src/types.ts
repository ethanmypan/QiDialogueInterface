export interface DialogueInstance {
  QuestID: string;
  StageIndex: string;
  givers: string[];
  FollowUpID: string;
  IsLastResponse: boolean;
  SelectedReply: string;
}

export interface DialogueNode {
  ID: string;
  Dialogue: string;
  IsResponse: boolean;
  DialogueInstance: DialogueInstance[];
  x?: number;
  y?: number;
}

export type EdgeType = 'choice' | 'followup';

export interface Edge {
  from: string;
  to: string;
  type: EdgeType;
  choiceText?: string;
}

export interface DialogueGraph {
  nodes: DialogueNode[];
  edges: Edge[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
