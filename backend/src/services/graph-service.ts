/**
 * Graph Service: Handles CRUD operations on dialogue graph
 */

import { DialogueGraph, DialogueNode, Edge } from '../types/dialogue';
import { databaseService } from './database.service';

export class GraphService {
  private graph: DialogueGraph;
  private graphId: string;

  constructor(graphId: string = 'default', initialGraph?: DialogueGraph) {
    this.graphId = graphId;
    this.graph = initialGraph || { nodes: new Map(), edges: [] };
  }

  /**
   * Load graph from database
   */
  async loadFromDatabase(): Promise<void> {
    const loadedGraph = await databaseService.loadGraph(this.graphId);
    if (loadedGraph) {
      this.graph = loadedGraph;
    }
  }

  /**
   * Save current graph to database
   */
  private async saveToDatabase(): Promise<void> {
    await databaseService.saveGraph(this.graphId, this.graph);
  }

  /**
   * Get the entire graph
   */
  getGraph(): DialogueGraph {
    return this.graph;
  }

  /**
   * Replace the entire graph
   */
  async setGraph(graph: DialogueGraph): Promise<void> {
    this.graph = graph;
    await this.saveToDatabase();
  }

  // ========== Node CRUD Operations ==========

  /**
   * Create a new node
   * @throws Error if node with same ID already exists
   */
  async createNode(node: DialogueNode): Promise<void> {
    if (this.graph.nodes.has(node.ID)) {
      throw new Error(`Node with ID "${node.ID}" already exists`);
    }
    this.graph.nodes.set(node.ID, node);
    await this.saveToDatabase();
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): DialogueNode | undefined {
    return this.graph.nodes.get(id);
  }

  /**
   * Get all nodes as an array
   */
  getAllNodes(): DialogueNode[] {
    return Array.from(this.graph.nodes.values());
  }

  /**
   * Update a node (partial update)
   * @throws Error if node doesn't exist
   */
  async updateNode(id: string, updates: Partial<Omit<DialogueNode, 'ID'>>): Promise<void> {
    const node = this.graph.nodes.get(id);
    if (!node) {
      throw new Error(`Node with ID "${id}" not found`);
    }

    // Apply updates (excluding ID to prevent changing it)
    const updatedNode: DialogueNode = { ...node, ...updates, ID: id };
    this.graph.nodes.set(id, updatedNode);
    await this.saveToDatabase();
  }

  /**
   * Delete a node and all edges referencing it
   */
  async deleteNode(id: string): Promise<void> {
    // Remove the node
    this.graph.nodes.delete(id);

    // Remove all edges referencing this node
    this.graph.edges = this.graph.edges.filter(
      edge => edge.from !== id && edge.to !== id
    );
    await this.saveToDatabase();
  }

  // ========== Edge Operations ==========

  /**
   * Add an edge between two nodes
   * @throws Error if nodes don't exist or edge already exists
   */
  async addEdge(edge: Edge): Promise<void> {
    // Validate that both nodes exist
    if (!this.graph.nodes.has(edge.from)) {
      throw new Error(`Source node "${edge.from}" does not exist`);
    }
    if (!this.graph.nodes.has(edge.to)) {
      throw new Error(`Target node "${edge.to}" does not exist`);
    }

    // Check for duplicate edges
    const duplicate = this.graph.edges.find(
      e => e.from === edge.from && e.to === edge.to && e.type === edge.type
    );
    if (duplicate) {
      throw new Error(`Edge from "${edge.from}" to "${edge.to}" with type "${edge.type}" already exists`);
    }

    this.graph.edges.push(edge);
    await this.saveToDatabase();
  }

  /**
   * Remove an edge between two nodes
   */
  async removeEdge(from: string, to: string): Promise<void> {
    this.graph.edges = this.graph.edges.filter(
      edge => !(edge.from === from && edge.to === to)
    );
    await this.saveToDatabase();
  }

  /**
   * Get all outgoing edges from a node
   */
  getOutgoingEdges(nodeId: string): Edge[] {
    return this.graph.edges.filter(edge => edge.from === nodeId);
  }

  /**
   * Get all incoming edges to a node
   */
  getIncomingEdges(nodeId: string): Edge[] {
    return this.graph.edges.filter(edge => edge.to === nodeId);
  }

  /**
   * Get root nodes (nodes with no incoming edges)
   */
  getRootNodes(): string[] {
    const nodesWithIncoming = new Set(this.graph.edges.map(e => e.to));
    const rootNodes: string[] = [];

    for (const nodeId of this.graph.nodes.keys()) {
      if (!nodesWithIncoming.has(nodeId)) {
        rootNodes.push(nodeId);
      }
    }

    return rootNodes;
  }
}
