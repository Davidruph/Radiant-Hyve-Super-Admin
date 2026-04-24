# Quick Start Guide - Driver Dashboard

## 🚀 Getting Started

### For Drivers

1. Navigate to: `http://localhost:3000/driver/dashboard`
2. View your assigned routes
3. Click "Start Route" on a route
4. Complete pre-start safety checklist
5. Execute pickups and dropoffs
6. Confirm end-of-route safety check

### For Admins

1. Navigate to: `http://localhost:3000/school_admin/transportation`
2. View Dashboard tab for live monitoring
3. Use Vehicle, Driver, Route tabs for management
4. Monitor exceptions and live route status

## 📁 File Structure

```
Radiant Hyve Super Admin/
├── src/
│   ├── pages/
│   │   ├── driver/                           # NEW: Driver section
│   │   │   ├── DriverLayout.js               # Driver header & layout
│   │   │   └── Dashboard/
│   │   │       ├── Index.js                  # Entry point
│   │   │       └── RouteExecution.js         # Main driver interface (784 lines)
│   │   │
│   │   ├── admin/
│   │   │   └── Transportation/
│   │   │       ├── Index.js                  # UPDATED: Added Dashboard tab
│   │   │       ├── Dashboard.js              # NEW: Live monitoring
│   │   │       ├── Vehicle.js                # Vehicle management
│   │   │       ├── Driver.js                 # Driver management
│   │   │       └── Route.js                  # Route creation
│   │   │
│   │   ├── login/
│   │   ├── super_admin/
│   │   └── ...
│   │
│   ├── router/
│   │   └── allRoutes.js                      # UPDATED: Added driver route
│   │
│   ├── services/
│   │   └── api_services.js                   # API calls (already has transport methods)
│   │
│   └── ...
│
├── DRIVER_DASHBOARD_IMPLEMENTATION.md        # NEW: Comprehensive docs
├── ADMIN_vs_DRIVER_COMPARISON.md             # NEW: Architecture comparison
└── ...
```

## 🎨 Styling Components Used

All components use consistent Tailwind CSS styling:

### Buttons

```javascript
// Primary action
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
  Start Route
</button>

// Success action
<button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition">
  Pickup
</button>

// Danger action
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">
  End Route
</button>

// Secondary action
<button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition">
  Cancel
</button>
```

### Form Inputs

```javascript
<input
  type="text"
  placeholder="Enter value..."
  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<textarea
  placeholder="Enter details..."
  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
  <input type="radio" name="group" value="option" className="w-4 h-4" />
  <span className="text-gray-700 font-medium">Option Label</span>
</label>
```

### Modals

```javascript
<Dialog show={showModal} setShow={setShowModal} title="Modal Title">
  <div className="p-4 space-y-4">
    {/* Modal content */}
    <div className="flex space-x-3 mt-6">
      <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
        Confirm
      </button>
      <button className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium">
        Cancel
      </button>
    </div>
  </div>
</Dialog>
```

### Status Badges

```javascript
<span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  Picked Up
</span>

<span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  Pending Pickup
</span>

<span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
  Absent
</span>

<span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
  Skipped
</span>
```

### Cards

```javascript
<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition">
  <p className="text-gray-600 text-sm">Card Title</p>
  <p className="text-2xl font-bold text-gray-800 mt-1">Value</p>
</div>
```

## 📊 Key Features

### Driver Dashboard Features

✅ Route Selection - All assigned scheduled routes visible  
✅ Pre-Start Safety - Mandatory checklist before activation  
✅ Live Tracking - Real-time student status updates  
✅ Pickup Flow - Status selection with skip reason  
✅ Dropoff Flow - Recipient validation and handoff  
✅ Safety Check - Mandatory vehicle check before completion

### Admin Dashboard Features

✅ Live Monitoring - Real-time route status  
✅ Metrics Dashboard - 6 key performance indicators  
✅ Route Details - Expandable student information  
✅ Exception Tracking - All exceptions with severity  
✅ Search & Filter - Find routes quickly  
✅ Refresh Control - Manual data refresh

