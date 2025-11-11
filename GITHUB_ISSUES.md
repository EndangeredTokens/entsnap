# GitHub Issues for EntSnap Foundation & Features

This document contains all GitHub issue templates for the foundation improvement and new features plan. Copy each issue section and create it in GitHub.

---

## Foundation Fixes (Sprint 1)

### Issue #1: [CRITICAL] Remove Hardcoded API Keys and Implement Environment Variables

**Labels:** `security`, `critical`, `foundation`

**Description:**
Currently, sensitive API keys are hardcoded in source code files, creating a significant security vulnerability. This includes:
- Web3Auth Client ID in `web3.service.ts`
- Google OAuth credentials in `capacitor.config.ts`
- Weather API key in environment files

**Current State:**
```typescript
// src/app/services/web3.service.ts:5
const clientId = "BEvU1vWeozutjpKwBY8W62d_FgSMiH7I01YZmgfowLhuNdmqXLP2Co0wqEqyMl-ahpphLSzvYQaEEo7J5hwMnJo";

// capacitor.config.ts:11-16
serverClientId: '1008724758735-brrcb0261t1sbvl54t10issa13mcri20.apps.googleusercontent.com'
```

**Tasks:**
- [ ] Move all API keys to environment files
- [ ] Update `.gitignore` to exclude `environment.ts` and `environment.prod.ts`
- [ ] Create environment variable injection for Capacitor config
- [ ] Document environment setup in README
- [ ] Create environment validation script
- [ ] Rotate all exposed API keys
- [ ] Update CI/CD to use environment variables

**Acceptance Criteria:**
- Zero API keys or secrets in tracked source code
- All API keys loaded from environment variables
- Environment template files documented
- Build fails gracefully with clear error if keys missing
- Updated documentation for local development setup

**Files to Modify:**
- `src/app/services/web3.service.ts`
- `capacitor.config.ts`
- `src/environments/environment.example.ts`
- `src/environments/environment.prod.example.ts`
- `.gitignore`
- `README.md`

**Priority:** Critical
**Estimated Effort:** 3-4 hours

---

### Issue #2: [CRITICAL] Fix Dependency Conflicts - Remove Need for --force Flag

**Labels:** `build`, `critical`, `foundation`, `dependencies`

**Description:**
The project currently requires `npm install --force` to install dependencies due to peer dependency conflicts. This is a red flag indicating version incompatibilities that could cause runtime issues.

**Current State:**
```bash
npm install --force  # Required due to conflicts
# Results in UNMET DEPENDENCY warnings
```

**Tasks:**
- [ ] Audit all dependencies for version conflicts
- [ ] Update conflicting packages to compatible versions
- [ ] Test app functionality after dependency updates
- [ ] Update `package.json` with correct version ranges
- [ ] Remove `--force` requirement from README
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Document minimum Node.js version requirement
- [ ] Create `package-lock.json` integrity check

**Acceptance Criteria:**
- `npm install` completes without `--force` flag
- Zero UNMET DEPENDENCY warnings
- All dependencies have compatible versions
- App builds and runs successfully
- No new functionality breaks
- `npm audit` shows zero high/critical vulnerabilities

**Technical Notes:**
Focus on these known conflicting packages:
- Angular version (v17.0.2)
- Capacitor version (v5.6.0)
- Ionic version (v7.0.0)
- Web3 related packages

**Priority:** Critical
**Estimated Effort:** 4-6 hours

---

### Issue #3: [HIGH] Implement Centralized Error Handling Service

**Labels:** `enhancement`, `error-handling`, `foundation`, `ux`

**Description:**
Current error handling silently swallows errors and returns `null`, providing no feedback to users. Need to implement a centralized error handling service with user-facing notifications.

**Current Problem:**
```typescript
// src/app/services/auth.service.ts:209-215
private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
        console.log(`${operation} failed: ${error.message}`);
        this.logedIn = false;
        return of(result as T);  // ⚠️ Silently returns null
    };
}
```

**Tasks:**
- [ ] Create `ErrorHandlingService` with logging methods
- [ ] Create user notification service (toast/alert)
- [ ] Implement HTTP error interceptor
- [ ] Add error classification (network, auth, validation, server)
- [ ] Create internationalized error messages
- [ ] Update all services to use centralized error handling
- [ ] Add error reporting to external service (optional: Sentry)
- [ ] Create error recovery mechanisms where applicable

**Acceptance Criteria:**
- All HTTP errors show user-friendly messages
- Errors logged with proper context (timestamp, user, action)
- Network errors show offline indicator
- Auth errors redirect to login
- User can retry failed operations
- Error messages are internationalized
- Console errors removed from production builds

**Files to Create:**
- `src/app/services/error-handling.service.ts`
- `src/app/interceptors/http-error.interceptor.ts`
- `src/app/models/error.models.ts`
- `src/assets/i18n/errors/` (error messages)

**Files to Modify:**
- All service files with error handling
- `src/app/app.module.ts` (register interceptor)

**Priority:** High
**Estimated Effort:** 6-8 hours

---

### Issue #4: [HIGH] Remove All console.log and Implement Logging Service

**Labels:** `code-quality`, `foundation`, `performance`

**Description:**
The codebase contains hundreds of `console.log` statements that should not be in production code. Need to replace with a proper logging service that can be configured by environment.

**Current State:**
```typescript
// Found throughout codebase:
console.log('Starting login')
console.log('["report.service" - submitReport] reporte obtenido...')
console.log('[home.page][ionViewWillEnter]')
// ... hundreds more
```

**Tasks:**
- [ ] Create `LoggingService` with log levels (debug, info, warn, error)
- [ ] Implement environment-based log filtering
- [ ] Replace all `console.log` with logging service calls
- [ ] Add log prefixes/context (service name, method, timestamp)
- [ ] Implement log storage for debugging (optional)
- [ ] Add remote logging for production errors (optional)
- [ ] Create ESLint rule to prevent console.log
- [ ] Document logging best practices

