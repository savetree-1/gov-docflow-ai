# Document Access Control Update - Summary

## ✅ Completed Changes

### 1. **Database Cleanup**
- ✅ Deleted all 13 existing documents to start fresh
- All departments remain intact (13 departments seeded)

### 2. **Document Model Updates**
**File:** `/backend/models/Document.js`

Added new field:
- `initialDepartment` (required) - Department selected by officer during upload
- `department` (optional) - Department after AI routing confirmation

**Access Logic:**
- Officer uploads → selects department → `initialDepartment` is set immediately
- AI suggests routing → Officer confirms → `department` field gets updated

### 3. **Backend Upload Endpoint**
**File:** `/backend/routes/documents.js`

Changes:
- ✅ Now requires `initialDepartment` parameter
- ✅ Validates department exists and is active
- ✅ Saves department selection with document
- ✅ Populates both `initialDepartment` and `department` in responses

### 4. **Document Query Logic** 
**File:** `/backend/routes/documents.js` (GET `/api/documents`)

**New Access Rules:**

**OFFICERS:**
```javascript
query.uploadedBy = req.user.userId
```
→ See ONLY documents they uploaded

**DEPARTMENT ADMINS:**
```javascript
query.$or = [
  { initialDepartment: req.user.department },  // Documents uploaded to their dept
  { department: req.user.department }           // Documents routed to their dept via AI
]
```
→ See documents where:
- Officer selected their department during upload, OR
- AI routing was confirmed to their department

**AUDITORS:**
- See ALL documents (no filters)

### 5. **Frontend Upload Form**
**File:** `/src/pages/documentUpload/DocumentUpload.jsx`

Changes:
- ✅ Added state for `departments` and `loadingDepartments`
- ✅ Fetches active departments from `/api/departments?isActive=true` on mount
- ✅ Added Department dropdown (required field) in Step 2
- ✅ Dropdown shows: "Department Name (CODE)"
- ✅ Sends `initialDepartment` instead of `department` to backend
- ✅ Added validation: Title, Category, **Department** all required

---

## 🎯 How It Works Now

### **Upload Flow:**
1. Officer selects file
2. Officer fills title, category, **DEPARTMENT** (required dropdown)
3. Document saved with `initialDepartment = selected department`
4. AI processes document and suggests routing
5. If officer confirms AI routing to different department:
   - `department` field gets updated
   - Both departments can now see it

### **Visibility Examples:**

**Example 1: Weather Department Admin**
- Officer uploads "Rainfall Report" → Selects "Meteorology" department
- Weather admin sees it immediately (via `initialDepartment`)
- AI suggests routing to "Disaster Management"
- If confirmed → Disaster admin can ALSO see it (via `department` field)
- Weather admin STILL sees it (via `initialDepartment`)

**Example 2: Officer**
- Uploads 5 documents to various departments
- Sees ALL 5 documents they uploaded (regardless of department)
- Cannot see documents uploaded by other officers

**Example 3: Disaster Management Admin (Vikram Rao)**
- Sees documents where:
  - Officers selected "Disaster Management" during upload, OR
  - AI routing was confirmed to "Disaster Management"
- Does NOT see documents from other departments

---

## 🔑 Test Accounts

### Officers:
- **John Officer** - officer@gov.in / Test@123

### Department Admins:
- **Weather Admin** - ukweatherdept.gov@gmail.com / Weather@123 (Meteorology)
- **Vikram Rao** - disaster.admin@pravah.gov.in / Disaster@123 (Disaster Management)
- **Finance Admin** - finance@gov.in / Test@123 (Finance)
- **Land Admin** - land@gov.in / Test@123 (Land Management)

### Auditor:
- **Audit User** - auditor@gov.in / Test@123 (sees all documents)

### Super Admin:
- **Super Admin** - admin@gov.in / Admin@123

---

## 🧪 Testing Steps

1. **Login as Officer** (officer@gov.in)
   - Upload new document
   - **SELECT DEPARTMENT** from dropdown (e.g., "Meteorology")
   - Submit
   - Verify you see the document in your dashboard

2. **Login as Weather Admin** (ukweatherdept.gov@gmail.com)
   - Should see the document uploaded to Meteorology
   - Should NOT see documents uploaded to other departments

3. **Upload another document as Officer**
   - Select "Disaster Management" department
   - Wait for AI processing
   - If AI suggests routing to different dept → confirm it

4. **Login as Vikram Rao** (disaster.admin@pravah.gov.in)
   - Should see documents uploaded to Disaster Management
   - Should see documents routed to Disaster Management via AI
   - Should NOT see Weather department documents

5. **Login as Auditor** (auditor@gov.in)
   - Should see ALL documents from all departments

---

## 📋 13 Registered Departments

1. Finance (FIN)
2. Revenue (REV)
3. Agriculture (AGR)
4. Infrastructure (INF)
5. **Disaster Management (DIS)** ← Vikram Rao
6. Human Resources (HR)
7. Legal (LEG)
8. Policy (POL)
9. Land Management (LND)
10. Education (EDU)
11. Health (HLT)
12. Transport (TRA)
13. **Meteorology (MET)** ← Weather Admin

---

## ✅ Summary

**Problem:** All department admins could see all documents regardless of department assignment

**Solution:** 
- Added `initialDepartment` field to track officer's department selection
- Department admins see documents uploaded to their dept OR routed to their dept
- Officers see only their own uploads
- Auditors see everything

**Result:** Proper department isolation with AI routing support

---

## 🔄 Next Steps to Test

1. Refresh browser (clear cache if needed)
2. Login as officer and upload new document with department selection
3. Verify department admins only see their department's documents
4. Test AI routing confirmation workflow
5. Verify email notifications to real Gmail (ukweatherdept.gov@gmail.com)

Backend is running on port 5001 ✅  
Frontend is running on port 3002 ✅