## 🔐 Authentication

### Driver Login

- Use existing login system with role: `driver`
- Routes to `/driver/dashboard` (driver-specific)
- Header shows logout button
- Session managed via token in localStorage

### Admin Login

- Use existing admin login with role: `school_admin` or `super_admin`
- Routes to `/school_admin/transportation` (admin-specific)
- Can access all transportation management features

## 🔗 API Endpoints Used

### Driver Operations

```
POST /api/transport/routes/start       - Start a route
PUT /api/transport/pickup/update       - Update pickup status
PUT /api/transport/dropoff/complete    - Complete dropoff
PUT /api/transport/routes/end          - End route
GET /api/transport/routes              - Get assigned routes
```

### Admin Operations

```
GET /api/transport/routes              - Get all routes
GET /api/transport/logs                - Get event logs
GET /api/transport/exceptions          - Get exceptions
POST /api/transport/vehicles           - Add vehicle
GET /api/transport/vehicles            - Get vehicles
POST /api/transport/routes             - Create route
```

## ✨ Styling Consistency Checklist

Before creating new components, ensure:

- [ ] Buttons match color scheme (blue/green/red/gray)
- [ ] Inputs use border-gray-300 with blue focus ring
- [ ] Modals use Dialog base-component
- [ ] Status badges use correct color combinations
- [ ] Cards use white bg with gray-200 border
- [ ] Icons from react-icons/fi library
- [ ] Spacing consistent (p-4, p-6 for sections; space-y-4 for forms)
- [ ] Hover effects applied (hover:shadow-lg, hover:bg-gray-50)
- [ ] Transitions smooth (transition class)
- [ ] Responsive design (grid/flex with responsive breakpoints)

## 🧪 Testing the Implementation

### Test Driver Workflow

```
1. Login as driver role
2. Navigate to /driver/dashboard
3. Select a scheduled route
4. Complete pre-start checklist
5. Update first student to "Picked Up"
6. Select student for dropoff
7. Enter recipient details
8. Mark all students as picked up/dropped off
9. Check final vehicle check box
10. End route
11. Verify route back at selection phase
```

### Test Admin Monitoring

```
1. Login as admin
2. Go to /school_admin/transportation
3. Click Dashboard tab
4. Verify all metrics display
5. Search for a route
6. Filter by status
7. Click route to expand details
8. View student status list
9. Check exception logs
10. Refresh data
```

## 📝 Code Examples

### Adding a new button with correct styling

```javascript
<button
  onClick={handleAction}
  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
>
  Action Text
</button>
```

### Adding a new form input

```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Field Label
  </label>
  <input
    type="text"
    name="fieldName"
    placeholder="Enter value..."
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
```

### Adding a modal

```javascript
<Dialog
  show={showModal}
  setShow={setShowModal}
  title="Modal Title"
  onClose={() => setShowModal(false)}
>
  <div className="p-4 space-y-4">{/* Modal content */}</div>
</Dialog>
```

## 🐛 Troubleshooting

| Issue                    | Solution                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| Driver route not showing | Verify driver role in database, check route status is "scheduled"   |
| Styling looks different  | Check Tailwind CSS is compiled, no custom CSS overriding classes    |
| Modal not appearing      | Ensure Dialog component imported, show state set to true            |
| API calls failing        | Check token in localStorage, verify API base URL, check network tab |
| Search not working       | Verify debounce is working (500ms delay), check filter logic        |
| Buttons not responsive   | Check flex classes, ensure w-full on full-width buttons             |

## 📞 Support

For issues or questions:

1. Check console for error messages
2. Review DRIVER_DASHBOARD_IMPLEMENTATION.md
3. Check ADMIN_vs_DRIVER_COMPARISON.md
4. Review existing component implementations (Vehicle.js, Driver.js)
5. Check API endpoint definitions in backend

---

**Last Updated:** April 24, 2026
**Version:** 1.0
**Status:** ✅ Complete & Ready for Testing
