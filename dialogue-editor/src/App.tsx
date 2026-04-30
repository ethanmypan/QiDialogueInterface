import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { GraphView } from './components/GraphView';
import { Inspector } from './components/Inspector';
import { EditModal } from './components/EditModal';
import { api } from './services/api';
import { parseWithFix } from './utils/jsonFixer';
import type { DialogueNode, Edge } from './types';

function App() {
  const [nodes, setNodes] = useState<DialogueNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<DialogueNode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasLoadedFile, setHasLoadedFile] = useState(false);

  const loadGraph = async () => {
    try {
      const response = await api.getGraph();
      if (response.success && response.data) {
        setNodes(response.data.nodes);
        setEdges(response.data.edges);
        // If there's data, mark as loaded
        if (response.data.nodes.length > 0) {
          setHasLoadedFile(true);
        }
      }
    } catch (error) {
      console.error('Error loading graph:', error);
    }
  };

  // Load existing graph from database on component mount
  useEffect(() => {
    loadGraph();
  }, []);

  const handleFileLoad = async (data: any[]) => {
    try {
      const response = await api.importJSON(data);
      if (response.success) {
        await loadGraph();
        setHasLoadedFile(true);
      } else {
        alert(`Import failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      alert('Failed to import JSON');
    }
  };

  const handleNodeSelect = (node: DialogueNode) => {
    setSelectedNode(node);
  };

  const handleNodesChange = async (updatedNodes: DialogueNode[]) => {
    setNodes(updatedNodes);
    const changedNode = updatedNodes.find(n => {
      const original = nodes.find(orig => orig.ID === n.ID);
      return original && (original.x !== n.x || original.y !== n.y);
    });
    
    if (changedNode) {
      try {
        await api.updateNode(changedNode.ID, { x: changedNode.x, y: changedNode.y });
      } catch (error) {
        console.error('Error updating node position:', error);
      }
    }
  };

  const handleEdgesChange = async (updatedEdges: Edge[]) => {
    const newEdge = updatedEdges.find(e => 
      !edges.some(existing => existing.from === e.from && existing.to === e.to)
    );
    
    if (newEdge) {
      try {
        const response = await api.createEdge(newEdge);
        if (response.success) {
          await loadGraph();
        }
      } catch (error) {
        console.error('Error creating edge:', error);
      }
    }
  };

  const handleEditNode = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveNode = async (updatedNode: DialogueNode) => {
    try {
      const response = await api.updateNode(updatedNode.ID, updatedNode);
      if (response.success) {
        await loadGraph();
        setSelectedNode(updatedNode);
        setIsEditModalOpen(false);
      } else {
        alert(`Update failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error updating node:', error);
      alert('Failed to update node');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.export();
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dialogue-export.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const result = parseWithFix(content);

          // Show message if JSON was auto-fixed
          if (result.wasFixed) {
            console.log('✅ JSON Auto-Fixed:', result.message);
            alert(`📋 Note: ${result.message}\n\nThe file has been automatically corrected and loaded successfully.`);
          }

          const dialogues = Array.isArray(result.data) ? result.data : [result.data];
          handleFileLoad(dialogues);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert(`Invalid JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {!hasLoadedFile && <FileUpload onFileLoad={handleFileLoad} />}
      
      {hasLoadedFile && (
        <>
          <GraphView
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onImport={handleImport}
            onExport={handleExport}
          />
          <Inspector
            selectedNode={selectedNode}
            allNodes={nodes}
            onEdit={handleEditNode}
            onAddReply={() => {}}
          />
        </>
      )}

      {isEditModalOpen && (
        <EditModal
          node={selectedNode}
          allNodes={nodes}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveNode}
        />
      )}
    </div>
  );
}

export default App;
