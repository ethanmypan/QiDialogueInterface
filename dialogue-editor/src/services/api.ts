import type { DialogueNode, Edge, DialogueGraph, ValidationResult, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  async importJSON(data: any[]): Promise<ApiResponse<{ nodeCount: number; edgeCount: number }>> {
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getGraph(): Promise<ApiResponse<DialogueGraph>> {
    const response = await fetch(`${API_BASE_URL}/graph`);
    return response.json();
  },

  async createNode(node: DialogueNode): Promise<ApiResponse<DialogueNode>> {
    const response = await fetch(`${API_BASE_URL}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node),
    });
    return response.json();
  },

  async updateNode(id: string, updates: Partial<DialogueNode>): Promise<ApiResponse<DialogueNode>> {
    const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async deleteNode(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async createEdge(edge: Edge): Promise<ApiResponse<Edge>> {
    const response = await fetch(`${API_BASE_URL}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edge),
    });
    return response.json();
  },

  async deleteEdge(from: string, to: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/edges/${from}/${to}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async validate(): Promise<ApiResponse<ValidationResult>> {
    const response = await fetch(`${API_BASE_URL}/validate`);
    return response.json();
  },

  async export(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/export`);
    return response.json();
  },
};
