# �� Deployment Guide

## Quick Start

### 1. Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

### 2. Production Build
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm install
npm run build
```

### 3. Environment Variables
```env
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr-interfaces
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

### 4. Seed Sample Data
```bash
curl -X POST http://localhost:5000/api/interfaces/seed
```

## Cloud Deployment

### Vercel (Frontend)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Railway (Backend)
1. Connect GitHub repository
2. Set root directory: `backend`
3. Add environment variables
4. Deploy

### MongoDB Atlas
1. Create cluster
2. Get connection string
3. Update MONGODB_URI

## Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    ports: ["27017:27017"]
    
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/hr-interfaces
    depends_on: [mongodb]
    
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

```bash
docker-compose up -d
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] Error handling

## Performance Tips

- Use MongoDB indexes
- Implement caching
- Enable compression
- Monitor memory usage
- Set up logging

---

**Ready to deploy! 🚀**
