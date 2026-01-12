#!/bin/bash

echo "Step 1: Login as Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pravah.gov.in",
    "password": "Admin@2025"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 1
fi

echo "Logged in successfully"

echo ""
echo "Step 2: Uploading weather document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5001/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$(pwd)/test.pdf" \
  -F "title=Heavy Rainfall Alert - Uttarakhand" \
  -F "category=Weather" \
  -F "urgency=High" \
  -F "description=Weather warning for heavy rainfall" \
  -F "initialDepartment=69612820571bd48bc2124909")

echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"

DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
  echo "Upload failed"
  exit 1
fi

echo ""
echo "Document uploaded with ID: $DOC_ID"

echo ""
echo "Waiting 8 seconds for AI processing..."
sleep 8

echo ""
echo "Step 3: Checking document details..."
curl -s -X GET http://localhost:5001/api/documents/$DOC_ID \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "Step 4: Confirming routing to Weather Department..."
ROUTING_RESPONSE=$(curl -s -X POST http://localhost:5001/api/documents/$DOC_ID/confirm-routing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$ROUTING_RESPONSE" | python3 -m json.tool

echo ""
echo "Test completed!"
echo "Check ukweatherdept.gov@gmail.com for email notification"
echo "Check Weather Admin dashboard for in-app notification"
