# Testing Guide - Dialogue Graph Editor

## Current Status: ✅ READY TO TEST

### Servers Running
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5173

---

## Quick Start Testing

### 1. Test with Malformed JSON (output.json)

The `output.json` file in the project root is **intentionally malformed** to test the JSON fixer.

**Steps:**
1. Open browser: http://localhost:5173
2. You'll see the file upload screen
3. Either:
   - **Drag & drop** `output.json` into the upload area, OR
   - Click **"Browse Files..."** and select `output.json`

**Expected Result:**
- ✅ Console message: "✅ JSON Auto-Fixed: Fixed: Added array brackets around multiple objects"
- ✅ Graph loads with 6 nodes visible
- ✅ 2 edges connecting nodes (Greeting1 → GreetingRes1 → Greeting2)

---

## Full Feature Testing Checklist

### ✅ JSON Auto-Fixing

#### Test 1: Malformed JSON Upload
- [x] Upload `output.json` (missing brackets)
- [ ] Verify console shows "JSON Auto-Fixed" message
- [ ] Verify graph loads successfully
- [ ] Verify 6 nodes appear

#### Test 2: Valid JSON Upload
- [ ] Upload `output-fixed.json` (already has brackets)
- [ ] Verify no "JSON Auto-Fixed" message
- [ ] Verify graph loads successfully

#### Test 3: Python Script
```bash
# Test the Python fixer
python3 fix-json.py output.json test-output.json
python3 -m json.tool test-output.json > /dev/null && echo "✅ Valid"
```

---

### ✅ Backend API Testing

#### Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","message":"Dialogue Graph Editor API is running"}`

#### Get Graph
```bash
curl http://localhost:3000/api/graph | python3 -m json.tool
```
Expected: JSON with `nodes` array and `edges` array

#### Validate Graph
```bash
curl http://localhost:3000/api/validate | python3 -m json.tool
```
Expected: `{"success":true,"data":{"valid":true,"errors":[],"warnings":[...]}}`

#### Export Graph
```bash
curl http://localhost:3000/api/export | python3 -m json.tool > exported.json
```
Expected: Valid Unreal JSON format (flat array)

---

### ✅ Frontend UI Testing

#### Graph View
- [ ] Upload file successfully
- [ ] See nodes rendered on canvas
- [ ] Nodes are draggable
- [ ] Edges connect nodes correctly
- [ ] Animated edges for "followup" type
- [ ] Static edges for "choice" type

#### Inspector Panel (Right Sidebar)
- [ ] Click a node in the graph
- [ ] Inspector shows node details:
  - [ ] Node ID
  - [ ] Dialogue text
  - [ ] Follow Up ID
  - [ ] NPC IDs checkboxes

#### Node Editing
- [ ] Select a node
- [ ] Click "Edit Details" button
- [ ] Modal opens
- [ ] Can edit dialogue text
- [ ] Can save changes
- [ ] Changes persist after refresh

#### Import/Export
- [ ] Click "Import JSON" in top toolbar
- [ ] Select a JSON file
- [ ] Verify auto-fix works
- [ ] Click "Export JSON" in top toolbar
- [ ] Verify download starts
- [ ] Open exported file, verify valid JSON

---

## Known Issues & Warnings

### Expected Warnings (Not Errors)

When you upload `output.json`, the validator will show these warnings:
```
⚠️  Warnings:
- Node "Joke1" has empty DialogueInstance array (orphaned)
- Node "Joke1Res1" has empty DialogueInstance array (orphaned)
- Node "Joke1Res2" has empty DialogueInstance array (orphaned)
- Multiple root nodes found: Greeting1, Joke1, Joke1Res1, Joke1Res2
- Node "Joke1" is completely isolated (no incoming or outgoing edges)
- Node "Joke1Res1" is completely isolated (no incoming or outgoing edges)
- Node "Joke1Res2" is completely isolated (no incoming or outgoing edges)
```

