import { Upload, AlertCircle } from 'lucide-react';
import { parseWithFix } from '../utils/jsonFixer';
import type { DialogueNode } from '../types';

interface FileUploadProps {
  onFileLoad: (data: DialogueNode[]) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = parseWithFix(content);

        // Show message if JSON was auto-fixed
        if (result.wasFixed) {
          console.log('✅ JSON Auto-Fixed:', result.message);
          // You could show a toast notification here
        }

        const dialogues = Array.isArray(result.data) ? result.data : [result.data];
        onFileLoad(dialogues);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert(`Invalid JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = parseWithFix(content);

          // Show message if JSON was auto-fixed
          if (result.wasFixed) {
            console.log('✅ JSON Auto-Fixed:', result.message);
          }

          const dialogues = Array.isArray(result.data) ? result.data : [result.data];
          onFileLoad(dialogues);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert(`Invalid JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Load Dialogue JSON</h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 text-center mb-2">Drop JSON File Here or</p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 inline-block">
            Browse Files...
          </span>
        </label>
      </div>
      
      <button className="mt-6 w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
        Load Dialogue
      </button>
    </div>
  );
}
