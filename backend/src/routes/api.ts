/**
 * API Routes for Dialogue Graph Editor
 */

import { Router, Request, Response } from 'express';
import { GraphService } from '../services/graph-service';
import { parseUnrealJSON } from '../services/parser';
import { exportToUnrealJSON } from '../services/exporter';
import { validateGraph } from '../services/validator';
import { DialogueNode, Edge } from '../types/dialogue';

export function createApiRouter(graphService: GraphService): Router {
  const router = Router();

  /**
   * POST /api/import
   * Import and parse Unreal JSON dialogue data
   */
  router.post('/import', async (req: Request, res: Response) => {
    try {
      const jsonData = req.body;

      if (!Array.isArray(jsonData)) {
        return res.status(400).json({
          success: false,
          error: 'Expected JSON array of dialogue nodes'
        });
      }

      const graph = parseUnrealJSON(jsonData);
      await graphService.setGraph(graph);

      res.json({
        success: true,
        message: `Imported ${graph.nodes.size} nodes and ${graph.edges.length} edges`,
        data: {
          nodeCount: graph.nodes.size,
          edgeCount: graph.edges.length
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/graph
   * Get the full dialogue graph
   */
  router.get('/graph', (req: Request, res: Response) => {
    try {
      const graph = graphService.getGraph();

      res.json({
        success: true,
        data: {
          nodes: Array.from(graph.nodes.values()),
          edges: graph.edges
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/nodes
   * Create a new dialogue node
   */
  router.post('/nodes', async (req: Request, res: Response) => {
    try {
      const node: DialogueNode = req.body;

      if (!node.ID || !node.Dialogue) {
        return res.status(400).json({
          success: false,
          error: 'Node must have ID and Dialogue fields'
        });
      }

      await graphService.createNode(node);

      res.json({
        success: true,
        message: `Node "${node.ID}" created`,
        data: node
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * PUT /api/nodes/:id
   * Update an existing dialogue node
   */
  router.put('/nodes/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      await graphService.updateNode(id, updates);

      const updatedNode = graphService.getNode(id);

      res.json({
        success: true,
        message: `Node "${id}" updated`,
        data: updatedNode
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * DELETE /api/nodes/:id
   * Delete a dialogue node and all its edges
   */
  router.delete('/nodes/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;

      await graphService.deleteNode(id);

      res.json({
        success: true,
        message: `Node "${id}" deleted`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/edges
   * Create an edge between two nodes
   */
  router.post('/edges', async (req: Request, res: Response) => {
    try {
      const edge: Edge = req.body;

      if (!edge.from || !edge.to || !edge.type) {
        return res.status(400).json({
          success: false,
          error: 'Edge must have from, to, and type fields'
        });
      }

      if (edge.type !== 'choice' && edge.type !== 'followup') {
        return res.status(400).json({
          success: false,
          error: 'Edge type must be "choice" or "followup"'
        });
      }

      await graphService.addEdge(edge);

      res.json({
        success: true,
        message: `Edge created from "${edge.from}" to "${edge.to}"`,
        data: edge
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * DELETE /api/edges/:from/:to
   * Delete an edge between two nodes
   */
  router.delete('/edges/:from/:to', async (req: Request, res: Response) => {
    try {
      const from = req.params.from as string;
      const to = req.params.to as string;

      await graphService.removeEdge(from, to);

      res.json({
        success: true,
        message: `Edge from "${from}" to "${to}" deleted`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/validate
   * Validate the dialogue graph
   */
  router.get('/validate', (req: Request, res: Response) => {
    try {
      const graph = graphService.getGraph();
      const validation = validateGraph(graph);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/export
   * Export the dialogue graph to Unreal JSON format
   */
  router.get('/export', (req: Request, res: Response) => {
    try {
      const graph = graphService.getGraph();
      const unrealJson = exportToUnrealJSON(graph);

      res.json({
        success: true,
        data: unrealJson
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
