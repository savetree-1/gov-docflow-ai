#!/bin/bash
echo "Testing Document Upload with AI Processing"
echo "=============================================="
echo ""
echo "This will upload a test PDF and monitor AI processing"
echo ""
echo "Checking backend status..."
curl -s http://localhost:5001/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Backend is running on port 5001"
else
  echo "Backend is not running! Start it with: PORT=5001 node server.js"
  exit 1
fi
echo ""
echo "Upload a document via the UI at: http://localhost:3000/upload"
echo ""
echo "After uploading, check this terminal for AI processing logs:"
echo "  - Look for: 'Starting AI processing'"
echo "  - Then: 'AI processing completed'"
echo "  - Finally: 'Summary: ...'"
echo ""
echo "Then visit the document detail page to see the AI summary!"
