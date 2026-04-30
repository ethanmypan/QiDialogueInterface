# Docker MongoDB Setup Guide

This guide explains how to set up and use the Docker MongoDB container for the QiDialogueInterface project, which integrates with your professor's cyber-core API server.

## Overview

Both the QiDialogueInterface (visual editor) and the professor's APIServer (Unreal Engine interface) share the same MongoDB database:

- **Docker Container Name**: `cyber-core-mongo`
- **Database Name**: `cyber-core`
- **Collection Name**: `cg_dialoguetrees`
- **Port**: 27017 (MongoDB default)

## Prerequisites

1. **Install Docker Desktop**
   - macOS: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
   - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
   - Linux: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

2. **Verify Docker is running**
   ```bash
   docker --version
   ```

## Setup Instructions

### 1. Start MongoDB Container

Run this command to create and start the Docker MongoDB container:

```bash
docker run -d \
  --name cyber-core-mongo \
  -p 27017:27017 \
  -v cyber-core-mongo-data:/data/db \
  --restart unless-stopped \
  mongo:7
```

**What this does:**
- `-d`: Run in detached mode (background)
- `--name cyber-core-mongo`: Names the container
- `-p 27017:27017`: Maps port 27017 (host:container)
- `-v cyber-core-mongo-data:/data/db`: Persists data in a named volume
- `--restart unless-stopped`: Auto-restart container on system reboot
- `mongo:7`: Uses MongoDB version 7

### 2. Verify Container is Running

```bash
docker ps --filter name=cyber-core-mongo
```

You should see output like:
```
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                      NAMES
abc123def456   mongo:7   "docker-entrypoint.s…"   5 seconds ago   Up 4 seconds   0.0.0.0:27017->27017/tcp   cyber-core-mongo
```

### 3. Initialize Database Collections

From the main project directory, run the professor's setup script:

```bash
python setup_db.py
```

This creates the `cyber-core` database and the following collections:
- `cg_levels`
- `cg_players`
- `cg_dialoguetrees` ← **Used by QiDialogueInterface**
- `cg_quests`
- `cg_apcs`
- `cg_tiles`

## Managing the Container

### Start the Container
```bash
docker start cyber-core-mongo
```

### Stop the Container
```bash
docker stop cyber-core-mongo
```

### Check Container Status
```bash
docker ps --filter name=cyber-core-mongo
```

### View Container Logs
```bash
docker logs cyber-core-mongo
```

### Restart the Container
```bash
docker restart cyber-core-mongo
```

### Remove the Container (Warning: Deletes all data!)
```bash
docker stop cyber-core-mongo
docker rm cyber-core-mongo
```

To also remove the data volume:
```bash
docker volume rm cyber-core-mongo-data
```

## Connecting to MongoDB

### Connection String
The MongoDB connection string used by both systems:

```
mongodb://localhost:27017/cyber-core
```

This is already configured in:
- **QiDialogueInterface**: [backend/.env](backend/.env)
- **Professor's APIServer**: `mongo_server.py` (default)

### MongoDB Compass (GUI Tool)

1. **Download**: [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. **Connect**: Use URI `mongodb://localhost:27017`
3. **Navigate**: Go to `cyber-core` database → `cg_dialoguetrees` collection

This allows you to visually browse and inspect the dialogue data.

## Verifying Integration

### 1. Check Docker MongoDB is Running
```bash
docker ps --filter name=cyber-core-mongo
```

### 2. Start QiDialogueInterface Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
📂 Loaded graph "default" from MongoDB (X nodes, Y edges)
Server running on http://localhost:3000
```

### 3. Verify Collection Name
In MongoDB Compass, check that data is being stored in the `cg_dialoguetrees` collection, not `dialoguegraphs`.

## Architecture Diagram

```
┌─────────────────┐
│  Unreal Engine  │
└────────┬────────┘
         │ HTTP :3001
         │
         ▼
┌──────────────────────┐
│ Professor's APIServer│
│   (mongo_server.py)  │
└──────────┬───────────┘
           │
           │
┌──────────▼──────────────┐
│   Docker MongoDB        │
│   Container             │
│                         │
│   Name: cyber-core-mongo│◄────────┐
│   Database: cyber-core  │         │
│   Collection:           │         │
│   cg_dialoguetrees      │         │
└─────────────────────────┘         │
                                    │
                           ┌────────┴────────┐
                           │ QiDialogue      │
                           │ Interface       │
                           │ Backend :3000   │
                           └────────┬────────┘
                                    │
                           ┌────────▼────────┐
                           │ Frontend :5173  │
                           │ (Visual Editor) │
                           └─────────────────┘
```

## Troubleshooting

### Container won't start
```bash
# Check if port 27017 is already in use
lsof -i :27017

# If another MongoDB is running, stop it first
# Then start the Docker container
docker start cyber-core-mongo
```

### Cannot connect to MongoDB
```bash
# 1. Check container is running
docker ps --filter name=cyber-core-mongo

# 2. If not running, start it
docker start cyber-core-mongo

# 3. Check logs for errors
docker logs cyber-core-mongo

# 4. Verify backend .env file has correct connection string
cat backend/.env | grep MONGODB_URI
```

### Data persistence issues
The data is stored in a Docker volume. To check:
```bash
# List volumes
docker volume ls | grep cyber-core

# Inspect volume
docker volume inspect cyber-core-mongo-data
```

### Reset everything (Fresh start)
```bash
# Stop and remove container
docker stop cyber-core-mongo
docker rm cyber-core-mongo

# Remove data volume
docker volume rm cyber-core-mongo-data

# Recreate container (run the docker run command from step 1)
# Re-run setup_db.py to initialize collections
```

## Next Steps

1. **Start the services** in this order:
   ```bash
   # 1. Start Docker MongoDB
   docker start cyber-core-mongo

   # 2. Start QiDialogueInterface backend
   cd backend
   npm run dev

   # 3. Start QiDialogueInterface frontend
   cd dialogue-editor
   npm run dev
   ```

2. **Test the integration**:
   - Open http://localhost:5173 (visual editor)
   - Import a dialogue JSON file
   - Use MongoDB Compass to verify data is in `cyber-core.cg_dialoguetrees`
   - Later, test that Unreal Engine can access the same data via the APIServer

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/current/)
- [Professor's APIServer README](README.md)
