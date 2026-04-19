# Dialogue Graph Editor - Backend API

Backend REST API for the Dialogue Graph Editor, built with Node.js, Express, and TypeScript.

## Features

- ✅ Parse Unreal Engine dialogue JSON format
- ✅ Convert to graph structure (nodes + edges)
- ✅ CRUD operations for nodes and edges
- ✅ Graph validation (errors & warnings)
- ✅ Export back to Unreal JSON format
- ✅ Round-trip support (import → edit → export)

## Installation

```bash
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── types/
│   │   └── dialogue.ts       # TypeScript interfaces
│   ├── services/
│   │   ├── parser.ts         # JSON → Graph parser
│   │   ├── graph-service.ts  # Graph CRUD operations
│   │   ├── validator.ts      # Graph validation
│   │   └── exporter.ts       # Graph → JSON exporter
│   ├── routes/
│   │   └── api.ts            # API route handlers
│   ├── middleware/
│   │   └── error-handler.ts  # Error handling
│   └── server.ts             # Main server entry point
├── dist/                     # Compiled JavaScript (generated)
└── package.json
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Dialogue Graph Editor API is running"
}
```

---

### Import Dialogue JSON
```
POST /api/import
```

Imports and parses Unreal dialogue JSON data.

**Request Body:** Array of Unreal dialogue nodes
```json
[
  {
    "ID": "Greeting1",
    "Dialogue": "Hello player!",
    "IsResponse": "false",
    "DialogueInstance": [
      {
        "QuestID": "0",
        "StageIndex": "0",
        "givers": ["GreetingRes1"],
        "FollowUpID": "",
        "IsLastResponse": "false",
        "SelectedReply": ""
      }
    ]
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "Imported 6 nodes and 2 edges",
  "data": {
    "nodeCount": 6,
    "edgeCount": 2
  }
}
```

---

### Get Full Graph
```
GET /api/graph
```