**Acceptance Criteria:**
- Zero `console.log` statements in codebase
- Logging service properly filters logs by environment
- Debug logs only appear in development mode
- Error logs include full stack traces
- ESLint prevents new console.log additions
- Documentation explains how to add logs

**Files to Create:**
- `src/app/services/logging.service.ts`
- `.eslintrc.json` (add no-console rule)

**Files to Modify:**
- Every TypeScript file with console.log (scan entire codebase)

**Priority:** High
**Estimated Effort:** 4-6 hours

---

### Issue #5: [HIGH] Replace 'any' Types with Proper TypeScript Interfaces

**Labels:** `code-quality`, `typescript`, `foundation`

**Description:**
The codebase contains many `any` types that defeat TypeScript's type safety benefits. Need to create proper interfaces and types for all data structures.

**Current Issues:**
```typescript
// src/app/services/auth.service.ts:99
login(data: any): Observable<any>

// src/app/services/report.service.ts:160
extractReport(res: any): Report
```

**Tasks:**
- [ ] Audit codebase for all `any` types
- [ ] Create comprehensive interfaces for all API requests/responses
- [ ] Create models for all data structures
- [ ] Update service methods to use typed parameters
- [ ] Enable TypeScript strict mode
- [ ] Add generic type constraints where needed
- [ ] Update tests to use typed mocks
- [ ] Document all new interfaces

**Acceptance Criteria:**
- Zero `any` types in service layer
- All API interfaces properly typed
- TypeScript strict mode enabled
- No type-related compilation errors
- Autocomplete works for all API responses
- Type safety catches bugs at compile time

**Files to Create:**
- `src/app/models/api/` (directory for API interfaces)
- `src/app/models/api/auth.models.ts`
- `src/app/models/api/report.models.ts`
- `src/app/models/api/user.models.ts`

**Files to Modify:**
- All service files
- `tsconfig.json` (enable strict mode)

**Priority:** High
**Estimated Effort:** 8-10 hours

---

## Code Quality & Optimization (Sprint 2)

### Issue #6: [MEDIUM] Remove Dead Code and Commented-Out Sections

**Labels:** `code-quality`, `maintenance`, `foundation`

**Description:**
The codebase contains significant amounts of dead code, particularly commented-out Firebase authentication code and deprecated methods. This adds confusion and increases maintenance burden.

**Examples:**
```typescript
// src/app/services/auth.service.ts:238-317
// 80+ lines of commented Firebase code
// signInWithGoogle(): Promise<any> { ... }
// socialSignIn(): Promise<any> { ... }
```

**Tasks:**
- [ ] Identify all commented code sections
- [ ] Document any historical context if needed
- [ ] Remove all commented-out code
- [ ] Delete methods marked "To remove" or "should delete"
- [ ] Remove unused imports
- [ ] Remove unused variables
- [ ] Clean up empty interface implementations
- [ ] Update related documentation