**This is normal** - the Joke nodes are incomplete/isolated in the sample data.

---

## Testing Round-Trip (Import → Edit → Export)

### Full Round-Trip Test

1. **Import** malformed `output.json`
   - Verify auto-fix message
   - Verify graph loads

2. **Edit** a node
   - Select "Greeting1" node
   - Click "Edit Details"
   - Change dialogue to "Hey there, traveler!"
   - Save

3. **Verify** edit persisted
   - Refresh page
   - Upload file again
   - Select "Greeting1"
   - Verify new text shows

4. **Export** the modified graph
   - Click "Export JSON"
   - Save as `modified.json`

5. **Re-import** the exported file
   - Upload `modified.json`
   - Verify edit is still there
   - Verify graph structure intact

**Success Criteria:**
- ✅ Exported JSON is valid (test with `python3 -m json.tool`)
- ✅ Exported JSON matches Unreal format
- ✅ Re-imported graph is identical
- ✅ Boolean strings preserved ("true"/"false")

---

## Performance Testing

### Load Testing
```bash
# Create a large test file (100+ nodes)
python3 << EOF
import json

nodes = []
for i in range(100):
    nodes.append({
        "ID": f"Node{i}",
        "Dialogue": f"Test dialogue {i}",
        "IsResponse": "false",
        "DialogueInstance": [{
            "QuestID": "0",
            "StageIndex": "0",
            "givers": [f"Node{i+1}"] if i < 99 else [],
            "FollowUpID": "",
            "IsLastResponse": "false" if i < 99 else "true",
            "SelectedReply": ""
        }]
    })

with open('large-test.json', 'w') as f:
    json.dump(nodes, f)
print("✅ Created large-test.json with 100 nodes")
EOF
```

Upload `large-test.json` and verify:
- [ ] Loads within 2 seconds
- [ ] Graph renders all nodes
- [ ] UI remains responsive
- [ ] Can drag nodes smoothly

---

## Browser Compatibility Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

**Check:**
- File upload works
- Graph rendering works
- Drag & drop works
- React Flow controls work

---

## Debugging Tips

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not, restart:
cd backend
npm run dev
```

### Frontend Not Loading
```bash
# Check console for errors
# Restart if needed:
cd dialogue-editor
npm run dev
```

### JSON Parse Errors
- Check browser console for detailed error messages
- The fixer should show exactly what went wrong
- Try the Python fixer first to debug:
  ```bash
  python3 fix-json.py your-file.json
  ```

### CORS Errors
- Ensure backend is running on port 3000
- Ensure frontend is running on port 5173
- Check `dialogue-editor/src/services/api.ts` - API_BASE_URL should be `http://localhost:3000/api`

---

## Success Criteria Summary

✅ **JSON Fixer Works**
- Automatically fixes malformed JSON
- Shows appropriate messages
- Both frontend and Python versions work

✅ **Backend API Works**
- All 10 endpoints respond correctly
- Validation detects issues
- Export produces valid Unreal JSON

✅ **Frontend UI Works**
- File upload accepts JSON
- Graph visualizes nodes and edges
- Inspector shows node details
- Editing persists changes

✅ **Round-Trip Works**
- Import → Edit → Export → Re-import
- Data integrity maintained
- No data loss

---

## Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Add more sample dialogue files** for testing
3. **Improve UI/UX** based on feedback
4. **Add features:**
   - Add new nodes via UI
   - Delete nodes/edges
   - Search functionality
   - Validation display in UI
   - Undo/redo
5. **Deploy** to production

---

## Questions or Issues?

1. Check [JSON-FIXER-README.md](JSON-FIXER-README.md) for JSON issues
2. Check [BACKEND_COMPLETE.md](BACKEND_COMPLETE.md) for API details
3. Check [backend/README.md](backend/README.md) for API docs
4. Check browser console for error messages
5. Check backend terminal for API errors
