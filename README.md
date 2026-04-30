# cyber-core ApiServer

Small Python services that bridge Unreal Engine to a local MongoDB instance.

| File | Purpose |
|---|---|
| `mongo_server.py` | Flask REST API exposing generic CRUD on the `cyber-core` MongoDB database (port **3001**) |
| `setup_db.py` | One-shot script that creates the default game collections |
| `apimasterserver.py` | Standalone sensor data aggregator (port **8000**) — unrelated to MongoDB |
| `requirements.txt` | Python dependencies for the above |

---

## 1. Install Python requirements

From this directory:

```bash
pip install -r requirements.txt
```

This installs Flask, flask-cors, pymongo, and requests.

## 2. Start MongoDB in Docker

Run a local MongoDB 7 container, exposing the default port and persisting data
in a named volume so the database survives restarts:

```bash
docker run -d \
  --name cyber-core-mongo \
  -p 27017:27017 \
  -v cyber-core-mongo-data:/data/db \
  --restart unless-stopped \
  mongo:7
```

Check it is up:

```bash
docker ps --filter name=cyber-core-mongo
```

To stop / start later:

```bash
docker stop cyber-core-mongo
docker start cyber-core-mongo
```

## 3. Initialize the database

Creates the `cyber-core` database and the default collections
(`cg_levels`, `cg_players`, `cg_dialoguetrees`, `cg_quests`, `cg_apcs`,
`cg_tiles`). Safe to re-run.

```bash
python setup_db.py
```

## 4. Launch the API server

```bash
python mongo_server.py
```

You should see:

```
Connected to MongoDB: cyber-core
API server listening on http://localhost:3001
```

Health check:

```bash
curl http://localhost:3001/api/health
```

---

## REST API

All routes are scoped under `/api/<collection>`. The collection name is
whatever you pass — e.g. `cg_players`, `cg_levels`, `cg_quests`.

| Method | Path | Action |
|---|---|---|
| `GET`    | `/api/<collection>`         | List documents (query string is treated as an equality filter) |
| `GET`    | `/api/<collection>/<id>`    | Fetch one (matches `id` field or `_id` ObjectId) |
| `POST`   | `/api/<collection>`         | Insert one object or an array of objects |
| `PUT`    | `/api/<collection>/<id>`    | `$set` update by `id` or `_id` |
| `DELETE` | `/api/<collection>/<id>`    | Delete one |

`createdAt` is auto-stamped on insert; `updatedAt` is auto-stamped on update.

### curl examples

Insert a player:

```bash
curl -X POST http://localhost:3001/api/cg_players \
  -H "Content-Type: application/json" \
  -d '{"id":"player-1","name":"Indy","level":1,"xp":0}'
```

Bulk insert (array body):

```bash
curl -X POST http://localhost:3001/api/cg_quests \
  -H "Content-Type: application/json" \
  -d '[{"id":"q-001","title":"Find the locus"},{"id":"q-002","title":"Catalog the artifact"}]'
```

List all documents in a collection:

```bash
curl http://localhost:3001/api/cg_players
```

Filter by field (any query-string key becomes an equality filter):

```bash
curl "http://localhost:3001/api/cg_players?level=1"
```

Fetch one by `id`:

```bash
curl http://localhost:3001/api/cg_players/player-1
```

Fetch one by Mongo `_id` (24-char hex):

```bash
curl http://localhost:3001/api/cg_players/65f0a1b2c3d4e5f6a7b8c9d0
```

Update fields:

```bash
curl -X PUT http://localhost:3001/api/cg_players/player-1 \
  -H "Content-Type: application/json" \
  -d '{"level":2,"xp":150}'
```

Delete:

```bash
curl -X DELETE http://localhost:3001/api/cg_players/player-1
```

---

## Notes for Unreal

- The same routes are reachable from VaRest, `AWebUIDisplay`, or any
  `FHttpModule::Get().CreateRequest()` call.
- The server returns JSON bodies; `_id` fields are stringified, datetimes are
  ISO-8601, so VaRest's automatic parsing handles them without conversion.
- If MongoDB is offline, DB-backed routes return HTTP **503** but the server
  itself stays up — useful for development.

---

## Helpful tools

- **MongoDB Compass** — free GUI for browsing collections, running queries,
  and inspecting documents. Connect with the URI `mongodb://localhost:27017`
  and open the `cyber-core` database.
  Download: <https://www.mongodb.com/products/tools/compass>

---

## Extending the API with Claude Code

The generic CRUD routes cover most cases, but anything more involved
(aggregations, joins across collections, custom validation, batch
operations, indexes, schema-shaped endpoints) is easiest to add by asking
**Claude Code** from the **project main directory** (`C:\UnrealProjects\cyber-core`).
Running Claude from the repo root gives it access to `CLAUDE.md`, the
`ApiServer/` source, and the Unreal modules that consume these endpoints,
so it can wire both sides together in one pass.

Launch Claude from the project root:

```bash
cd C:\UnrealProjects\cyber-core
claude
```

### Prompt suggestions

Lead with the *intent* (what UE needs) and let Claude design the route.
A few patterns that work well:

- **Add a new endpoint, server-side only**
  > "Add a `GET /api/cg_quests/active` route to `ApiServer/mongo_server.py`
  > that returns all quests where `status == 'active'`, sorted by
  > `priority` descending."

- **Add an endpoint and the matching UE call**
  > "I need UE to fetch a player's current level data. Add a route to
  > `mongo_server.py` that joins `cg_players` and `cg_levels` on
  > `levelId`, and add a Blueprint-callable function in
  > `UWarehouseFunctionLibrary` that calls it with VaRest."

- **Bulk update from gameplay**
  > "Add a `POST /api/cg_players/<id>/award-xp` route that increments `xp`
  > atomically and returns the new total. Show me a curl example."

- **Indexes / performance**
  > "Add a startup hook to `mongo_server.py` that ensures an index on
  > `cg_tiles.coord` and `cg_dialoguetrees.npcId`."

- **Schema migration / new collection**
  > "Add a `cg_inventories` collection to `setup_db.py` and an endpoint
  > set for adding/removing items by player id."

- **Debugging an existing query**
  > "When I `PUT /api/cg_players/player-1` the `updatedAt` field is being
  > overwritten by the request body. Fix it so server-stamped fields win."

Tip: paste any failing `curl` output or UE log line directly into the
prompt — Claude will use it to locate the bug instead of guessing.
