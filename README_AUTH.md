# Radiant Hyve Super Admin - Updated Authentication System

## 🎯 Overview

This is a consolidated **Admin & SuperAdmin** management application for Radiant Hyve with a unified authentication system. Both SuperAdmin and SchoolAdmin users log in through a single endpoint and are routed to their respective dashboards based on their role.

## ✨ Key Features

- **🔐 Unified Login** - Single login page for all user roles
- **👤 Role-Based Access** - Automatic routing based on user role (SuperAdmin/SchoolAdmin)
- **💾 Session Persistence** - Users stay logged in across page refreshes
- **🔄 Role Detection** - Automatically detects user role from API response
- **🛡️ Protected Routes** - All protected routes check authentication and authorization
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🔥 Firebase Integration** - Push notifications via Firebase Cloud Messaging
- **⚡ Performance Optimized** - Efficient state management with React Context

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

### Login

1. Navigate to `/login`
2. Enter your credentials
3. System automatically detects your role:
   - **SuperAdmin** → Redirects to `/super_admin/dashboard`
   - **SchoolAdmin** → Redirects to `/school_admin/dashboard`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Header/          # User info & logout
│   └── Sidebar/         # Navigation menu
├── context/
│   └── AuthContext.js   # ✨ NEW: Authentication state management
├── pages/
│   ├── Dashboard/
│   ├── Login/           # Updated: Unified login
│   ├── ManageSchool/    # SuperAdmin only
│   ├── SubscriptionService/  # SuperAdmin only
│   └── [Other pages]/   # SchoolAdmin pages
├── router/
│   ├── Router.js        # Updated: Uses AuthContext
│   ├── privateRoute.js  # Updated: Role-based access control
│   ├── publicRoute.js
│   └── allRoutes.js     # Updated: Unified /login route
├── services/
│   └── api_services.js  # API calls
├── firebase/
│   └── Firebase.js      # Firebase config
└── App.js               # Updated: Wrapped with AuthProvider
```

## 🔐 Authentication System

### How It Works

```
1. User visits app → App.js wraps everything with AuthContext
2. AuthContext checks localStorage on mount
3. User either sees login page or dashboard (based on stored session)
4. User submits login form
5. API validates credentials and returns role
6. AuthContext stores token + role + user data
7. System redirects to appropriate dashboard
8. User session persists on refresh
```

### Check User Role in Components

```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { role, isSuperAdmin, isSchoolAdmin, token, user } = useAuth();

  if (isSuperAdmin) {
    return <div>SuperAdmin Content</div>;
  }

  if (isSchoolAdmin) {
    return <div>SchoolAdmin Content</div>;
  }

  return null;
}
```

### Logout

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears all auth state
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## 📚 Documentation

Complete documentation is available in:

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[CONSOLIDATION_GUIDE.md](CONSOLIDATION_GUIDE.md)** - Detailed implementation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & flow diagrams
- **[EXAMPLE_USAGE.md](EXAMPLE_USAGE.md)** - 10 practical code examples
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was changed
- **[CHECKLIST.md](CHECKLIST.md)** - Verification & testing checklist

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

## 📱 Available Routes

### Public Routes

- `/login` - Unified login page (new)
- `/super_admin/login` - Backward compatible
- `/school_admin/login` - Backward compatible
- `/school_admin/forgot_password` - Forgot password

### Protected Routes - SuperAdmin Only

- `/super_admin/dashboard` - Dashboard
- `/super_admin/manage_school` - School management
- `/super_admin/subscription_service` - Subscription management

### Protected Routes - SchoolAdmin Only

- `/school_admin/dashboard` - Dashboard
- `/school_admin/principal` - Principal management
- `/school_admin/staff` - Staff management
- `/school_admin/student` - Student management
- `/school_admin/parents` - Parent management
- `/school_admin/payment` - Payment management
- And 10+ more...

## 🛠️ API Requirements

Your login API must return a response with the following structure:

```json
{
  "status": 1,
  "message": "Login successful",
  "token": "your_auth_token",
  "refresh_token": "your_refresh_token",
  "data": {
    "id": 123,
    "email": "admin@school.com",
    "name": "Administrator Name",
    "role": "super_admin",
    "school_id": 456
  }
}
```

**Important:** The `role` field must be either `"super_admin"` or `"school_admin"`

## 🧪 Testing

### Test Checklist

1. **Login Flow**
   - [ ] SuperAdmin login → redirects to `/super_admin/dashboard`
   - [ ] SchoolAdmin login → redirects to `/school_admin/dashboard`

2. **Session Persistence**
   - [ ] Refresh page after login → stays logged in
   - [ ] localStorage shows correct keys

3. **Route Protection**
   - [ ] Unauthenticated user → redirects to `/login`
   - [ ] Wrong role accessing route → redirects to their dashboard

4. **Logout**
   - [ ] Logout clears all data
   - [ ] Cannot access protected routes after logout

See [CHECKLIST.md](CHECKLIST.md) for detailed testing procedures.

## 🔄 What Changed from Original

### New Features

- ✨ Unified `/login` endpoint for both roles
- ✨ `AuthContext` for centralized auth state
- ✨ `useAuth()` hook available in all components
- ✨ Automatic role detection and routing
- ✨ `logout()` function for clean session clearing

### Modified Files

- `src/App.js` - Wrapped with AuthProvider
- `src/pages/Login/Login.js` - Uses AuthContext, detects role
- `src/router/privateRoute.js` - Role-based access control
- `src/router/Router.js` - Improved routing logic
- `src/router/allRoutes.js` - Added unified `/login`

### Backward Compatibility

- Old paths `/super_admin/login` and `/school_admin/login` still work
- All existing routes and pages work unchanged
- No breaking changes to existing code

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy

The `build` folder is ready to be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any Node.js server

## 🔗 Local Storage Keys

The app stores the following in localStorage:

- `radiant-admin-token` - Authentication token
- `refresh_token` - Token for refreshing sessions
- `user-role` - User's role (super_admin or school_admin)
- `user-data` - User information (JSON)
- `device_Id` - Device identifier

## 📦 Dependencies

Key dependencies:

- `react` - UI framework
- `react-router-dom` - Routing
- `formik` & `yup` - Form validation
- `react-icons` - Icon library
- `react-hot-toast` - Toast notifications
- `firebase` - Push notifications
- `axios` - HTTP client
- `tailwindcss` - Styling

## 🤝 Support

For issues or questions:

1. Check the relevant documentation file
2. Review the error message in browser console
3. Verify API response includes required fields
4. Check localStorage for required keys

## 📄 License

[Your License Here]

## 👨‍💻 Contributors

- [Your Name]

---

**Last Updated**: February 2026  
**Version**: 2.0 (Unified Auth System)  
**Status**: ✅ Production Ready
