/**
 * Main server file for Dialogue Graph Editor backend
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { GraphService } from './services/graph-service';
import { parseUnrealJSON } from './services/parser';
import { createApiRouter } from './routes/api';
import { errorHandler } from './middleware/error-handler';
import { databaseService } from './services/database.service';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize GraphService
const graphService = new GraphService('default');

/**
 * Initialize database connection and load graph
 */
async function initializeServer() {
  // Connect to MongoDB if URI is provided
  if (MONGODB_URI) {
    try {
      await databaseService.connect(MONGODB_URI);

      // Try to load graph from database
      await graphService.loadFromDatabase();
      const graph = graphService.getGraph();

      if (graph.nodes.size > 0) {
        console.log(`📂 Loaded graph from MongoDB: ${graph.nodes.size} nodes, ${graph.edges.length} edges`);
      } else {
        console.log('📭 No existing graph in MongoDB, starting with empty graph');
      }
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      console.log('⚠️  Continuing without database persistence');
    }
  } else {
    console.log('⚠️  No MONGODB_URI provided, running without database persistence');
    console.log('💡 Add MONGODB_URI to .env file to enable MongoDB storage');
  }

  // Fallback: Load initial data from output.json if graph is empty
  const graph = graphService.getGraph();
  if (graph.nodes.size === 0) {
    try {
      const jsonPath = path.join(__dirname, '../../output.json');
      if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const wrappedJson = '[' + jsonContent + ']';
        const initialData = JSON.parse(wrappedJson);
        const initialGraph = parseUnrealJSON(initialData);
        await graphService.setGraph(initialGraph);
        console.log('✅ Loaded initial data from file:', initialGraph.nodes.size, 'nodes,', initialGraph.edges.length, 'edges');
      }
    } catch (error) {
      console.log('⚠️  Could not load initial data from file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// Routes
app.use('/api', createApiRouter(graphService));

// Health check endpoint (includes MongoDB status)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dialogue Graph Editor API is running',
    database: databaseService.isReady() ? 'connected' : 'disconnected'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
initializeServer().then(() => {
  app.listen(PORT, () => {
    console.log('\n🚀 Dialogue Graph Editor Backend');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API base URL: http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: ${databaseService.isReady() ? 'Connected ✅' : 'Not connected ⚠️'}\n`);
  });
}).catch(error => {
  console.error('❌ Failed to initialize server:', error);
  process.exit(1);
});

export default app;
