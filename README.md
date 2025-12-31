# Pravaah - Government Document Management System

## Overview

Pravaah is an integrated document flow management system designed for the Government of Uttarakhand, enabling seamless inter-departmental document routing, approval workflows, and blockchain-based audit trails. The platform modernizes governmental document handling with secure, transparent, and efficient digital workflows.

## System Architecture

### Technology Stack

**Frontend**
- React 18.2.0 with functional components and hooks
- Redux for state management
- React Router for navigation
- TailwindCSS + Custom CSS for styling
- Axios for API communication

**Backend**
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT-based authentication with refresh tokens
- Multer for file upload handling
- Google Gemini AI for intelligent document routing

**Blockchain**
- Polygon Amoy Testnet
- Solidity smart contracts
- Ethers.js for blockchain interaction
- Immutable audit trail for compliance

**Additional Services**
- Nodemailer for email notifications
- Firebase Cloud Messaging (future)
- PDF/document parsing libraries

## Key Features

### 1. Role-Based Access Control
- **Super Admin**: State-level oversight, department management, system configuration
- **Department Admin**: Departmental user management, routing rules, approval workflows
- **Officer**: Document handling, review, and forwarding
- **Auditor**: Read-only access for compliance monitoring

### 2. Document Lifecycle Management
- Secure document upload with validation (PDF, DOC, DOCX, JPG, PNG)
- Automated AI-powered document routing suggestions
- Multi-level approval workflows
- Document status tracking (Pending, Reviewed, Approved, Rejected, Forwarded)
- Document deletion with soft-delete mechanism

### 3. Intelligent Routing
- AI-based department routing suggestions using Google Gemini
- Configurable routing rules per department
- Manual override capability for officers
- Automatic notification system

### 4. Audit & Compliance
- Blockchain-based immutable audit trail on Polygon
- Complete action logging (upload, review, approval, rejection, forwarding)
- RTI compliance with transparent record-keeping
- System logs for administrative oversight

### 5. User Experience
- Responsive dashboard interfaces for all roles
- Real-time notifications (in-app and email)
- Advanced search and filtering
- Document preview and metadata display
- Activity timeline and statistics

## Installation and Setup

### Prerequisites
- Node.js v16.x or higher
- MongoDB Atlas account (or local MongoDB)
- MetaMask wallet with Polygon Amoy testnet MATIC
- Google Gemini API key
- Gmail account for SMTP

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pravah_prototype

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production

# Email Configuration
EMAIL_FROM=noreply@pravah.gov.in
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Blockchain
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
METAMASK_PRIVATE_KEY=your_metamask_private_key

# Server
PORT=5001
NODE_ENV=development
```

3. Seed database with initial data:
```bash
node seed.js
```

4. Start backend server:
```bash
npm start
```

### Blockchain Deployment

1. Navigate to blockchain directory:
```bash
cd blockchain
npm install
```

2. Deploy smart contract:
```bash
npm run deploy
```

3. Copy contract address to backend `.env` file

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:5001
```

3. Start development server:
```bash
npm start
```

Access the application at `http://localhost:3000`

## Project Structure

```
pravaah/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication & RBAC
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic (email, AI, blockchain)
│   ├── uploads/            # Uploaded documents
│   └── server.js           # Entry point
│
├── blockchain/             # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   └── hardhat.config.js   # Blockchain configuration
│
├── src/                    # React frontend
│   ├── api/               # API integration
│   ├── components/        # Reusable components
│   ├── pages/             # Route components
│   ├── redux/             # State management
│   ├── constants/         # Application constants
│   └── utils/             # Utility functions
│
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── guides/            # Technical guides
│   └── archive/           # Archived documentation
│
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Documents
- `GET /api/documents` - List documents (filtered by role)
- `POST /api/documents` - Upload new document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id/route` - Route document to department
- `PUT /api/documents/:id/approve` - Approve document
- `PUT /api/documents/:id/reject` - Reject document
- `DELETE /api/documents/:id` - Soft delete document

