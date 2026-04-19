# Dialogue Graph Editor - Frontend

React + TypeScript frontend for the Dialogue Graph Editor, integrated with the backend REST API.

## Features

- ✅ Visual dialogue graph editor with React Flow
- ✅ Drag-and-drop file upload
- ✅ Node editing with real-time backend sync
- ✅ Edge creation and management
- ✅ Export to Unreal JSON format
- ✅ Minimal white/black UI design

## Prerequisites

- Node.js 18.17.0+ (or compatible version)
- Backend server running on `http://localhost:3000`

## Installation

```bash
npm install
```

## Running the Frontend

### Development Mode
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Important: Backend Integration

**The frontend requires the backend server to be running!**

1. Start the backend server first:
```bash
cd ../backend
npm run dev
```

2. Then start the frontend:
```bash
npm run dev
```

The frontend communicates with the backend at `http://localhost:3000/api`

## Usage

1. **Load Dialogue JSON**
   - Drag and drop a JSON file or click "Browse Files"
   - The file will be uploaded to the backend for parsing

2. **View Graph**
   - Nodes appear as draggable boxes
   - Edges show connections between nodes
   - Animated edges = followup connections
   - Static edges = choice connections

3. **Edit Nodes**
   - Click a node to select it
   - View details in the right inspector panel
   - Click "Edit Details" to open the edit modal
   - Changes are saved to the backend

4. **Create Connections**
   - Drag from a node's bottom handle to another node's top handle
   - New edges are automatically saved to the backend

5. **Export**
   - Click "Export JSON" to download the current graph
   - The backend converts it back to Unreal JSON format

## Project Structure

```
src/
├── components/
│   ├── FileUpload.tsx      # File upload panel
│   ├── GraphView.tsx       # Main graph visualization
│   ├── DialogueNode.tsx    # Custom node component
│   ├── Inspector.tsx       # Node inspector panel
│   └── EditModal.tsx       # Node editing modal
├── services/
│   └── api.ts              # Backend API client
├── types.ts                # TypeScript type definitions
└── App.tsx                 # Main application
```

## API Integration

The frontend uses the following backend endpoints:

- `POST /api/import` - Import JSON file
- `GET /api/graph` - Get current graph
- `PUT /api/nodes/:id` - Update node
- `POST /api/edges` - Create edge
- `GET /api/export` - Export to JSON

See `src/services/api.ts` for the complete API client.

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 4** - Build tool (downgraded for Node 18 compatibility)
- **React Flow** - Graph visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Notes

- Vite was downgraded to v4.5.0 for Node.js 18.17.0 compatibility
- The `@tailwind` CSS warnings are expected and can be ignored
- All data is managed by the backend - the frontend is stateless
