#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTYzY2MzZGViMjc4ODNhYTc5NWFlNjkiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJkZXBhcnRtZW50IjpudWxsLCJpYXQiOjE3NjgxNTM3MTcsImV4cCI6MTc2ODE1NzMxN30.pufo3GRab9_y5kCCmMSwJbcr5o9qosV6glXW6O2ABP0"

echo "Uploading weather document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5001/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/Users/anks/Documents/GitHub/gov-docflow-ai/backend/test-weather.pdf" \
  -F 'title=Heavy Rainfall Alert - Uttarakhand Region' \
  -F 'category=weather' \
  -F 'urgency=High' \
  -F 'description=Severe weather warning for mountainous regions' \
  -F 'initialDepartment=6963cc3beb27883aa795ae64')

echo "$UPLOAD_RESPONSE" | jq .

DOC_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data._id')

if [ "$DOC_ID" = "null" ] || [ -z "$DOC_ID" ]; then
  echo "Document upload failed"
  exit 1
fi

echo "Document uploaded: $DOC_ID"
echo ""
echo "Waiting for AI processing..."
sleep 5

echo ""
echo "Confirming routing..."
CONFIRM_RESPONSE=$(curl -s -X POST "http://localhost:5001/api/documents/$DOC_ID/confirm-routing" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$CONFIRM_RESPONSE" | jq .

echo ""
echo "Check weather admin email: ukweatherdept.gov@gmail.com"
