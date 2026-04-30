/**
 * MongoDB model for DialogueGraph persistence
 */

import mongoose, { Schema, Document } from 'mongoose';
import { DialogueNode, Edge, DialogueInstance } from '../types/dialogue';

/**
 * MongoDB document interface for DialogueGraph
 */
export interface IDialogueGraphDocument extends Document {
  graphId: string;
  nodes: DialogueNode[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for DialogueInstance
 */
const DialogueInstanceSchema = new Schema<DialogueInstance>({
  QuestID: { type: String, required: true },
  StageIndex: { type: String, required: true },
  givers: { type: [String], required: true },
  FollowUpID: { type: String, required: true },
  IsLastResponse: { type: Boolean, required: true },
  SelectedReply: { type: String, required: true }
}, { _id: false });

/**
 * Schema for DialogueNode
 */
const DialogueNodeSchema = new Schema<DialogueNode>({
  ID: { type: String, required: true },
  Dialogue: { type: String, required: true },
  IsResponse: { type: Boolean, required: true },
  DialogueInstance: { type: [DialogueInstanceSchema], required: true },
  x: { type: Number },
  y: { type: Number }
}, { _id: false });

/**
 * Schema for Edge
 */
const EdgeSchema = new Schema<Edge>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  type: { type: String, enum: ['choice', 'followup'], required: true },
  choiceText: { type: String }
}, { _id: false });

/**
 * Main DialogueGraph schema
 */
const DialogueGraphSchema = new Schema<IDialogueGraphDocument>({
  graphId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nodes: {
    type: [DialogueNodeSchema],
    required: true,
    default: []
  },
  edges: {
    type: [EdgeSchema],
    required: true,
    default: []
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

/**
 * Export the model
 * Collection name: cg_dialoguetrees (shared with professor's APIServer)
 */
export const DialogueGraphModel = mongoose.model<IDialogueGraphDocument>(
  'cg_dialoguetrees',
  DialogueGraphSchema,
  'cg_dialoguetrees' // Explicit collection name to match professor's setup
);
