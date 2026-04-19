import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { DialogueNode as DialogueNodeType } from '../types';

interface DialogueNodeProps {
  data: DialogueNodeType & { onSelect: (node: DialogueNodeType) => void };
  selected: boolean;
}

export const DialogueNode = memo(({ data, selected }: DialogueNodeProps) => {
  return (
    <div
      onClick={() => data.onSelect(data)}
      className={`bg-white border-2 rounded-lg p-3 min-w-[150px] max-w-[200px] cursor-pointer transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="text-xs font-semibold text-gray-900 mb-1">{data.ID}</div>
      <div className="text-sm text-gray-700 break-words">{data.Dialogue}</div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

DialogueNode.displayName = 'DialogueNode';
