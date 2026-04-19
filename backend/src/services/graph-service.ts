/**
 * Graph Service: Handles CRUD operations on dialogue graph
 */

import { DialogueGraph, DialogueNode, Edge } from '../types/dialogue';

export class GraphService {
  private graph: DialogueGraph;

  constructor(initialGraph?: DialogueGraph) {
    this.graph = initialGraph || { nodes: new Map(), edges: [] };
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
  setGraph(graph: DialogueGraph): void {
    this.graph = graph;
  }

  // ========== Node CRUD Operations ==========

  /**
   * Create a new node
   * @throws Error if node with same ID already exists
   */
  createNode(node: DialogueNode): void {
    if (this.graph.nodes.has(node.ID)) {
      throw new Error(`Node with ID "${node.ID}" already exists`);
    }
    this.graph.nodes.set(node.ID, node);
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
  updateNode(id: string, updates: Partial<Omit<DialogueNode, 'ID'>>): void {
    const node = this.graph.nodes.get(id);
    if (!node) {
      throw new Error(`Node with ID "${id}" not found`);
    }

    // Apply updates (excluding ID to prevent changing it)
    const updatedNode: DialogueNode = { ...node, ...updates, ID: id };
    this.graph.nodes.set(id, updatedNode);
  }

  /**
   * Delete a node and all edges referencing it
   */
  deleteNode(id: string): void {
    // Remove the node
    this.graph.nodes.delete(id);

    // Remove all edges referencing this node
    this.graph.edges = this.graph.edges.filter(
      edge => edge.from !== id && edge.to !== id
    );
  }

  // ========== Edge Operations ==========

  /**
   * Add an edge between two nodes
   * @throws Error if nodes don't exist or edge already exists
   */
  addEdge(edge: Edge): void {
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
  }

  /**
   * Remove an edge between two nodes
   */
  removeEdge(from: string, to: string): void {
    this.graph.edges = this.graph.edges.filter(
      edge => !(edge.from === from && edge.to === to)
    );
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
