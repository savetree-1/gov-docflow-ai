# Pravaah - Quick Start Guide

## Prerequisites

Ensure you have the following installed:
- Node.js v16.x or higher
- MongoDB (local or Atlas account)
- Git

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/suyashrastogi7/krishi-sadhan.git
cd krishi-sadhan
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
MONGO_URI=mongodb+srv://pravah_user:dummy123@cluster0.jjzpsjs.mongodb.net/pravah_prototype
JWT_SECRET=your_jwt_secret_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
EMAIL_FROM=noreply@pravah.gov.in
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
GEMINI_API_KEY=your_gemini_key
BLOCKCHAIN_CONTRACT_ADDRESS=0x1C10cF7771B783a40c9599B673e18C641DcEd89a
METAMASK_PRIVATE_KEY=your_metamask_private_key
PORT=5001
NODE_ENV=development
```

Seed database:
```bash
node seed.js
```

Start backend:
```bash
npm start
```

Backend will run on `http://localhost:5001`

### 3. Frontend Setup

Open new terminal in project root:

```bash
npm install
```

Create `.env` file in project root:
```env
REACT_APP_BACKEND_URL=http://localhost:5001
```

Start frontend:
```bash
npm start
```

Application opens at `http://localhost:3000`

### 4. Login

Use these credentials:

**Super Admin:**
- Email: `superadmin@pravah.gov.in`
- Password: `Admin@123`

**Department Admin (Agriculture):**
- Email: `ukagridept.gov@gmail.com`
- Password: `Agri@123`

**Officer:**
- Email: `agri.officer1@pravah.gov.in`
- Password: `Officer@123`

## Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists in `/backend`
- Check port 5001 is not in use

**Frontend won't connect:**
- Ensure backend is running on port 5001
- Check REACT_APP_BACKEND_URL in `.env`
- Clear browser cache and localStorage

**Login fails:**
- Run `node seed.js` to create test users
- Check MongoDB connection
- Verify JWT_SECRET is set

## Next Steps

1. Read [README.md](README.md) for full documentation
2. See [DEVELOPMENT.md](DEVELOPMENT.md) for API reference
3. Check `/docs/guides/` for technical guides

## Project Structure

```
krishi-sadhan/
├── backend/           # Node.js API
├── blockchain/        # Smart contracts
├── src/              # React frontend
├── public/           # Static files
├── docs/             # Documentation
└── README.md         # Main documentation
```

## Support

For issues:
- Check documentation in `/docs/guides/`
- Review error logs in terminal
- Contact development team

---

Last Updated: December 31, 2025
