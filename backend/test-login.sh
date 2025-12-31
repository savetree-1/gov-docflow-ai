#!/bin/bash

echo "Testing Login API..."
echo ""

# Login as Finance Admin
response=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "finance.admin@pravah.gov.in",
    "password": "Finance@123"
  }')

echo "Login Response:"
echo "$response" | jq '.'

# Extract token
token=$(echo "$response" | jq -r '.token')

if [ "$token" != "null" ] && [ ! -z "$token" ]; then
  echo ""
  echo "Login successful! Token: ${token:0:50}..."
  echo ""
  echo "Testing Users API..."
  
  # Get users
  curl -s -X GET "http://localhost:5001/api/users" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" | jq '.'
else
  echo ""
  echo "Login failed!"
fi
