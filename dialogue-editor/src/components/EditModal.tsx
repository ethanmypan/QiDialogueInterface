import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { DialogueNode } from '../types';

interface EditModalProps {
  node: DialogueNode | null;
  allNodes: DialogueNode[];
  onClose: () => void;
  onSave: (node: DialogueNode) => void;
}

export function EditModal({ node, allNodes, onClose, onSave }: EditModalProps) {
  const [editedNode, setEditedNode] = useState<DialogueNode | null>(node);
  const npcIds = ['Merchant1', 'Guard1', 'OldManNPC', 'YoungGirlNPC'];

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  if (!node || !editedNode) return null;

  const handleSave = () => {
    if (editedNode) {
      onSave(editedNode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <span className="text-sm">🔍</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Edit Dialogue Node</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Node ID:</label>
            <input
              type="text"
              value={editedNode.ID}
              onChange={(e) => setEditedNode({ ...editedNode, ID: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dialogue:</label>
            <textarea
              value={editedNode.Dialogue}
              onChange={(e) => setEditedNode({ ...editedNode, Dialogue: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NPC ID:</label>
            <select
              value=""
              onChange={(e) => {}}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select NPC</option>
              {npcIds.map((npcId) => (
                <option key={npcId} value={npcId}>
                  {npcId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up ID:</label>
            <select
              value={editedNode.DialogueInstance[0]?.FollowUpID || ''}
              onChange={(e) => {
                const updated = { ...editedNode };
                if (updated.DialogueInstance[0]) {
                  updated.DialogueInstance[0].FollowUpID = e.target.value;
                }
                setEditedNode(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {allNodes
                .filter((n) => n.ID !== editedNode.ID)
                .map((n) => (
                  <option key={n.ID} value={n.ID}>
                    {n.ID}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
              <Plus className="w-4 h-4" />
              Add Reply
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
