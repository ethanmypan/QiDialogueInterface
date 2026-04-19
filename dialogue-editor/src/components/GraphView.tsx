import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge as ReactFlowEdge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, Search, Plus, User, MessageSquare, Grid, ZoomIn, RotateCcw } from 'lucide-react';
import { DialogueNode } from './DialogueNode';
import type { DialogueNode as DialogueNodeType, Edge } from '../types';

interface GraphViewProps {
  nodes: DialogueNodeType[];
  edges: Edge[];
  selectedNode: DialogueNodeType | null;
  onNodeSelect: (node: DialogueNodeType) => void;
  onNodesChange: (nodes: DialogueNodeType[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onImport: () => void;
  onExport: () => void;
}

const nodeTypes = {
  dialogueNode: DialogueNode,
};

export function GraphView({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onNodesChange,
  onEdgesChange,
  onImport,
  onExport,
}: GraphViewProps) {
  const reactFlowNodes: Node[] = useMemo(
    () =>
      nodes.map((node, index) => ({
        id: node.ID,
        type: 'dialogueNode',
        position: node.x !== undefined && node.y !== undefined 
          ? { x: node.x, y: node.y } 
          : { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 150 },
        data: { ...node, onSelect: onNodeSelect },
        selected: selectedNode?.ID === node.ID,
      })),
    [nodes, selectedNode, onNodeSelect]
  );

  const reactFlowEdges: ReactFlowEdge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: `${edge.from}->${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: edge.type === 'followup',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label: edge.type === 'choice' ? edge.choiceText : undefined,
      })),
    [edges]
  );

  const [rfNodes, setRfNodes, onRfNodesChange] = useNodesState(reactFlowNodes);
  const [rfEdges, setRfEdges, onRfEdgesChange] = useEdgesState(reactFlowEdges);

  useEffect(() => {
    setRfNodes(reactFlowNodes);
  }, [reactFlowNodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(reactFlowEdges);
  }, [reactFlowEdges, setRfEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        from: connection.source!,
        to: connection.target!,
        type: 'followup',
      };
      onEdgesChange([...edges, newEdge]);
      setRfEdges((eds) => addEdge(connection, eds));
    },
    [edges, onEdgesChange, setRfEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const updatedNodes = nodes.map((n) =>
        n.ID === node.id ? { ...n, x: node.position.x, y: node.position.y } : n
      );
      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange]
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dialogue Graph View</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            <Upload className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-3">
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Add Node">
          <Plus className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Add NPC">
          <User className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Add Response">
          <MessageSquare className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Grid">
          <Grid className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Zoom">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Node..."
            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onRfNodesChange}
          onEdgesChange={onRfEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
