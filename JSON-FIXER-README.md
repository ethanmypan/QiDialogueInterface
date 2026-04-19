# JSON Fixer for Dialogue Files

## The Problem

Unreal Engine dialogue export files sometimes have **malformed JSON** that's missing array brackets:

### ❌ Malformed (Missing Brackets)
```json
{"Dialogue":"Hello!","ID":"Node1",...},{"Dialogue":"Goodbye!","ID":"Node2",...}
```

### ✅ Valid JSON
```json
[{"Dialogue":"Hello!","ID":"Node1",...},{"Dialogue":"Goodbye!","ID":"Node2",...}]
```

---

## Solution: Automatic Fixing

We provide **two ways** to fix malformed JSON files:

### 1. Frontend Auto-Fix (Recommended) 🚀

**The dialogue editor automatically fixes JSON on upload!**

- Upload your malformed JSON file normally
- The app detects and fixes the format automatically
- You'll see a notification if the JSON was corrected
- No manual steps required!

**How it works:**
- Built-in `jsonFixer` utility in the frontend
- Runs on every file upload/import
- Handles both drag-drop and file browser uploads

**Files:**
- `dialogue-editor/src/utils/jsonFixer.ts` - Core fixer logic
- Updated in `FileUpload.tsx` and `App.tsx`

---

### 2. Python Script (Manual Fixing) 🐍

If you prefer to fix JSON files before uploading, use the Python script:

```bash
# Fix a file (overwrites original)
python3 fix-json.py output.json

# Fix a file (save to new file)
python3 fix-json.py input.json fixed-output.json
```

**Features:**
- Detects malformed JSON automatically
- Adds missing array brackets
- Pretty-prints the output
- Shows helpful messages

**Example Output:**
```
📖 Reading: output.json
📏 File size: 896 characters
🔧 Detected missing array brackets. Fixing...
✅ Successfully fixed JSON!
💾 Writing: output-fixed.json
✅ Done! Fixed JSON saved to: output-fixed.json
📊 Total objects: 6
```

---

## Testing

### Test the Python Script

```bash
# Fix the sample malformed file
python3 fix-json.py output.json output-fixed.json

# Verify the fixed file is valid JSON
python3 -m json.tool output-fixed.json > /dev/null && echo "✅ Valid JSON"
```

### Test the Frontend

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd dialogue-editor
   npm run dev
   ```

3. Upload `output.json` (the malformed file)
4. Check browser console for "✅ JSON Auto-Fixed" message
5. Verify the graph loads correctly

---

## Technical Details

### Frontend JSON Fixer

**Location:** `dialogue-editor/src/utils/jsonFixer.ts`

**Functions:**
- `fixJSONFormat(content: string): FixResult`
  - Attempts to fix malformed JSON
  - Returns metadata about what was fixed

- `parseWithFix(content: string): { data, wasFixed, message }`
  - Convenience wrapper that fixes AND parses
  - Used throughout the app

**Integration Points:**
1. `FileUpload.tsx` - Initial file upload screen
2. `App.tsx` - Re-import from graph view

### Python JSON Fixer

**Location:** `fix-json.py`

**Functions:**
- `fix_json_format(content: str) -> str`
  - Core fixing logic
  - Validates before and after

- `main()`
  - CLI interface
  - File I/O handling

---

## Edge Cases Handled

✅ Multiple objects without brackets: `{...},{...}` → `[{...},{...}]`
✅ Single object without brackets: `{...}` → `[{...}]`
✅ Already valid JSON: Returns as-is
✅ Clear error messages for unfixable JSON

---

## Supported Formats

### Will Auto-Fix ✅
- `{obj1},{obj2},{obj3}` → `[{obj1},{obj2},{obj3}]`
- `{obj1}` → `[{obj1}]`

### Already Valid ✅
- `[{obj1},{obj2}]` (no changes needed)
- `[{obj1}]` (no changes needed)

### Cannot Auto-Fix ❌
- Syntax errors inside objects (missing quotes, commas, etc.)
- Completely corrupted JSON
- Non-JSON content

---

## Why Two Solutions?

1. **Frontend (Automatic)** - Best UX, works seamlessly
2. **Python Script (Manual)** - Useful for:
   - Batch processing multiple files
   - Pre-processing before distribution
   - Debugging JSON issues
   - Working with the files directly

---

## Future Improvements

- [ ] Visual notification toast in frontend (instead of alert)
- [ ] Batch JSON fixer (process entire directories)
- [ ] More detailed error reporting
- [ ] Support for nested array issues
- [ ] JSON validation report before/after

---

## Questions?

Check the implementation files:
- Frontend: `dialogue-editor/src/utils/jsonFixer.ts`
- Python: `fix-json.py`
- Backend parser: `backend/src/services/parser.ts`
