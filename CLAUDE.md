# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoluntariosGT is a comprehensive volunteer management system for Guatemala with three main applications:
- **Mobile App** (React Native + Expo): For volunteers and beneficiaries
- **Web Dashboard** (React + Vite): Administrative panel for entities  
- **Backend API** (Node.js + Express): Central API with Supabase integration

The system uses Supabase for PostgreSQL database with Row Level Security (RLS), geolocation features, and handles volunteer activities, certifications, and social impact tracking.

## Development Commands

### Root Level (Workspace Management)
```bash
# Install all dependencies across workspaces
npm run install:all

# Start all services in development
npm run start       # or npm run dev

# Start individual services
npm run start:backend
npm run start:frontend  
npm run start:dashboard

# Build applications
npm run build:frontend    # Android APK via EAS
npm run build:dashboard   # Vite production build

# Utility commands
npm run clean            # Remove all node_modules
npm run docs            # Open user manual
```

### Backend Development (Node.js + Express)
```bash
cd backend
npm start              # Production mode
npm run dev           # Development with nodemon
npm test              # Jest tests
npm run test:security  # Security audit + tests
npm run test:geolocation  # Geolocation-specific tests
```

### Frontend Mobile (React Native + Expo)
```bash
cd frontend
npm start              # Expo development server
npm run android        # Android device/emulator
npm run ios           # iOS device/simulator  
npm run web           # Web development
```

### Dashboard Web (React + Vite)
```bash
cd dashboard-web
npm run dev           # Vite development server
npm run build         # Production build
npm run lint          # ESLint check
npm run preview       # Preview production build
```

## Architecture & Key Components

### Backend Structure (`backend/src/`)
- **`server.js`**: Express app entry point with security middleware (helmet, CORS, rate limiting)
- **`config.js`**: Supabase client setup (public + admin), environment configuration
- **`controllers/`**: Business logic for each domain (auth, activities, users, certificates, reports, notifications)
- **`routes/`**: Express route definitions mapping to controllers
- **`utils/`**: Shared utilities (middleware, validation, geolocation helpers)

### Database Schema (Supabase PostgreSQL)
- **Core tables**: `perfiles` (user profiles), `entidades` (organizations), `actividades` (volunteer activities)
- **Relations**: `inscripciones` (activity enrollments), `certificados` (generated certificates)
- **Features**: PostGIS for geolocation, Row Level Security (RLS) policies, UUID primary keys
- **Enums**: `user_role`, `actividad_estado`, `verificacion_estado`

### Frontend Mobile (`frontend/src/`)
- **Navigation**: React Navigation with stack and tab navigators
- **State**: Context-based auth state, AsyncStorage for persistence
- **Key screens**: Login, Activities list/map, Profile, Registration
- **Services**: API integration, location services, authentication
- **Styling**: NativeWind (Tailwind for React Native)

### Dashboard Web (`dashboard-web/src/`)
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **State**: Hooks-based state management

## Environment Configuration

### Required Environment Variables

**Backend (`.env`)**:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_key
ENCRYPTION_KEY=32_character_encryption_key
```

**Frontend (`frontend/src/constants/config.js`)**:
```javascript
export const APP_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  SUPABASE_URL: 'your_supabase_url',
  SUPABASE_ANON_KEY: 'your_anon_key',
};
```

**Dashboard (`.env`)**:
```env  
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development Workflow

### Testing Strategy
- **Backend**: Jest with Supertest for API testing
- **Security**: npm audit integration
- **Geolocation**: Dedicated test suite for location features
- **Manual testing**: Use provided test credentials from README.md

### Code Style & Patterns
- **ES Modules**: Backend uses `"type": "module"` 
- **Error Handling**: Centralized error middleware in Express
- **Authentication**: JWT with refresh tokens, Supabase auth integration
- **Validation**: express-validator for API inputs, Zod for frontend forms
- **Security**: Helmet middleware, rate limiting, input sanitization

### Database Operations
- **Migrations**: SQL files in `supabase/migrations/`
- **RLS Policies**: Implemented for data isolation by user role
- **Geolocation**: PostGIS extension for proximity searches
- **Admin Operations**: Use `supabaseAdmin` client for elevated privileges

### Key Business Logic
- **User Roles**: beneficiario, voluntario, entidad, admin with different permissions
- **Activity Matching**: Geolocation-based assignment (5km radius)
- **Verification Flow**: DPI validation for Guatemalan users, entity document verification
- **Certificate Generation**: Automatic PDF generation with QR codes
- **Notifications**: OneSignal integration for push notifications

## Common Development Tasks

### Adding New API Endpoints
1. Create controller function in appropriate `controllers/` file
2. Add route in corresponding `routes/` file  
3. Update authentication middleware if needed
4. Add validation using express-validator

### Mobile Feature Development
1. Create new screen in `frontend/src/screens/`
2. Add navigation route in `frontend/src/navigation/AppNavigator.js`
3. Implement API service calls in `frontend/src/services/`
4. Update context if global state changes needed

### Database Schema Changes
1. Create new migration file in `supabase/migrations/`
2. Update RLS policies if needed
3. Test with both `supabase` and `supabaseAdmin` clients
4. Update controller logic to handle new fields

## Security Considerations

- **Authentication**: Always use JWT middleware for protected routes
- **File Uploads**: Size limits (5MB), type validation, secure storage
- **Input Validation**: Sanitize all user inputs, validate DPI format
- **Database Access**: Use RLS policies, avoid raw SQL queries
- **Environment**: Never commit secrets, use proper environment files

## Deployment Notes

- **Backend**: Designed for deployment on Render/Railway
- **Dashboard**: Optimized for Vercel deployment  
- **Mobile**: EAS Build for Android APK generation
- **Database**: Supabase handles hosting and backups
- **Scripts**: `setup.sh`, `start.sh`, `stop.sh` for server management