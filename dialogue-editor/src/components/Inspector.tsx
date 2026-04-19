import { Search, User, MessageSquare, Trash2 } from 'lucide-react';
import type { DialogueNode } from '../types';

interface InspectorProps {
  selectedNode: DialogueNode | null;
  allNodes: DialogueNode[];
  onEdit: () => void;
  onAddReply: () => void;
}

export function Inspector({ selectedNode, allNodes, onEdit, onAddReply }: InspectorProps) {
  const npcIds = ['Merchant1', 'Guard1', 'OldManNPC', 'YoungGirlNPC'];

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Select a Node</h2>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Nodes..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-gray-500">Select a node from the graph to view and edit its details.</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Select a Node</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Trash2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search Nodes..."
          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Inspector</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Node ID:</label>
              <div className="text-sm text-gray-900">{selectedNode.ID}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Dialogue:</label>
              <div className="text-sm text-gray-900">{selectedNode.Dialogue}</div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Possible NPC IDs</label>
              <div className="space-y-1">
                {npcIds.map((npcId) => (
                  <label key={npcId} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={false}
                      className="mr-2"
                      readOnly
                    />
                    <User className="w-3 h-3 mr-1" />
                    {npcId}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Follow Up:</label>
              <select
                value={selectedNode.DialogueInstance[0]?.FollowUpID || ''}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option value="">{selectedNode.DialogueInstance[0]?.FollowUpID || 'None'}</option>
              </select>
            </div>

            <button
              onClick={onAddReply}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <MessageSquare className="w-4 h-4" />
              Add Reply
            </button>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
        >
          Edit Details
        </button>
      </div>
    </div>
  );
}