### Users
- `GET /api/users` - List users (department-scoped)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/status` - Toggle user active status

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments/register` - Request new department
- `GET /api/departments/requests` - List pending requests (Super Admin)
- `PUT /api/departments/requests/:id/approve` - Approve department
- `PUT /api/departments/requests/:id/reject` - Reject department

### Routing Rules
- `GET /api/routing-rules` - List routing rules
- `POST /api/routing-rules` - Create routing rule
- `PUT /api/routing-rules/:id` - Update routing rule
- `DELETE /api/routing-rules/:id` - Delete routing rule

Full API documentation available in `/docs/guides/`

## Default Credentials

**Super Admin**
- Email: `superadmin@pravah.gov.in`
- Password: `Admin@123`

**Department Admin (Agriculture)**
- Email: `ukagridept.gov@gmail.com`
- Password: `Agri@123`

**Officer (Agriculture)**
- Email: `agri.officer1@pravah.gov.in`
- Password: `Officer@123`

See `docs/guides/DEMO_CREDENTIALS.md` for complete list

## Development Workflow

### Starting the Full Stack

1. Start MongoDB (if local)
2. Start backend: `cd backend && npm start`
3. Start frontend: `npm start`
4. Access application at `http://localhost:3000`

### Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && npm test
```

### Building for Production

```bash
# Build frontend
npm run build

# The build folder will contain optimized production files
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 1 hour (access) and 7 days (refresh)
- File uploads are validated and size-limited (10MB)
- API endpoints protected with authentication middleware
- Role-based authorization on all sensitive operations
- Blockchain private keys stored in environment variables
- CORS enabled for specified origins only

## Deployment

### Frontend (Netlify/Vercel)
1. Build the application: `npm run build`
2. Deploy the `build` folder to hosting service
3. Configure environment variables

### Backend (Heroku/DigitalOcean)
1. Push code to Git repository
2. Configure environment variables on hosting platform
3. Ensure MongoDB Atlas is accessible
4. Set up domain and SSL certificates

### Database (MongoDB Atlas)
- Use production cluster with appropriate tier
- Enable IP whitelisting
- Configure automated backups
- Set up monitoring and alerts

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -m 'Add NewFeature'`
4. Push to branch: `git push origin feature/NewFeature`
5. Submit pull request

## Phase 2 Roadmap

### Enhanced Features
- Mobile application (React Native)
- Advanced analytics dashboard with charts and insights
- Document OCR and automated metadata extraction
- Multi-language support (Hindi, English)
- Digital signatures integration (Aadhaar-based)
- WhatsApp notification integration
- Real-time collaboration features
- Advanced search with full-text indexing
- Document version control and history
- Automated workflows with conditional routing
- Bulk document operations
- Custom report generation

### Infrastructure Improvements
- Microservices architecture migration
- Redis caching layer for performance
- Elasticsearch for advanced document search
- AWS S3/cloud storage for scalable file storage
- Load balancing and horizontal scaling
- Automated CI/CD pipeline with testing
- Comprehensive unit and integration tests
- Performance monitoring and alerting
- Database query optimization
- CDN integration for static assets

### Compliance & Security
- Two-factor authentication (OTP-based)
- Enhanced session management
- Automated security vulnerability scanning
- GDPR and data privacy compliance
- Disaster recovery and backup automation
- Regular penetration testing
- Security audit logging
- IP whitelisting for admin access
- Rate limiting and DDoS protection

### User Experience
- Progressive Web App (PWA) capabilities
- Offline document access
- Enhanced mobile responsiveness
- Dark mode support
- Keyboard shortcuts and accessibility
- Drag-and-drop file uploads
- Bulk actions and batch processing
- Customizable dashboard widgets
- Export data in multiple formats

## License

This project is proprietary software developed for the Government of Uttarakhand.
All rights reserved.

## Support

For technical support or inquiries:
- Email: support@pravah.gov.in
- Documentation: See `/docs/guides/`
- Issues: GitHub Issues (for authorized developers)

## Acknowledgments

Developed by Tech Titans for the Government of Uttarakhand as part of the digital governance initiative.

---

**Version**: 1.0.0  
**Last Updated**: December 31, 2025  
**Status**: Production Ready
