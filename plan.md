# plan.md — Dialogue Graph Editor (Unreal JSON Round-Trip)

## 1 What we’re building
A white/black minimal **Dialogue Graph Editor** for Unreal workflows.

**User flow**
1. Import (upload) a Dialogue JSON file
2. Tool parses JSON → builds a directed dialogue graph
3. Graph renders as draggable nodes + connectors
4. User edits node fields (Dialogue text, NPC ID, etc.)
5. User creates new nodes, connects nodes, adds choices
6. Tool validates graph integrity
7. Export JSON (same schema, round-trip)

**Key requirement**
- The editor must support **round-trip**: import → edit → export without breaking references.

---

## 2 Dialogue structure (how the dialogue is represented)
We will use a **directed graph** (not a strict tree), because:
- dialogues branch (choices)
- nodes can be reused (multiple parents)
- “jump” links are useful later

### 2.1 Core entities
#### Node (Dialogue Node)
A single line of dialogue with metadata.

Minimum fields:
- `ID` — unique node identifier (string)
- `Dialogue` — text shown/spoken (string)
- `NPCID` — who speaks this line (string; chosen from a dropdown registry)
- `IsResponse` — whether node is player response or NPC line (bool)
- `Links` — outgoing links to other nodes (edges)

Optional fields (future-proof):
- `QuestID`, `StageIndex`
- conditions (inventory checks, quest state gates)
- tags (emotion, camera, animation, audio cue)
- editor layout (`x`, `y`) for node placement

#### Edge (Link)
A directed connection from one node to the next.

Minimum fields:
- `from` (source node ID)
- `to` (target node ID)
- `type` ∈ {`followup`, `choice`}
- `choiceText` (only if `type=choice`)

### 2.2 “Graph, not nested JSON”
Even if the exported JSON is a flat list, the graph is defined by:
- nodes keyed by `ID`
- edges defined by references between IDs

**Why this is better**
- scalable and easy to edit visually
- easy to validate (missing IDs, cycles, duplicates)
- easy for Unreal runtime to traverse

---

## 3 JSON schema strategy (import/export)
We will support a **runtime JSON schema** and optionally an **editor metadata** schema.

### 3.1 Runtime JSON (recommended clean schema)
If you can control the schema, aim for something like this (flat list of nodes):

```json
[
  {
    "ID": "Greeting1",
    "NPCID": "Merchant1",
    "IsResponse": false,
    "Dialogue": "Hey, traveler.",
    "Links": [
      { "Type": "choice", "ChoiceText": "Hello!", "NextID": "GreetingRes1" },
      { "Type": "choice", "ChoiceText": "Who are you?", "NextID": "GreetingRes2" }
    ]
  },
  {
    "ID": "GreetingRes1",
    "NPCID": "Player",
    "IsResponse": true,
    "Dialogue": "Hello!",
    "Links": [
      { "Type": "followup", "NextID": "Greeting2" }
    ]
  }
]