Returns the complete dialogue graph with nodes and edges.

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "ID": "Greeting1",
        "Dialogue": "Hello player!",
        "IsResponse": false,
        "DialogueInstance": [...]
      }
    ],
    "edges": [
      {
        "from": "Greeting1",
        "to": "GreetingRes1",
        "type": "choice"
      }
    ]
  }
}
```

---

### Create Node
```
POST /api/nodes
```

Creates a new dialogue node.

**Request Body:**
```json
{
  "ID": "NewNode1",
  "Dialogue": "This is a new dialogue line",
  "IsResponse": false,
  "DialogueInstance": [
    {
      "QuestID": "0",
      "StageIndex": "0",
      "givers": [],
      "FollowUpID": "",
      "IsLastResponse": false,
      "SelectedReply": ""
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Node \"NewNode1\" created",
  "data": { ... }
}
```

---

### Update Node
```
PUT /api/nodes/:id
```

Updates an existing node (partial update).

**Request Body:**
```json
{
  "Dialogue": "Updated dialogue text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Node \"NewNode1\" updated",
  "data": { ... }
}
```

---

### Delete Node
```
DELETE /api/nodes/:id
```

Deletes a node and all edges referencing it.

**Response:**
```json
{
  "success": true,
  "message": "Node \"NewNode1\" deleted"
}
```

---

### Create Edge
```
POST /api/edges
```

Creates an edge between two nodes.

**Request Body:**
```json
{
  "from": "Greeting1",
  "to": "GreetingRes1",
  "type": "choice"
}
```

Valid edge types: `"choice"` or `"followup"`

**Response:**
```json
{
  "success": true,
  "message": "Edge created from \"Greeting1\" to \"GreetingRes1\"",
  "data": { ... }
}
```

---

### Delete Edge
```
DELETE /api/edges/:from/:to
```

Deletes an edge between two nodes.

**Response:**
```json
{
  "success": true,
  "message": "Edge from \"Greeting1\" to \"GreetingRes1\" deleted"
}
```

---

### Validate Graph
```
GET /api/validate
```

Validates the dialogue graph and returns errors/warnings.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      "Multiple root nodes found: Greeting1, Joke1 (may be intentional)"
    ]
  }
}
```

**Validation Rules:**

**Errors (critical):**
- Duplicate node IDs
- Edge references non-existent nodes
- Edge/node data inconsistency

**Warnings:**
- Orphaned nodes (empty DialogueInstance)
- Unreachable nodes (no incoming edges)
- Dead-end nodes (no outgoing edges)
- Multiple root nodes

---

### Export to Unreal JSON
```
GET /api/export
```

Exports the graph back to Unreal JSON format.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Dialogue": "Hello player!",
      "ID": "Greeting1",
      "IsResponse": "false",
      "DialogueInstance": [
        {
          "QuestID": "0",
          "StageIndex": "0",
          "givers": ["GreetingRes1"],
          "FollowUpID": "",
          "IsLastResponse": "false",
          "SelectedReply": ""
        }
      ]
    }
  ]
}
```

---

## Data Structures

### Edge Types
- **`choice`**: Player dialogue option (multiple allowed)
- **`followup`**: Automatic continuation (single allowed)

### Node Fields
- `ID`: Unique identifier
- `Dialogue`: The dialogue text
- `IsResponse`: `true` if player response, `false` if NPC line
- `DialogueInstance`: Array of quest/stage metadata

### DialogueInstance Fields
- `QuestID`: Quest identifier
- `StageIndex`: Stage within quest
- `givers`: Array of node IDs for player choices
- `FollowUpID`: Single node ID for automatic followup
- `IsLastResponse`: Terminal node flag
- `SelectedReply`: Runtime field (empty in source)

---

## Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Get graph
curl http://localhost:3000/api/graph

# Validate graph
curl http://localhost:3000/api/validate

# Export graph
curl http://localhost:3000/api/export

# Create node
curl -X POST http://localhost:3000/api/nodes \
  -H "Content-Type: application/json" \
  -d @test-node.json

# Update node
curl -X PUT http://localhost:3000/api/nodes/NodeID \
  -H "Content-Type: application/json" \
  -d '{"Dialogue":"New text"}'

# Delete node
curl -X DELETE http://localhost:3000/api/nodes/NodeID

# Create edge
curl -X POST http://localhost:3000/api/edges \
  -H "Content-Type: application/json" \
  -d '{"from":"Node1","to":"Node2","type":"choice"}'

# Delete edge
curl -X DELETE http://localhost:3000/api/edges/Node1/Node2
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request (validation error)
- `500`: Server error

---

## Architecture Notes

### Parser Module
Converts Unreal JSON (with string booleans) to internal graph structure:
- Extracts nodes into a Map keyed by ID
- Builds edges from `givers[]` (choices) and `FollowUpID` (followup)

### Graph Service
In-memory graph management with CRUD operations:
- Singleton instance maintains current graph state
- Thread-safe for single-user editing sessions
- No database required (stateless per session)

### Exporter Module
Reverse transformation back to Unreal JSON:
- Converts boolean types back to strings
- Rebuilds `givers[]` and `FollowUpID` from edges
- Preserves all original fields for round-trip integrity

### Validator Module
Graph integrity checks:
- Validates node/edge references
- Detects structural issues
- Provides actionable warnings

---

## Development

### TypeScript Configuration
See `tsconfig.json` for compiler options.

### Hot Reload
Development server uses `nodemon` for automatic restarts on file changes.

### Build Output
Compiled JavaScript is output to `dist/` directory.

---

## Future Enhancements

- [ ] Persistent storage (database integration)
- [ ] Multi-user support with sessions
- [ ] Undo/redo functionality
- [ ] Graph diff and merge utilities
- [ ] Automated testing suite
- [ ] Authentication and authorization
- [ ] WebSocket support for real-time collaboration

---

## License

ISC
