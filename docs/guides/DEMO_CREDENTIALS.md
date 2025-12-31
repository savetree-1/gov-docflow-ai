# Pravah System - Demo Login Credentials

## System Access Credentials

### 🔐 SUPER ADMIN (1)
Complete system access with all permissions.

| Email | Password | Name |
|-------|----------|------|
| admin@pravah.gov.in | `Admin@2025` | Super Admin |

---

### 🏢 DEPARTMENT ADMINS (5)
Department-level access - can manage their department's officers and documents.

| Department | Email | Password | Full Access To |
|------------|-------|----------|----------------|
| **Finance** | finance.admin@pravah.gov.in | `Finance@123` | 2 Finance Officers |
| **Disaster Management** | disaster.admin@pravah.gov.in | `Disaster@123` | 2 Disaster Officers |
| **Weather (Meteorology)** | ukweatherdept.gov@gmail.com ⚠️ | `Weather@123` | 2 Weather Officers |
| **Agriculture** | agriculture.admin@pravah.gov.in | `Agri@123` | 2 Agriculture Officers |
| **Infrastructure** | infra.admin@pravah.gov.in | `Infra@123` | 2 Infrastructure Officers |

⚠️ *Real Gmail account - use for email testing*

---

### 👥 OFFICERS (10 - 2 per department)
Document processing and workflow execution.

#### Finance Department
| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Suresh Patel | finance.officer1@pravah.gov.in | `Officer@123` | FIN-OFF-001 |
| Meena Gupta | finance.officer2@pravah.gov.in | `Officer@123` | FIN-OFF-002 |

#### Disaster Management Department
| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Anil Singh | disaster.officer1@pravah.gov.in | `Officer@123` | DIS-OFF-001 |
| Pooja Reddy | disaster.officer2@pravah.gov.in | `Officer@123` | DIS-OFF-002 |

#### Weather (Meteorology) Department
| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Deepak Joshi | weather.officer1@pravah.gov.in | `Officer@123` | WEA-OFF-001 |
| Sneha Nair | weather.officer2@pravah.gov.in | `Officer@123` | WEA-OFF-002 |

#### Agriculture Department
| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Ravi Yadav | agri.officer1@pravah.gov.in | `Officer@123` | AGR-OFF-001 |
| Kavita Desai | agri.officer2@pravah.gov.in | `Officer@123` | AGR-OFF-002 |

#### Infrastructure Department
| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Sanjay Malhotra | infra.officer1@pravah.gov.in | `Officer@123` | INF-OFF-001 |
| Anjali Mehta | infra.officer2@pravah.gov.in | `Officer@123` | INF-OFF-002 |

---

### 📋 AUDITORS (2)
Read-only access for compliance and monitoring.

| Name | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Ramesh Iyer | auditor1@pravah.gov.in | `Auditor@123` | AUD-001 |
| Lakshmi Bhat | auditor2@pravah.gov.in | `Auditor@123` | AUD-002 |

---

## 🧪 Testing Scenarios

### Scenario 1: Finance Department Admin Access
1. Login: `finance.admin@pravah.gov.in` / `Finance@123`
2. Navigate to **User Management**
3. **Expected Result**: See **2 officers** (Suresh Patel & Meena Gupta)
4. Test filtering, search, and user details

### Scenario 2: Cross-Department Isolation
1. Login as Finance Admin
2. Navigate to User Management
3. **Expected Result**: Only see Finance department officers (NOT officers from other departments)

### Scenario 3: Super Admin Full Access
1. Login: `admin@pravah.gov.in` / `Admin@2025`
2. Navigate to User Management
3. **Expected Result**: See **all 18 users** across all departments

### Scenario 4: Officer Document Upload
1. Login: `finance.officer1@pravah.gov.in` / `Officer@123`
2. Navigate to Document Upload
3. Upload sample document
4. **Expected Result**: Document routed to Finance department workflow

### Scenario 5: Auditor Read-Only Access
1. Login: `auditor1@pravah.gov.in` / `Auditor@123`
2. Access System Logs, Documents
3. **Expected Result**: View-only access (no edit/delete options)

---

## 📊 Database Summary

| Role | Count | Access Level |
|------|-------|--------------|
| SUPER_ADMIN | 1 | System-wide |
| DEPARTMENT_ADMIN | 5 | Department-scoped |
| OFFICER | 10 | Department workflows |
| AUDITOR | 2 | Read-only |
| **Total Users** | **18** | |

| Department | Code | Admin Email | Officers |
|------------|------|-------------|----------|
| Finance | FIN | finance.admin@pravah.gov.in | 2 |
| Disaster Management | DIS | disaster.admin@pravah.gov.in | 2 |
| Weather & Meteorology | WEA | ukweatherdept.gov@gmail.com | 2 |
| Agriculture | AGR | agriculture.admin@pravah.gov.in | 2 |
| Infrastructure | INF | infra.admin@pravah.gov.in | 2 |
| **Total Departments** | **5** | | **10** |

---

## 🔄 Reset Database

To reset the database to this initial state:

```bash
cd backend
node seed.js
```

This will clear all existing data and recreate the 18 users and 5 departments.

---

## ⚠️ Important Notes

1. **Finance Admin Login**: Use `finance.admin@pravah.gov.in` (NOT finance@gov.in)
2. **Department Filtering**: Each Department Admin only sees their own officers
3. **Real Email**: Weather department uses real Gmail for email integration testing
4. **Consistent Passwords**: All officers use `Officer@123` for simplicity
5. **Employee ID Pattern**: `{DEPT}-{ROLE}-{NUMBER}` (e.g., FIN-OFF-001)

---

*Last Updated: December 30, 2025*  
*Database: MongoDB (localhost:27017/krishi-sadhan)*
