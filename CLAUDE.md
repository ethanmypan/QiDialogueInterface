# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QiDialogueInterface is a dialogue graph editor for Unreal Engine dialogue JSON files. It consists of:
- **Backend**: Node.js/Express/TypeScript REST API for parsing, validating, and managing dialogue graphs
- **Frontend**: React/TypeScript visual editor using React Flow for graph visualization

The system handles a specific Unreal Engine JSON format where booleans are stored as strings ("true"/"false") and relationships are encoded in nested DialogueInstance objects.

## Development Commands

### Backend (port 3000)
```bash
cd backend
npm install          # Initial setup
npm run dev          # Development with hot reload (nodemon + ts-node)
npm run build        # Compile TypeScript to dist/
npm start            # Run production build
```

### Frontend (port 5173)
```bash
cd dialogue-editor
npm install          # Initial setup
npm run dev          # Development server (Vite)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Testing
```bash
# Manual API testing
curl http://localhost:3000/health
curl http://localhost:3000/api/graph
curl http://localhost:3000/api/validate
curl http://localhost:3000/api/export

# Backend test scripts (no test framework yet)
cd backend
ts-node src/test-parser.ts
ts-node src/test-roundtrip.ts
```

**Note:** Always start the backend before the frontend - the frontend depends on the backend API.

### MongoDB Setup
```bash
# 1. Get MongoDB connection string from your lab or MongoDB Atlas
# 2. Add to backend/.env file:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dialogue-editor

# 3. Start backend - it will automatically connect to MongoDB
cd backend
npm run dev
```

The system will:
- Automatically connect to MongoDB on startup
- Load existing graph from database (if available)
- Save all changes (imports, edits, deletes) to MongoDB in real-time
- Fallback to in-memory storage if MongoDB is not configured

## Architecture

### Data Flow
1. **Import**: Unreal JSON → Parser → Internal Graph (Map<ID, Node> + Edge[]) → MongoDB
2. **Edit**: Frontend ↔ Backend API (CRUD operations on graph) → MongoDB (auto-save)
3. **Export**: MongoDB/Memory → Internal Graph → Exporter → Unreal JSON

### Key Architectural Patterns

**String-to-Boolean Conversion**: The Unreal format uses string booleans (`"true"`/`"false"`). The parser converts these to actual booleans internally, and the exporter converts them back. This bidirectional conversion ensures round-trip integrity.

**Edge Reconstruction**: Edges are not explicit in the Unreal format. They're encoded in `DialogueInstance` objects:
- `givers[]` array → multiple "choice" edges (player dialogue options)
- `FollowUpID` string → single "followup" edge (automatic continuation)

The parser extracts edges from these fields, and the exporter rebuilds them from the edge list.

**MongoDB Persistence**: The backend uses a write-through cache pattern:
- In-memory Map for fast reads
- Automatic save to MongoDB on every write operation (import, create, update, delete)
- GraphService stores graphs with ID "default" (can be extended for multiple graphs)
- Database connection is optional - system falls back to in-memory storage if not configured

### Critical Files

**Backend Core Logic**:
- [backend/src/types/dialogue.ts](backend/src/types/dialogue.ts) - TypeScript interfaces for all data structures
- [backend/src/services/parser.ts](backend/src/services/parser.ts) - Unreal JSON → Graph conversion
- [backend/src/services/exporter.ts](backend/src/services/exporter.ts) - Graph → Unreal JSON conversion
- [backend/src/services/graph-service.ts](backend/src/services/graph-service.ts) - Graph CRUD operations with auto-save to DB
- [backend/src/services/database.service.ts](backend/src/services/database.service.ts) - MongoDB connection and persistence
- [backend/src/models/dialogue-graph.model.ts](backend/src/models/dialogue-graph.model.ts) - Mongoose schema for dialogue graphs
- [backend/src/services/validator.ts](backend/src/services/validator.ts) - Graph integrity validation
- [backend/src/routes/api.ts](backend/src/routes/api.ts) - REST API endpoints (all async)

**Frontend Components**:
- [dialogue-editor/src/App.tsx](dialogue-editor/src/App.tsx) - Main application state and coordination
- [dialogue-editor/src/components/GraphView.tsx](dialogue-editor/src/components/GraphView.tsx) - React Flow graph visualization
- [dialogue-editor/src/services/api.ts](dialogue-editor/src/services/api.ts) - Backend API client
- [dialogue-editor/src/utils/jsonFixer.ts](dialogue-editor/src/utils/jsonFixer.ts) - Auto-fixes malformed JSON (missing array brackets)

## Important Implementation Details

### Unreal JSON Format Quirks
- Booleans are strings: `"IsResponse": "true"` not `"IsResponse": true`
- Node relationships are implicit in `DialogueInstance` arrays
- Each node can have multiple `DialogueInstance` objects (quest/stage variations), but the current implementation only uses the first one

### Edge Types
- **choice**: Player dialogue option (multiple allowed per node, stored in `givers[]`)
- **followup**: Automatic continuation (single allowed per node, stored in `FollowUpID`)

### Validation Rules
**Errors** (critical):
- Duplicate node IDs
- Edges referencing non-existent nodes
- Edge/node data inconsistency

**Warnings** (informational):
- Orphaned nodes (empty `DialogueInstance`)
- Unreachable nodes (no incoming edges)
- Dead-end nodes (no outgoing edges)
- Multiple root nodes

### Frontend-Backend Integration
- Frontend is stateless - all data lives in the backend and MongoDB
- File upload triggers `POST /api/import` which parses, stores the graph, and saves to MongoDB
- Node edits immediately sync via `PUT /api/nodes/:id` and auto-save to MongoDB
- New edges immediately sync via `POST /api/edges` and auto-save to MongoDB
- Export fetches from `GET /api/export` and triggers browser download
- All mutations are async operations that persist to database

## Common Workflows

### Adding a New API Endpoint
1. Add async route handler in [backend/src/routes/api.ts](backend/src/routes/api.ts)
2. Add corresponding async method to [backend/src/services/graph-service.ts](backend/src/services/graph-service.ts) if needed
3. If the method modifies data, ensure it calls `await this.saveToDatabase()` at the end
4. Update [dialogue-editor/src/services/api.ts](dialogue-editor/src/services/api.ts) with client method
5. Wire up in [dialogue-editor/src/App.tsx](dialogue-editor/src/App.tsx) or relevant component

### Modifying Node Structure
1. Update interfaces in [backend/src/types/dialogue.ts](backend/src/types/dialogue.ts)
2. Update Mongoose schema in [backend/src/models/dialogue-graph.model.ts](backend/src/models/dialogue-graph.model.ts)
3. Update parser in [backend/src/services/parser.ts](backend/src/services/parser.ts)
4. Update exporter in [backend/src/services/exporter.ts](backend/src/services/exporter.ts)
5. Update frontend types in [dialogue-editor/src/types.ts](dialogue-editor/src/types.ts)
6. Update UI components as needed

### Testing Round-Trip Integrity
The system must preserve all data through import → edit → export cycles:
```bash
# 1. Import original file
# 2. Export to new file
# 3. Import exported file
# 4. Verify graphs are identical
```

Use [backend/src/test-roundtrip.ts](backend/src/test-roundtrip.ts) as a starting point for round-trip testing.

## Known Limitations

- Single-user only (no session management or multi-user support)
- Only uses first `DialogueInstance` per node (ignores quest/stage variations)
- No undo/redo functionality
- Frontend requires Node.js 18.17.0+ (Vite 4.5.0 compatibility)
- MongoDB connection is required for persistence (system works without it but data won't persist across restarts)
