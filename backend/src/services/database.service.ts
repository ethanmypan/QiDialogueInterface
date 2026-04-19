/**
 * Database Service: Handles MongoDB connection and graph persistence
 */

import mongoose from 'mongoose';
import { DialogueGraph } from '../types/dialogue';
import { DialogueGraphModel, IDialogueGraphDocument } from '../models/dialogue-graph.model';

export class DatabaseService {
  private isConnected: boolean = false;

  /**
   * Connect to MongoDB
   * @param uri - MongoDB connection string from environment variable
   */
  async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      this.isConnected = false;
      console.error('❌ MongoDB connection error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Convert DialogueGraph (with Map) to array format for MongoDB
   */
  private graphToDocument(graphId: string, graph: DialogueGraph): Partial<IDialogueGraphDocument> {
    return {
      graphId,
      nodes: Array.from(graph.nodes.values()),
      edges: graph.edges
    };
  }

  /**
   * Convert MongoDB document back to DialogueGraph (with Map)
   */
  private documentToGraph(doc: IDialogueGraphDocument): DialogueGraph {
    const nodesMap = new Map();
    for (const node of doc.nodes) {
      nodesMap.set(node.ID, node);
    }
    return {
      nodes: nodesMap,
      edges: doc.edges
    };
  }

  /**
   * Save or update a dialogue graph
   * @param graphId - Unique identifier for the graph
   * @param graph - The dialogue graph to save
   */
  async saveGraph(graphId: string, graph: DialogueGraph): Promise<void> {
    if (!this.isReady()) {
      console.warn('⚠️  MongoDB not connected, skipping save');
      return;
    }

    try {
      const docData = this.graphToDocument(graphId, graph);

      await DialogueGraphModel.findOneAndUpdate(
        { graphId },
        docData,
        { upsert: true, new: true }
      );

      console.log(`💾 Saved graph "${graphId}" to MongoDB (${graph.nodes.size} nodes, ${graph.edges.length} edges)`);
    } catch (error) {
      console.error('❌ Error saving graph to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Load a dialogue graph from database
   * @param graphId - Unique identifier for the graph
   * @returns The dialogue graph, or null if not found
   */
  async loadGraph(graphId: string): Promise<DialogueGraph | null> {
    if (!this.isReady()) {
      console.warn('⚠️  MongoDB not connected, cannot load graph');
      return null;
    }

    try {
      const doc = await DialogueGraphModel.findOne({ graphId });

      if (!doc) {
        console.log(`📭 No graph found with ID "${graphId}"`);
        return null;
      }

      const graph = this.documentToGraph(doc);
      console.log(`📂 Loaded graph "${graphId}" from MongoDB (${graph.nodes.size} nodes, ${graph.edges.length} edges)`);
      return graph;
    } catch (error) {
      console.error('❌ Error loading graph from MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Delete a dialogue graph
   * @param graphId - Unique identifier for the graph
   */
  async deleteGraph(graphId: string): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('⚠️  MongoDB not connected, cannot delete graph');
      return false;
    }

    try {
      const result = await DialogueGraphModel.deleteOne({ graphId });

      if (result.deletedCount > 0) {
        console.log(`🗑️  Deleted graph "${graphId}" from MongoDB`);
        return true;
      } else {
        console.log(`📭 No graph found with ID "${graphId}" to delete`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting graph from MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Get all graph IDs
   */
  async listGraphs(): Promise<string[]> {
    if (!this.isReady()) {
      console.warn('⚠️  MongoDB not connected, cannot list graphs');
      return [];
    }

    try {
      const docs = await DialogueGraphModel.find({}, 'graphId');
      return docs.map(doc => doc.graphId);
    } catch (error) {
      console.error('❌ Error listing graphs from MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('👋 Disconnected from MongoDB');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
