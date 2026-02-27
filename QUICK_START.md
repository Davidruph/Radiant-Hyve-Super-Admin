# Quick Start: Unified Admin & SuperAdmin

## What Changed?

### ✅ Before

- Separate login pages: `/super_admin/login` and `/school_admin/login`
- Two different token storage keys
- No unified authentication state
- Manual role management

### ✅ After

- Single login: `/login` (old paths still work for backward compatibility)
- Unified token storage
- Centralized AuthContext for role management
- Automatic role detection from API

---

## Implementation Summary

### 1. **AuthContext Created** ✅

- **Location**: `src/context/AuthContext.js`
- **Purpose**: Manages user authentication state globally
- **Exports**: `AuthProvider`, `useAuth` hook

### 2. **Login Updated** ✅

- **Changes**: Detects role from API response
- **Storage**: Uses AuthContext + localStorage
- **Redirect**: Based on user's role

### 3. **Private Routes Updated** ✅

- **Logic**: Checks authentication via AuthContext
- **Optional**: Can require specific role
- **Fallback**: Redirects to `/login` if not authenticated

### 4. **Routes Consolidated** ✅

- **Primary**: `/login` - single unified login
- **Backward compat**: `/super_admin/login` and `/school_admin/login` still work
- **All other routes**: Unchanged (super_admin/_ and school_admin/_)

### 5. **App.js Wrapped** ✅

- **Provider**: AuthProvider wraps entire app
- **Enables**: useAuth() hook in all components

---

## How to Check User Role

### In Any Component:

```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { role, isSuperAdmin, isSchoolAdmin } = useAuth();

  return (
    <div>
      <p>Your role: {role}</p>
      {isSuperAdmin && <p>You're a SuperAdmin</p>}
      {isSchoolAdmin && <p>You're a SchoolAdmin</p>}
    </div>
  );
}
```

---

## What Your API Should Return at Login

```json
{
  "status": 1,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 123,
    "email": "admin@school.com",
    "name": "School Admin",
    "role": "school_admin",  ← THIS IS KEY!
    "school_id": 456,
    "permissions": ["view_staff", "manage_students"]
  }
}
```

**Important**: The `role` field must be `"super_admin"` or `"school_admin"`

---

## Key Differences from Old System

| Aspect        | Old                                             | New                              |
| ------------- | ----------------------------------------------- | -------------------------------- |
| Login Route   | `/super_admin/login` or `/school_admin/login`   | `/login` (unified)               |
| Token Storage | `radient-admin-token` or `radient_school_token` | `radiant-admin-token` (unified)  |
| Role Storage  | Hardcoded or from route                         | From API response + localStorage |
| Auth State    | localStorage only                               | localStorage + React Context     |
| Session Check | On each route                                   | On app load via context          |
| Logout        | Clear localStorage manually                     | Use `logout()` from context      |

---

## Testing the System

### Test Login:

1. Navigate to `/login`
2. Enter credentials for a SuperAdmin account
3. Should redirect to `/super_admin/dashboard`
4. Refresh page - should stay logged in
5. Open DevTools → Application → Storage → LocalStorage
6. Check `user-role` = `"super_admin"`

### Test SchoolAdmin:

1. Logout (or new browser)
2. Navigate to `/login`
3. Enter credentials for a SchoolAdmin account
4. Should redirect to `/school_admin/dashboard`
5. Verify role in localStorage = `"school_admin"`

### Test Protected Routes:

1. As SuperAdmin, try accessing `/school_admin/staff`
   - Should redirect to `/super_admin/dashboard` (no access)
2. As SchoolAdmin, try accessing `/super_admin/manage_school`
   - Should redirect to `/school_admin/dashboard` (no access)

---

## If Your API Returns Role Differently

If your backend returns role as `"admin"` instead of `"school_admin"`, update **Login.js** line ~93:

```javascript
// Current code (adjust as needed):
const userRole = datas?.role || "school_admin";

// If your API uses different values:
const userRole = datas?.role === "admin" ? "school_admin" : datas?.role;
```

---

## Logout Implementation

Add to your Header/Sidebar:

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears auth state + localStorage
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Files to Verify/Update

After implementation, check these files:

- [ ] `src/App.js` - AuthProvider wrapping
- [ ] `src/pages/Login/Login.js` - Uses useAuth()
- [ ] `src/router/privateRoute.js` - Uses useAuth()
- [ ] `src/router/Router.js` - Uses useAuth()
- [ ] `src/router/allRoutes.js` - Has `/login` route
- [ ] `src/context/AuthContext.js` - Exists
- [ ] `src/components/Sidebar/Sidebar.js` - Can now check role with useAuth()
- [ ] `src/components/Header/Header.js` - Can add logout button

---

## Common Issues & Fixes

### Issue: "useAuth must be used within AuthProvider"

**Fix**: Make sure App.js wraps Router with AuthProvider ✅ Already done

### Issue: User not staying logged in on refresh

**Fix**: Check localStorage keys in DevTools. Should have:

- `radiant-admin-token`
- `user-role`
- `user-data`

### Issue: Redirect loop at login

**Fix**: Ensure API response includes `data.role` field. Log the response:

```javascript
console.log("Login response:", res.data);
```

### Issue: Wrong dashboard after login

**Fix**: Check `datas?.role` value in Login.js console. Should be exactly `"super_admin"` or `"school_admin"`

---

## Next Steps

1. **Test the login flow** with both role types
2. **Update Sidebar/Header** to show role-specific menu items
3. **Add role-based components** using `useAuth()` hook
4. **Update logout functionality** to use AuthContext
5. **Test page refreshes** to ensure session persists
6. **Update any API interceptors** to include token from context

---

## Need Help?

Refer to:

- **Role Checking**: See `CONSOLIDATION_GUIDE.md`
- **Architecture Overview**: See `ARCHITECTURE.md`
- **AuthContext API**: See `src/context/AuthContext.js`
- **Login Flow**: See `src/pages/Login/Login.js`
