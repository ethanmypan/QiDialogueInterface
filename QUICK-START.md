# Quick Start Guide 🚀

## TL;DR - Get Started in 30 Seconds

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd dialogue-editor
npm run dev

# Browser
# Open: http://localhost:5173
# Upload: output.json
# Done! ✅
```

---

## Servers Currently Running ✅

- **Backend:** http://localhost:3000 (API)
- **Frontend:** http://localhost:5173 (UI)

**Both are ready to test right now!**

---

## The JSON Problem & Solution

### Problem
Your `output.json` is missing array brackets:
```json
{"ID":"Node1",...},{"ID":"Node2",...}  ❌ Invalid
```

### Solution (Automatic)
Just upload it! The app fixes it automatically:
```json
[{"ID":"Node1",...},{"ID":"Node2",...}]  ✅ Fixed
```

---

## Test It Now

1. **Open:** http://localhost:5173
2. **Upload:** `output.json` (the malformed file)
3. **See:** Console message "✅ JSON Auto-Fixed"
4. **Result:** Graph with 6 nodes appears

---

## Commands

### Python JSON Fixer (Optional)
```bash
python3 fix-json.py input.json output.json
```

### Backend API Test
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/graph
curl http://localhost:3000/api/validate
```

### Stop Servers
```
Ctrl+C in each terminal
```

---

## Files You Need to Know

### Upload These
- `output.json` - Test the auto-fixer
- `output-fixed.json` - Test with valid JSON

### Read These
- [TESTING-GUIDE.md](TESTING-GUIDE.md) - Full testing instructions
- [JSON-FIXER-README.md](JSON-FIXER-README.md) - How the fixer works
- [IMPLEMENTATION-COMPLETE.md](IMPLEMENTATION-COMPLETE.md) - Complete overview

---

## Common Issues

### "Cannot connect to backend"
```bash
cd backend
npm run dev
```

### "File won't upload"
- Check browser console for errors
- Try the Python fixer first:
  ```bash
  python3 fix-json.py your-file.json fixed.json
  ```

### "Graph not showing"
- Refresh page
- Check if nodes have x/y coordinates
- Try uploading again

---

## What You Can Do Right Now

✅ **Upload** malformed JSON → Auto-fixed
✅ **View** graph visualization
✅ **Edit** node dialogue text
✅ **Export** back to Unreal format
✅ **Round-trip** test (import → edit → export → re-import)

---

## Next Steps

1. Test with your own dialogue files
2. Edit nodes and see changes persist
3. Export and verify the JSON format
4. Read [TESTING-GUIDE.md](TESTING-GUIDE.md) for detailed testing

---

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

---

**Ready to test? Open http://localhost:5173 now! 🎉**