**Acceptance Criteria:**
- Zero commented-out code blocks > 5 lines
- All methods marked for removal are deleted
- No unused imports or variables
- Git history preserved (don't force push)
- Documentation updated to reflect removals

**Files with Known Dead Code:**
- `src/app/services/auth.service.ts` (lines 238-317)
- `src/app/services/report.service.ts` (methods marked "To remove")
- `src/app/services/image.service.ts` (commented uploadPhoto method)

**Priority:** Medium
**Estimated Effort:** 3-4 hours

---

### Issue #7: [MEDIUM] Optimize Bundle Size - Target < 2MB

**Labels:** `performance`, `optimization`, `foundation`

**Description:**
Current build configuration allows up to 10MB bundle size, which is excessive for a mobile app. Need to optimize and reduce to < 2MB for better performance.

**Current State:**
```json
// angular.json:46
"maximumError": "10mb"  // Too large!
```

**Tasks:**
- [ ] Analyze current bundle size with `webpack-bundle-analyzer`
- [ ] Implement lazy loading for all routes
- [ ] Split vendor chunks intelligently
- [ ] Optimize images (use WebP, compression)
- [ ] Remove unused dependencies
- [ ] Tree-shake unused code
- [ ] Minify and compress production builds
- [ ] Update bundle size limits in angular.json
- [ ] Set up bundle size monitoring in CI

**Acceptance Criteria:**
- Production bundle size < 2MB (main + vendor)
- Lazy loading implemented for all feature modules
- All routes load in < 2 seconds on 3G
- Lighthouse performance score > 90
- No unused dependencies in package.json
- Bundle size tracking in CI/CD

**Tools:**
```bash
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

**Priority:** Medium
**Estimated Effort:** 6-8 hours

---

### Issue #8: [MEDIUM] Optimize Network Polling - Reduce From 1s to Event-Based

**Labels:** `performance`, `optimization`, `foundation`

**Description:**
Network status is currently polled every 1 second, which is excessive and drains battery. Should use event-based monitoring instead.

**Current Problem:**
```typescript
// src/app/services/auth.service.ts:71-76
interval(1000)  // Polls every second!
    .pipe(switchMap(() => this.checkNetworkStatus()))
    .subscribe((status) => {
        this.networkStatus = status;
    });
```

**Tasks:**
- [ ] Remove polling interval for network status
- [ ] Use only Capacitor Network event listener
- [ ] Implement exponential backoff for retry logic
- [ ] Add manual "retry" button for failed requests
- [ ] Test network status changes on real devices
- [ ] Verify battery impact improvement
- [ ] Update any other polling mechanisms found

**Acceptance Criteria:**
- Network status updates via events only (no polling)
- Battery usage reduced (test with Android Battery Historian)
- Network changes detected within 1 second
- App responds correctly to offline/online transitions
- Failed requests can be retried manually
- No unnecessary background network checks

**Files to Modify:**
- `src/app/services/auth.service.ts`

**Priority:** Medium
**Estimated Effort:** 2-3 hours

---

### Issue #9: [MEDIUM] Implement Input Validation for All Forms

**Labels:** `validation`, `security`, `ux`, `foundation`

**Description:**
Forms lack proper validation, allowing invalid data to be submitted to the backend. Need comprehensive client-side validation with user feedback.

**Current Problem:**
```typescript
// src/app/services/report.service.ts:48-59
submitReport(report: inputReport) {
    // No validation before submission
    if (!report.user_id)
        report.user_id = this.userService.getCurrentUser().id;
    return this.http.post<Report>(...);
}
```

**Tasks:**
- [ ] Create reusable validation directives
- [ ] Add validation to all form controls
- [ ] Implement custom validators (email, phone, etc.)
- [ ] Add real-time validation feedback
- [ ] Create validation error messages (internationalized)
- [ ] Validate on client before API calls
- [ ] Handle backend validation errors
- [ ] Add field-level help text

**Validation Rules Needed:**
- Email format
- Password strength (min length, complexity)
- Required fields
- Numeric ranges (lat/lng bounds, measurements)
- File size/type for images
- Text length limits

**Acceptance Criteria:**
- All forms have validation
- Invalid fields show clear error messages
- Form submission disabled until valid
- Backend errors displayed to user
- Validation messages internationalized
- No invalid data sent to backend

**Files to Create:**
- `src/app/validators/` (directory for custom validators)
- `src/app/directives/validation/` (validation directives)

**Files to Modify:**
- All form components (login, signup, report, profile)
- Service methods that submit data

**Priority:** Medium
**Estimated Effort:** 6-8 hours

---

### Issue #10: [LOW] Centralize User State Management

**Labels:** `architecture`, `state-management`, `foundation`

**Description:**
User data is currently stored in multiple locations (AuthService, UserService, localStorage) without a single source of truth. This leads to synchronization issues and bugs.

**Current Problem:**
- `AuthService.user`
- `UserService.getCurrentUser()`
- `localStorage.getItem('auth_token')`
- Inconsistent state updates

**Tasks:**
- [ ] Evaluate state management libraries (NgRx, Akita, or manual)
- [ ] Create centralized auth state store
- [ ] Implement state selectors for user data
- [ ] Create state actions (login, logout, update profile)
- [ ] Migrate all services to use centralized state
- [ ] Add state persistence (localStorage)
- [ ] Implement state debugging tools (dev mode)
- [ ] Document state management patterns

**Acceptance Criteria:**
- Single source of truth for user state
- All components get user data from state
- State persists across app restarts
- State updates propagate automatically
- Dev tools show state changes
- No direct localStorage access outside state service

**Recommendation:**
Consider **Akita** for lighter weight than NgRx but better structure than manual.

**Files to Create:**
- `src/app/state/` (state management directory)
- `src/app/state/auth.store.ts`
- `src/app/state/auth.query.ts`
- `src/app/state/auth.service.ts`

**Files to Modify:**
- All components/services accessing user data
- Remove duplicate user properties

**Priority:** Low (Nice to have)
**Estimated Effort:** 10-12 hours

---

## New Features - Polygons (Sprint 3)

### Issue #11: [FEATURE] Implement Landowner Polygon System - Data Models & API Integration

**Labels:** `feature`, `polygons`, `backend`, `api`

**Description:**
Create the data structures and API integration for landowner conservation polygons. Polygons represent geographic areas where landowners are actively preserving trees.

**Requirements:**
- Display polygons on map showing conservation areas
- Show landowner information (if public)
- Link trees to specific polygons
- Color-code by verification status

**Tasks:**
- [ ] Create TypeScript interfaces for polygon data
- [ ] Define API endpoint contracts with backend team
- [ ] Create PolygonService with CRUD operations
- [ ] Implement API calls (GET polygons, GET trees in polygon)
- [ ] Add polygon endpoints to routes service
- [ ] Create mock data for development
- [ ] Handle API errors gracefully
- [ ] Add loading states

**Data Model:**
```typescript
interface LandownerPolygon {
  id: number;
  landowner_id: number;
  name: string;
  description: string;
  polygon_coordinates: google.maps.LatLngLiteral[];
  area_hectares: number;
  tree_count: number;
  status: 'active' | 'pending' | 'inactive';
  verification_status: 'verified' | 'unverified';
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  created_at: Date;
  updated_at: Date;
}
```

**API Endpoints:**
```
GET  /api/v1/polygons
GET  /api/v1/polygons/:id
GET  /api/v1/polygons/:id/trees
```

**Acceptance Criteria:**
- PolygonService successfully fetches polygons from API
- Data model properly typed and validated
- API errors handled with user feedback
- Mock data available for development
- Unit tests for service methods
- API integration documented

**Files to Create:**
- `src/app/models/polygon.ts`
- `src/app/models/api/polygon.models.ts`
- `src/app/services/polygon.service.ts`

**Files to Modify:**
- `src/app/services/routes.ts`
- `src/environments/environment.example.ts`

**Dependencies:**
- Backend API endpoints must be ready
- Coordinate with backend team on data format

**Priority:** High
**Estimated Effort:** 6-8 hours

---

### Issue #12: [FEATURE] Render Landowner Polygons on Map

**Labels:** `feature`, `polygons`, `maps`, `ui`

**Description:**
Implement the rendering of landowner polygons on the Google Maps view with interactive features.

**Requirements:**
- Render polygons from API data
- Color-code by status/verification
- Make polygons clickable
- Show hover effects
- Display polygon legend

**Tasks:**
- [ ] Integrate polygon rendering with existing map service
- [ ] Implement polygon drawing using Google Maps Polygon API
- [ ] Add color coding logic (verified=green, pending=yellow, etc.)
- [ ] Make polygons clickable to show details
- [ ] Add hover states (highlight on hover)
- [ ] Create polygon legend component
- [ ] Implement polygon filtering (show/hide by status)
- [ ] Optimize rendering for many polygons
- [ ] Add polygon layer toggle
- [ ] Test on iOS and Android

**Color Scheme:**
```typescript
const POLYGON_COLORS = {
  verified_active: '#4CAF50',    // Green
  unverified_active: '#FFC107',  // Yellow
  pending: '#FF9800',            // Orange
  inactive: '#9E9E9E'            // Gray
};
```

**Acceptance Criteria:**
- Polygons render correctly on map
- Colors match verification/status
- Clicking polygon opens info modal
- Hover effect provides visual feedback
- Legend explains color coding
- Performance: renders 100+ polygons smoothly
- Works on both web and mobile

**Files to Modify:**
- `src/app/services/location.v2.service.ts`
- `src/app/pages/map/map.page.ts`
- `src/app/pages/map/map.page.html`
- `src/app/pages/map/map.page.scss`

**Files to Create:**
- `src/app/components/polygon-legend/polygon-legend.component.ts`
- `src/app/components/polygon-legend/polygon-legend.component.html`
- `src/app/components/polygon-legend/polygon-legend.component.scss`

**Dependencies:**
- Issue #11 (Polygon API integration)
- Google Maps API properly configured

**Priority:** High
**Estimated Effort:** 8-10 hours

---

### Issue #13: [FEATURE] Create Polygon Info Modal Component

**Labels:** `feature`, `polygons`, `ui`, `component`

**Description:**
Create a modal/pane component that displays detailed information about a landowner polygon when clicked on the map.

**Requirements:**
- Show landowner information
- Display polygon statistics
- List trees within polygon
- Show contact information (if available)
- Link to individual tree details

**Tasks:**
- [ ] Create PolygonModalComponent
- [ ] Design modal layout (similar to EntModalComponent)
- [ ] Display polygon metadata (name, area, tree count)
- [ ] Show landowner information
- [ ] List trees registered in polygon
- [ ] Add "View Tree" actions for each tree
- [ ] Implement swipeable pane (using cupertino-pane)
- [ ] Add close/dismiss functionality
- [ ] Make responsive for different screen sizes
- [ ] Add loading states

**Modal Content Sections:**
1. **Header:** Polygon name, verification badge
2. **Stats:** Area (hectares), Tree count, Status
3. **Description:** Conservation area details
4. **Landowner:** Name, contact info (if public)
5. **Trees:** List of registered trees in area
6. **Actions:** View all trees, Contact landowner

**Acceptance Criteria:**
- Modal opens when polygon clicked
- All polygon information displayed correctly
- Trees list scrollable
- Clicking tree opens tree detail view
- Modal dismisses on swipe down or backdrop click
- Smooth animations
- Works on iOS and Android

**Files to Create:**
- `src/app/components/polygon-modal/polygon-modal.component.ts`
- `src/app/components/polygon-modal/polygon-modal.component.html`
- `src/app/components/polygon-modal/polygon-modal.component.scss`
- `src/app/components/polygon-modal/polygon-modal.component.spec.ts`

**Files to Modify:**
- `src/app/pages/map/map.page.ts` (handle polygon clicks)
- `src/app/components/components.module.ts` (register component)

**Dependencies:**
- Issue #11 (Polygon API)
- Issue #12 (Polygon rendering)
- cupertino-pane library (already installed)

**Priority:** Medium
**Estimated Effort:** 6-8 hours

---

## New Features - Campaigns (Sprint 4)

### Issue #14: [FEATURE] Campaign System - Data Models & API Integration

**Labels:** `feature`, `campaigns`, `backend`, `api`

**Description:**
Implement the campaign system that allows users to discover and participate in local tree registration and awareness campaigns.

**Campaign Types:**
1. **Cadastre Campaigns** (Campañas de Catastro) - Focus on registering/cataloging trees in a region
2. **Awareness Campaigns** (Campañas de Concientización) - Education about endangered trees
3. **Mixed Campaigns** - Both cadastre and awareness

**Tasks:**
- [ ] Create Campaign TypeScript interfaces
- [ ] Define API contracts with backend
- [ ] Create CampaignService
- [ ] Implement campaign fetching (all, by ID, nearby)
- [ ] Implement participation flow
- [ ] Add campaign endpoints to routes service
- [ ] Create mock campaign data
- [ ] Handle errors and edge cases
- [ ] Add loading and empty states

**Data Model:**
```typescript
interface Campaign {
  id: number;
  type: 'cadastre' | 'awareness' | 'mixed';
  title: string;
  description: string;
  long_description: string;
  organization_name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';

  region: {
    country: string;
    state?: string;
    city?: string;
    polygon_area?: google.maps.LatLngLiteral[];
    radius_km?: number;
    center?: google.maps.LatLngLiteral;
  };

  target_tree_count: number;
  registered_tree_count: number;
  participant_count: number;

  start_date: Date;
  end_date: Date;

  banner_image: string;
  gallery_images: string[];

  participation_rules: string;
  rewards?: string;

  created_at: Date;
  updated_at: Date;
}

interface CampaignParticipation {
  id: number;
  campaign_id: number;
  user_id: number;
  joined_date: Date;
  trees_contributed: number;
  status: 'active' | 'completed';
}
```

**API Endpoints:**
```
GET  /api/v1/campaigns - List campaigns (with filters)
GET  /api/v1/campaigns/:id - Get campaign details
POST /api/v1/campaigns/:id/participate - Join campaign
GET  /api/v1/campaigns/:id/participants - List participants
GET  /api/v1/campaigns/:id/trees - Trees in campaign
GET  /api/v1/campaigns/nearby?lat=X&lng=Y&radius=Z - Nearby campaigns
```

**Acceptance Criteria:**
- CampaignService fetches campaigns successfully
- Participation flow works end-to-end
- Nearby campaigns calculated by location
- API errors handled gracefully
- Mock data for development
- Unit tests written
- Documentation complete

**Files to Create:**
- `src/app/models/campaign.ts`
- `src/app/models/api/campaign.models.ts`
- `src/app/services/campaign.service.ts`
- `src/app/services/campaign.service.spec.ts`

**Files to Modify:**
- `src/app/services/routes.ts`
- `src/environments/environment.example.ts`

**Dependencies:**
- Backend API endpoints ready
- User geolocation working

**Priority:** High
**Estimated Effort:** 8-10 hours

---

### Issue #15: [FEATURE] Create Campaigns List Page

**Labels:** `feature`, `campaigns`, `ui`, `page`

**Description:**
Create a page that displays all active campaigns with filtering and search capabilities.

**Requirements:**
- Display all active campaigns
- Filter by type (cadastre/awareness/mixed)
- Filter by location (nearby)
- Search by name
- Show campaign progress
- Navigate to campaign details

**Tasks:**
- [ ] Create campaigns page module and routing
- [ ] Create CampaignCardComponent for list items
- [ ] Implement campaign list view (grid or list)
- [ ] Add filter controls (type, location, status)
- [ ] Implement search functionality
- [ ] Show campaign progress bars
- [ ] Add pull-to-refresh
- [ ] Implement infinite scroll (if many campaigns)
- [ ] Add empty state (no campaigns)
- [ ] Add loading states
- [ ] Link to campaign detail page
- [ ] Test on mobile devices

**Campaign Card Display:**
- Campaign image/banner
- Title
- Organization name
- Progress bar (X of Y trees)
- Location (city, state)
- Time remaining (if applicable)
- "Join Campaign" button

**Acceptance Criteria:**
- All active campaigns displayed
- Filters work correctly
- Search filters campaigns in real-time
- Progress bars show correct percentages
- Cards navigate to detail page
- Pull-to-refresh updates list
- Empty state shows when no campaigns
- Works on iOS and Android

**Files to Create:**
- `src/app/pages/campaigns/campaigns.module.ts`
- `src/app/pages/campaigns/campaigns-routing.module.ts`
- `src/app/pages/campaigns/campaigns.page.ts`
- `src/app/pages/campaigns/campaigns.page.html`
- `src/app/pages/campaigns/campaigns.page.scss`
- `src/app/pages/campaigns/campaigns.page.spec.ts`
- `src/app/components/campaign-card/campaign-card.component.ts`
- `src/app/components/campaign-card/campaign-card.component.html`
- `src/app/components/campaign-card/campaign-card.component.scss`

**Files to Modify:**
- `src/app/app-routing.module.ts` (add campaigns route)
- `src/app/components/tabs/tabs.component.ts` (add campaigns tab)

**Dependencies:**
- Issue #14 (Campaign API)

**Priority:** High
**Estimated Effort:** 10-12 hours

---

### Issue #16: [FEATURE] Create Campaign Detail Page

**Labels:** `feature`, `campaigns`, `ui`, `page`

**Description:**
Create a detailed view for a single campaign with full information and participation functionality.

**Requirements:**
- Show full campaign details
- Display progress and statistics
- Show participant leaderboard
- Allow user to join campaign
- Show trees registered in campaign
- Display photo gallery

**Tasks:**
- [ ] Create campaign detail page module
- [ ] Implement detail page layout
- [ ] Display full campaign information
- [ ] Show campaign statistics (trees, participants)
- [ ] Create participant leaderboard component
- [ ] Implement "Join Campaign" action
- [ ] Show user's contribution (if participating)
- [ ] Display campaign photo gallery
- [ ] Link campaign to map (show campaign area)
- [ ] Show registered trees in campaign
- [ ] Add share campaign functionality
- [ ] Handle campaign states (active, completed, cancelled)
- [ ] Add loading and error states

**Page Sections:**
1. **Hero:** Banner image, title, organization
2. **Info:** Description, location, dates
3. **Progress:** Visual progress towards goal
4. **Stats:** Trees registered, participants, area covered
5. **Participate:** Join button, rules, rewards
6. **Leaderboard:** Top contributors
7. **Trees:** Map/list of registered trees
8. **Gallery:** Campaign photos

**Acceptance Criteria:**
- All campaign details displayed
- User can join campaign successfully
- Leaderboard shows top contributors
- Progress updates in real-time
- Gallery images viewable
- Share functionality works
- Responsive on all devices
- Back navigation works correctly

**Files to Create:**
- `src/app/pages/campaign-detail/campaign-detail.module.ts`
- `src/app/pages/campaign-detail/campaign-detail-routing.module.ts`
- `src/app/pages/campaign-detail/campaign-detail.page.ts`
- `src/app/pages/campaign-detail/campaign-detail.page.html`
- `src/app/pages/campaign-detail/campaign-detail.page.scss`
- `src/app/components/campaign-leaderboard/campaign-leaderboard.component.ts`
- `src/app/components/campaign-stats/campaign-stats.component.ts`

**Files to Modify:**
- `src/app/app-routing.module.ts` (add detail route)

**Dependencies:**
- Issue #14 (Campaign API)
- Issue #15 (Campaigns list page)

**Priority:** High
**Estimated Effort:** 10-12 hours

---

## New Features - Projects (Sprint 5)

### Issue #17: [FEATURE] Project System - Data Models & API Integration

**Labels:** `feature`, `projects`, `backend`, `api`

**Description:**
Implement the project system for conservation, educational, and reforestation projects with tree adoption functionality.

**Project Types:**
1. **Conservation Projects** (Proyectos de Conservación) - Preserve existing trees
2. **Educational Projects** (Proyectos Educativos) - Education + tree planting
3. **Reforestation Projects** (Ensayos de Reforestación) - Reforestation trials

**Tasks:**
- [ ] Create Project and TreeAdoption TypeScript interfaces
- [ ] Define API contracts with backend
- [ ] Create ProjectService
- [ ] Create AdoptionService
- [ ] Implement project CRUD operations
- [ ] Implement adoption flow (adopt, cancel, get certificate)
- [ ] Add endpoints to routes service
- [ ] Create mock data for all project types
- [ ] Handle payment integration (if required)
- [ ] Add comprehensive error handling
- [ ] Write unit tests

**Data Models:**
```typescript
enum ProjectType {
  CONSERVATION = 'conservation',
  EDUCATIONAL = 'educational',
  REFORESTATION = 'reforestation'
}

interface Project {
  id: number;
  type: ProjectType;
  title: string;
  description: string;
  long_description: string;

  organization_name: string;
  organization_id: number;
  contact_email: string;
  website_url?: string;

  location: {
    country: string;
    state: string;
    city: string;
    address: string;
    coordinates: google.maps.LatLngLiteral;
    polygon_area?: google.maps.LatLngLiteral[];
  };

  status: 'planning' | 'active' | 'completed' | 'paused';
  target_tree_count: number;
  current_tree_count: number;
  adoption_capacity: number;
  adopted_tree_count: number;

  adoption_cost_per_tree?: number;
  total_budget?: number;
  funds_raised?: number;

  start_date: Date;
  expected_end_date?: Date;

  cover_image: string;
  gallery_images: string[];
  video_url?: string;

  educational_content?: {
    target_audience: string;
    curriculum_topics: string[];
    learning_objectives: string[];
  };

  reforestation_details?: {
    species_planted: string[];
    planting_technique: string;
    survival_rate_target: number;
  };

  created_at: Date;
  updated_at: Date;
}

interface TreeAdoption {
  id: number;
  project_id: number;
  tree_id: number;
  user_id: number;
  adoption_date: Date;
  adoption_fee_paid: number;
  certificate_url?: string;
  status: 'active' | 'completed' | 'cancelled';
}
```

**API Endpoints:**
```
# Projects
GET  /api/v1/projects - List projects (with filters)
GET  /api/v1/projects/:id - Project details
GET  /api/v1/projects/:id/trees - Trees in project
GET  /api/v1/projects/:id/trees/available - Available for adoption
GET  /api/v1/projects/nearby?lat=X&lng=Y&radius=Z

# Adoptions
POST /api/v1/adoptions - Adopt a tree
GET  /api/v1/adoptions/user/:userId - User's adoptions
GET  /api/v1/adoptions/:id - Adoption details
GET  /api/v1/adoptions/:id/certificate - Certificate download
DELETE /api/v1/adoptions/:id - Cancel adoption
```

**Acceptance Criteria:**
- ProjectService fetches all project types
- AdoptionService handles full adoption flow
- API integration complete and tested
- Mock data covers all project types
- Error handling comprehensive
- Unit tests pass
- Documentation complete

**Files to Create:**
- `src/app/models/project.ts`
- `src/app/models/adoption.ts`
- `src/app/models/api/project.models.ts`
- `src/app/services/project.service.ts`
- `src/app/services/adoption.service.ts`
- `src/app/services/project.service.spec.ts`
- `src/app/services/adoption.service.spec.ts`

**Files to Modify:**
- `src/app/services/routes.ts`
- `src/environments/environment.example.ts`

**Dependencies:**
- Backend API endpoints
- Payment integration (if tree adoption costs money)

**Priority:** High
**Estimated Effort:** 10-12 hours

---

### Issue #18: [FEATURE] Create Projects List Page

**Labels:** `feature`, `projects`, `ui`, `page`

**Description:**
Create a page displaying all active projects with filtering by type and location.

**Requirements:**
- Display all projects
- Filter by type (conservation/educational/reforestation)
- Filter by location
- Search functionality
- Show project status and progress
- Navigate to project details

**Tasks:**
- [ ] Create projects page module and routing
- [ ] Create ProjectCardComponent
- [ ] Implement project list view
- [ ] Add filter controls (type, location, status)
- [ ] Add search functionality
- [ ] Show project type badges
- [ ] Display adoption availability
- [ ] Add pull-to-refresh
- [ ] Implement sorting (newest, most popular, etc.)
- [ ] Add empty state
- [ ] Link to project detail
- [ ] Test on all devices

**Project Card Display:**
- Project cover image
- Title and type badge
- Organization name
- Location
- Progress (trees planted/adopted)
- Adoption availability status
- "View Project" button

**Acceptance Criteria:**
- All projects displayed correctly
- Filters work for all types
- Search filters real-time
- Type badges color-coded
- Cards link to detail page
- Pull-to-refresh updates list
- Empty state for no projects
- Responsive design

**Files to Create:**
- `src/app/pages/projects/projects.module.ts`
- `src/app/pages/projects/projects-routing.module.ts`
- `src/app/pages/projects/projects.page.ts`
- `src/app/pages/projects/projects.page.html`
- `src/app/pages/projects/projects.page.scss`
- `src/app/components/project-card/project-card.component.ts`
- `src/app/components/project-card/project-card.component.html`
- `src/app/components/project-card/project-card.component.scss`

**Files to Modify:**
- `src/app/app-routing.module.ts`
- `src/app/components/tabs/tabs.component.ts` (add projects tab)

**Dependencies:**
- Issue #17 (Project API)

**Priority:** High
**Estimated Effort:** 10-12 hours

---

### Issue #19: [FEATURE] Create Project Detail Page with Adoption Flow

**Labels:** `feature`, `projects`, `ui`, `page`, `adoption`

**Description:**
Create detailed project view with tree adoption functionality and certificate generation.

**Requirements:**
- Show full project information
- Display available trees for adoption
- Allow tree adoption (with payment if required)
- Generate adoption certificates
- Show project progress and impact
- Display photo/video gallery

**Tasks:**
- [ ] Create project detail page module
- [ ] Design and implement page layout
- [ ] Display project information by type
- [ ] Show available trees for adoption
- [ ] Implement tree selection UI
- [ ] Create adoption confirmation flow
- [ ] Integrate payment (if required)
- [ ] Generate adoption certificate
- [ ] Show project photo/video gallery
- [ ] Display project location on mini-map
- [ ] Show similar projects
- [ ] Add share project functionality
- [ ] Handle all project states
- [ ] Add analytics tracking

**Page Sections:**
1. **Hero:** Cover image, title, type badge
2. **Info:** Description, organization, location
3. **Progress:** Visual progress, statistics
4. **Impact:** Trees planted, CO2 offset, etc.
5. **Adoption:** Available trees, adoption button
6. **Details:** Type-specific information
7. **Gallery:** Photos and videos
8. **Organization:** About, contact info

**Adoption Flow:**
1. User clicks "Adopt a Tree"
2. Select tree from available list
3. Review adoption details and cost
4. Process payment (if required)
5. Generate certificate
6. Confirmation with certificate download

**Acceptance Criteria:**
- All project types display correctly
- Tree adoption flow works end-to-end
- Certificate generated successfully
- Payment integration works (if applicable)
- Gallery functional with image viewer
- Map shows project location
- Share functionality works
- Responsive on all devices

**Files to Create:**
- `src/app/pages/project-detail/project-detail.module.ts`
- `src/app/pages/project-detail/project-detail-routing.module.ts`
- `src/app/pages/project-detail/project-detail.page.ts`
- `src/app/pages/project-detail/project-detail.page.html`
- `src/app/pages/project-detail/project-detail.page.scss`
- `src/app/components/adoption-flow/adoption-flow.component.ts`
- `src/app/components/project-gallery/project-gallery.component.ts`
- `src/app/components/project-stats/project-stats.component.ts`

**Files to Modify:**
- `src/app/app-routing.module.ts`

**Dependencies:**
- Issue #17 (Project API)
- Issue #18 (Projects list)
- Issue #20 (Certificate generation)
- Payment gateway integration (if required)

**Priority:** High
**Estimated Effort:** 14-16 hours

---

### Issue #20: [FEATURE] Create Adoption Certificate Component

**Labels:** `feature`, `adoption`, `ui`, `component`

**Description:**
Create a component that generates and displays digital adoption certificates for adopted trees.

**Requirements:**
- Generate visually appealing certificates
- Include QR code for verification
- Allow download as PDF/image
- Enable social media sharing
- Show adoption details (tree, project, date)

**Tasks:**
- [ ] Design certificate template
- [ ] Create CertificateComponent
- [ ] Implement certificate data rendering
- [ ] Generate QR code for verification
- [ ] Add certificate download (PDF)
- [ ] Add certificate download (image)
- [ ] Implement social sharing
- [ ] Add certificate verification lookup
- [ ] Create print-friendly version
- [ ] Handle missing data gracefully
- [ ] Add loading states

**Certificate Content:**
- EntSnap branding/logo
- "Certificate of Tree Adoption"
- Adopter name
- Tree ID and species
- Project name and location
- Adoption date
- Unique certificate ID
- QR code (links to verification)
- Organization signature
- Decorative border/design

**Technical Implementation:**
```typescript
@Component({
  selector: 'app-adoption-certificate',
  templateUrl: './adoption-certificate.component.html',
  styleUrls: ['./adoption-certificate.component.scss']
})
export class AdoptionCertificateComponent {
  @Input() adoption: TreeAdoption;
  @Input() tree: Report;
  @Input() project: Project;

  generateQRCode(): string { }
  downloadPDF(): void { }
  downloadImage(): void { }
  shareSocial(platform: string): void { }
}
```

**Libraries Needed:**
- `qrcode` or `ngx-qrcode` for QR generation
- `jspdf` or `html2canvas` for PDF generation

**Acceptance Criteria:**
- Certificate displays all adoption details
- QR code generates correctly
- PDF download works on all devices
- Image download works
- Social sharing functional
- Certificate looks professional
- Verification link works
- Print version formatted correctly

**Files to Create:**
- `src/app/components/adoption-certificate/adoption-certificate.component.ts`
- `src/app/components/adoption-certificate/adoption-certificate.component.html`
- `src/app/components/adoption-certificate/adoption-certificate.component.scss`
- `src/app/components/adoption-certificate/certificate-template.scss`

**Files to Modify:**
- `package.json` (add QR code and PDF libraries)
- `src/app/components/components.module.ts`

**Dependencies:**
- Issue #17 (Adoption API)
- QR code library
- PDF generation library

**Priority:** Medium
**Estimated Effort:** 8-10 hours

---

### Issue #21: [FEATURE] Create "My Adoptions" Page

**Labels:** `feature`, `adoption`, `ui`, `page`

**Description:**
Create a page where users can view and manage all their adopted trees.

**Requirements:**
- Display all user's adoptions
- Show adoption status (active/completed)
- Link to tree details
- Download certificates
- View proof-of-life updates
- See adoption impact metrics

**Tasks:**
- [ ] Create my-adoptions page module
- [ ] Implement adoptions list view
- [ ] Create AdoptionCardComponent
- [ ] Show adoption details (tree, project, date)
- [ ] Link to tree detail pages
- [ ] Add certificate download action
- [ ] Display proof-of-life updates for each tree
- [ ] Show aggregate impact metrics
- [ ] Add filter by project
- [ ] Add sort options (date, project, status)
- [ ] Implement empty state
- [ ] Add pull-to-refresh

**Adoption Card Display:**
- Tree photo
- Tree species and ID
- Project name
- Adoption date
- Status badge
- Certificate download button
- "View Tree" button
- Latest proof-of-life date

**Impact Dashboard:**
- Total trees adopted
- Total CO2 offset
- Total project contribution
- Adoption timeline

**Acceptance Criteria:**
- All adoptions displayed
- Certificates downloadable
- Links to tree details work
- Impact metrics calculated correctly
- Empty state for no adoptions
- Filters and sorting work
- Pull-to-refresh updates list
- Responsive design

**Files to Create:**
- `src/app/pages/my-adoptions/my-adoptions.module.ts`
- `src/app/pages/my-adoptions/my-adoptions-routing.module.ts`
- `src/app/pages/my-adoptions/my-adoptions.page.ts`
- `src/app/pages/my-adoptions/my-adoptions.page.html`
- `src/app/pages/my-adoptions/my-adoptions.page.scss`
- `src/app/components/adoption-card/adoption-card.component.ts`
- `src/app/components/adoption-impact-dashboard/adoption-impact-dashboard.component.ts`

**Files to Modify:**
- `src/app/app-routing.module.ts`
- `src/app/pages/profile/profile.page.html` (add link to My Adoptions)

**Dependencies:**
- Issue #17 (Adoption API)
- Issue #20 (Certificate component)

**Priority:** Medium
**Estimated Effort:** 8-10 hours

---

## Additional Issues

### Issue #22: [FEATURE] Update Navigation with New Tabs

**Labels:** `ui`, `navigation`, `feature`

**Description:**
Update the app's tab navigation to include new Campaigns and Projects tabs.

**Tasks:**
- [ ] Add Campaigns tab to navigation
- [ ] Add Projects tab to navigation
- [ ] Update tab icons
- [ ] Ensure proper routing
- [ ] Update active tab highlighting
- [ ] Test navigation flow
- [ ] Update internationalization for tab labels

**Tab Structure:**
```
Home | Register | Map | Campaigns | Projects | My Trees | Profile
```

Or consolidated:
```
Home | Register | Map | Discover | My Trees | Profile
  (where Discover shows Campaigns + Projects + Polygons)
```

**Acceptance Criteria:**
- New tabs appear in navigation
- Tabs route to correct pages
- Icons are intuitive
- Active state works correctly
- Works on all screen sizes

**Files to Modify:**
- `src/app/components/tabs/tabs.component.ts`
- `src/app/components/tabs/tabs.component.html`
- `src/app/app-routing.module.ts`

**Priority:** Medium
**Estimated Effort:** 2-3 hours

---

### Issue #23: [DOCUMENTATION] Create Technical Specification Documents

**Labels:** `documentation`, `specs`

**Description:**
Create comprehensive technical specification documents for all new features to guide development and serve as reference.

**Documents Needed:**
1. **Polygon System Spec** (polygon_spec.md)
2. **Campaign System Spec** (campaign_spec.md)
3. **Project System Spec** (project_spec.md)
4. **Adoption Flow Spec** (adoption_spec.md)
5. **API Integration Guide** (api_integration.md)

**Each spec should include:**
- Feature overview and purpose
- User stories
- Technical requirements
- Data models
- API endpoints
- UI/UX mockups or wireframes
- Acceptance criteria
- Testing requirements
- Edge cases and error handling

**Tasks:**
- [ ] Create docs/ directory
- [ ] Write Polygon System spec
- [ ] Write Campaign System spec
- [ ] Write Project System spec
- [ ] Write Adoption Flow spec
- [ ] Write API Integration guide
- [ ] Add architecture diagrams
- [ ] Document data flows
- [ ] Review with team

**Acceptance Criteria:**
- All specs complete and detailed
- Diagrams included where helpful
- Backend team reviewed and approved
- Specs stored in repository
- Easy to understand for new developers

**Files to Create:**
- `docs/specs/polygon_system.md`
- `docs/specs/campaign_system.md`
- `docs/specs/project_system.md`
- `docs/specs/adoption_flow.md`
- `docs/api_integration.md`
- `docs/architecture/data_flow.md`

**Priority:** Medium
**Estimated Effort:** 6-8 hours

---

## Summary

**Total Issues Created:** 23

### By Priority:
- **Critical:** 2 issues (Security, Dependencies)
- **High:** 11 issues (Foundation + New Features)
- **Medium:** 9 issues (Optimization + UI)
- **Low:** 1 issue (State Management)

### By Category:
- **Foundation Fixes:** 10 issues
- **Polygon Features:** 3 issues
- **Campaign Features:** 3 issues
- **Project Features:** 5 issues
- **Infrastructure:** 2 issues

### Total Estimated Effort:
- **Sprint 1 (Foundation):** ~30 hours (2 weeks)
- **Sprint 2 (Code Quality):** ~25 hours (1 week)
- **Sprint 3 (Polygons):** ~22 hours (2 weeks)
- **Sprint 4 (Campaigns):** ~32 hours (2 weeks)
- **Sprint 5 (Projects):** ~50 hours (3 weeks)
- **Sprint 6 (Polish):** ~20 hours (1 week)

**Total:** ~179 hours / ~11 weeks

---

## How to Create These Issues in GitHub

1. Go to your repository: `https://github.com/EndangeredTokens/entsnap`
2. Click "Issues" tab
3. Click "New Issue"
4. Copy the title and description from each issue above
5. Add the specified labels
6. Assign to team members as appropriate
7. Add to project board if using GitHub Projects
8. Link related issues using "#" references

Alternatively, you can use GitHub's bulk issue import feature or the GitHub CLI if available.

---

**Next Steps:**
1. Review and approve this plan
2. Create all issues in GitHub
3. Prioritize issues in project board
4. Begin Sprint 1 (Foundation Fixes)
5. Hold daily standups to track progress
6. Conduct sprint reviews and retrospectives
