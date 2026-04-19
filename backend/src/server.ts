/**
 * Main server file for Dialogue Graph Editor backend
 */

import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { GraphService } from './services/graph-service';
import { parseUnrealJSON } from './services/parser';
import { createApiRouter } from './routes/api';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize GraphService with sample data
const graphService = new GraphService();

// Load initial data from output.json if it exists
try {
  const jsonPath = path.join(__dirname, '../../output.json');
  if (fs.existsSync(jsonPath)) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const wrappedJson = '[' + jsonContent + ']';
    const initialData = JSON.parse(wrappedJson);
    const initialGraph = parseUnrealJSON(initialData);
    graphService.setGraph(initialGraph);
    console.log('✅ Loaded initial data:', initialGraph.nodes.size, 'nodes,', initialGraph.edges.length, 'edges');
  }
} catch (error) {
  console.log('⚠️  Could not load initial data:', error instanceof Error ? error.message : 'Unknown error');
}

// Routes
app.use('/api', createApiRouter(graphService));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dialogue Graph Editor API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Dialogue Graph Editor Backend');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API base URL: http://localhost:${PORT}/api\n`);
});

export default app;
