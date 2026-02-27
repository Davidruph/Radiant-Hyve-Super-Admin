# Migration Guide: Single Consolidated Login System

## For Your Development Team

This guide helps your team understand and work with the new unified authentication system.

---

## 🎓 Understanding the New System

### What Changed?

#### Before

```
SuperAdmin         SchoolAdmin
    ↓                  ↓
/super_admin/login  /school_admin/login
    ↓                  ↓
Different logic    Different logic
    ↓                  ↓
Different routes   Different routes
```

#### After

```
All Users
    ↓
/login (Single endpoint)
    ↓
API returns role: "super_admin" or "school_admin"
    ↓
AuthContext detects role
    ↓
Routes based on role (same component, different paths)
```

### Key Concepts

**AuthContext**

- Manages authentication state globally
- Available via `useAuth()` hook
- Persists data in localStorage
- Handles login/logout

**useAuth() Hook**

```javascript
const {
  user,              // Current user object
  role,              // 'super_admin' or 'school_admin'
  token,             // Auth token
  isAuthenticated,   // Boolean
  isSuperAdmin,      // Boolean
  isSchoolAdmin,     // Boolean
  login(),           // Store auth data
  logout()           // Clear auth data
} = useAuth();
```

**PrivateRoute**

- Wraps protected pages
- Checks if user is authenticated
- Optionally checks if user has required role
- Redirects unauthorized users

---

## 👨‍💻 Developer Workflow

### Checking User Role

#### Method 1: In Components (Recommended)

```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { role, isSuperAdmin, isSchoolAdmin } = useAuth();

  // Use these values for conditional rendering
}
```

#### Method 2: In localStorage (Backup/Debugging)

```javascript
const userRole = localStorage.getItem("user-role");
// Returns: 'super_admin' or 'school_admin'
```

### Creating Role-Specific Components

```javascript
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { isSuperAdmin, isSchoolAdmin } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      {isSuperAdmin && (
        <div>
          <h2>System Overview</h2>
          {/* SuperAdmin-specific content */}
        </div>
      )}

      {isSchoolAdmin && (
        <div>
          <h2>School Overview</h2>
          {/* SchoolAdmin-specific content */}
        </div>
      )}
    </div>
  );
}
```

### Creating Role-Specific Routes

```javascript
// In allRoutes.js
export const privateRouters = [
  // Available to both roles
  { path: "/dashboard", element: <Dashboard /> },

  // SuperAdmin only
  { path: "/super_admin/manage_school", element: <ManageSchool /> },

  // SchoolAdmin only
  { path: "/school_admin/staff", element: <Staff /> }
];

// Then in Router.js, use PrivateRoute with requiredRole:
<PrivateRoute requiredRole="super_admin">
  <ManageSchool />
</PrivateRoute>;
```

### Handling Logout

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Does everything:
    // - Clears localStorage
    // - Resets context state
    // - No manual cleanup needed
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 🔧 Common Tasks

### Task 1: Show Role-Specific Menu Items

```javascript
function Sidebar() {
  const { isSuperAdmin, isSchoolAdmin } = useAuth();

  return (
    <nav>
      {/* Common items */}
      <Link to="/dashboard">Dashboard</Link>

      {/* Conditional items */}
      {isSuperAdmin && (
        <>
          <Link to="/super_admin/manage_school">Manage Schools</Link>
          <Link to="/super_admin/subscription_service">Subscriptions</Link>
        </>
      )}

      {isSchoolAdmin && (
        <>
          <Link to="/school_admin/staff">Staff</Link>
          <Link to="/school_admin/student">Students</Link>
        </>
      )}
    </nav>
  );
}
```

### Task 2: Display User Info in Header

```javascript
function Header() {
  const { user, role } = useAuth();

  const getRoleLabel = () => {
    return role === "super_admin"
      ? "Super Administrator"
      : "School Administrator";
  };

  return (
    <header>
      <span>{user?.name}</span>
      <span>{getRoleLabel()}</span>
    </header>
  );
}
```

### Task 3: Fetch Role-Specific Data

```javascript
import { useAuth } from "../context/AuthContext";

function getData() {
  const { role } = useAuth();

  const endpoint =
    role === "super_admin" ? "/api/super_admin/data" : "/api/school_admin/data";

  return fetch(endpoint);
}
```

### Task 4: Protect a Page

```javascript
import { PrivateRoute } from "../router/privateRoute";

// In your routes:
<Route
  path="/super_admin/manage_school"
  element={
    <PrivateRoute requiredRole="super_admin">
      <ManageSchool />
    </PrivateRoute>
  }
/>;
```

### Task 5: Disable Buttons Based on Role

```javascript
function StudentTable() {
  const { isSchoolAdmin } = useAuth();

  return (
    <table>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.name}</td>
            <td>
              <button>View</button>

              {/* Only SchoolAdmins can edit */}
              {isSchoolAdmin && (
                <>
                  <button>Edit</button>
                  <button>Delete</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't

```javascript
// Don't hardcode role checks
if (localStorage.getItem("user-role") === "super_admin") {
  // ...
}

// Don't forget to use useAuth() hook in functional components
const role = null; // Wrong!

// Don't navigate without logging out
navigate("/login"); // User data still in state!

// Don't create multiple AuthProviders
<AuthProvider>
  <AuthProvider>
    {" "}
    {/* Wrong! */}
    <App />
  </AuthProvider>
</AuthProvider>;
```

### ✅ Do

```javascript
// Do use useAuth() hook
const { role, isSuperAdmin } = useAuth();

// Do use logout() when navigating away
const handleLogout = () => {
  logout();
  navigate("/login");
};

// Do check role in components
{
  isSuperAdmin && <AdminPanel />;
}

// Do use PrivateRoute for protection
<PrivateRoute requiredRole="super_admin">
  <Page />
</PrivateRoute>;
```

---

## 📋 Testing Scenarios for Your Team

### Scenario A: SuperAdmin User

```
1. Go to /login
2. Login with SuperAdmin account
3. Should see "Welcome back, Super Administrator!"
4. Should be on /super_admin/dashboard
5. Sidebar should show SuperAdmin menu items
6. Try accessing /school_admin/staff → should redirect to /super_admin/dashboard
```

### Scenario B: SchoolAdmin User

```
1. Go to /login (or logout first)
2. Login with SchoolAdmin account
3. Should see "Welcome back, School Administrator!"
4. Should be on /school_admin/dashboard
5. Sidebar should show SchoolAdmin menu items
6. Try accessing /super_admin/manage_school → should redirect to /school_admin/dashboard
```

### Scenario C: Session Persistence

```
1. Login as any user
2. Refresh the page (F5)
3. Should NOT redirect to login
4. Should stay on same dashboard
5. All user info should be preserved
```

### Scenario D: Logout

```
1. Login as any user
2. Click logout button
3. Should redirect to /login
4. localStorage should be empty
5. Try accessing dashboard → should redirect to login
```

---

## 🔍 Debugging Tips

### Check Current Auth State

```javascript
// In browser console:
const { useAuth } = require("./context/AuthContext");
const auth = useAuth();
console.log("Current auth:", auth);
```

### Check LocalStorage

```javascript
// In browser console:
console.log("Token:", localStorage.getItem("radiant-admin-token"));
console.log("Role:", localStorage.getItem("user-role"));
console.log("User:", localStorage.getItem("user-data"));
```

### Check API Response

```javascript
// Add to Login.js handleSubmit:
loginApi(obj).then((res) => {
  console.log("API Response:", res.data);
  console.log("Role from API:", res.data.data.role);
  // ... rest of code
});
```

### Add Logging to useAuth Hook

```javascript
// In AuthContext.js, add:
useEffect(() => {
  console.log("Auth state changed:", { token, role, user });
}, [token, role, user]);
```

---

## 📞 FAQ for Team

**Q: Where do I check the user's role?**
A: Use `const { role } = useAuth()` in any component. Available in all hooks, useEffect, event handlers, etc.

**Q: How do I protect a page from unauthorized users?**
A: Wrap the page with `<PrivateRoute requiredRole="super_admin">`. PrivateRoute handles the auth check.

**Q: What if a user refreshes the page?**
A: AuthContext automatically restores the session from localStorage. Users won't be logged out.

**Q: Can I logout without the logout() function?**
A: No - it's the proper way to clear all state. Using logout() ensures everything is cleaned up.

**Q: What if the API doesn't return a role field?**
A: Update Login.js to detect role from another field (email domain, custom logic, etc.).

**Q: Can users access the old `/super_admin/login` path?**
A: Yes! It still works. All paths redirect to the same unified system.

**Q: How do I add a new role?**
A: Update API to return the new role, then add conditional logic: `if (role === 'new_role') { ... }`

**Q: Where is the user data stored?**
A: In context (via useAuth()) and in localStorage (user-data). They're kept in sync.

---

## 🎯 Next Steps for Your Team

1. **Learn the System**
   - Read QUICK_START.md (5 minutes)
   - Review ARCHITECTURE.md (understand the flow)

2. **Implement Features**
   - Use examples from EXAMPLE_USAGE.md
   - Update Sidebar with role-based menus
   - Update Header with user info

3. **Test Thoroughly**
   - Follow scenarios in CHECKLIST.md
   - Test both user roles
   - Test session persistence

4. **Deploy Confidently**
   - Run all tests
   - Verify all checklist items
   - Deploy to staging first

---

## 📚 Documentation Reference

| Need Help With  | Read This              |
| --------------- | ---------------------- |
| Getting started | QUICK_START.md         |
| Detailed guide  | CONSOLIDATION_GUIDE.md |
| System design   | ARCHITECTURE.md        |
| Code examples   | EXAMPLE_USAGE.md       |
| Testing         | CHECKLIST.md           |
| Team training   | This file              |

---

## 🚀 Ready to Code!

Your team is now ready to work with the unified authentication system. Remember:

- ✅ Use `useAuth()` for role checks
- ✅ Use `logout()` for logout
- ✅ Use `PrivateRoute` for protection
- ✅ Keep localStorage keys consistent
- ✅ Document any new role-based features

**Happy coding! 🎉**
