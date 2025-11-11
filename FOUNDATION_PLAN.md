# EntSnap Foundation Improvement & Feature Plan

**Branch:** `claude/changes-foundation-011CUppBN4AeD3xVA6XdJLRB`

**Created:** 2025-11-11

## Executive Summary

This document outlines a comprehensive plan to strengthen EntSnap's foundation by addressing critical issues identified in the code review while implementing new features for landowner polygons, campaigns, and project management.

---

## Phase 1: Foundation Fixes & Security (Priority: CRITICAL)

### 1.1 Security Hardening
- **Remove all hardcoded API keys** from source code
- Implement environment variable management
- Add sensitive files to .gitignore
- Implement secret rotation procedures

### 1.2 Build & Dependency Management
- **Resolve dependency conflicts** (remove need for `--force` flag)
- Update conflicting packages to compatible versions
- Implement package audit and security scanning
- Document minimum required Node.js version

### 1.3 Environment Configuration
- Create environment file templates with clear documentation
- Implement environment validation at app startup
- Add helpful error messages for missing configuration
- Create setup verification script

### 1.4 Error Handling & User Feedback
- Replace silent error handling with user notifications
- Implement centralized error handling service
- Add proper HTTP error interceptors
- Create user-friendly error messages (internationalized)

### 1.5 Code Quality & Type Safety
- Replace all `any` types with proper interfaces
- Create comprehensive TypeScript models
- Implement strict type checking
- Add ESLint rules for type safety

---

## Phase 2: Code Cleanup & Optimization (Priority: HIGH)

### 2.1 Remove Dead Code
- Delete all commented Firebase authentication code
- Remove deprecated methods marked "to remove"
- Clean up unused imports and variables
- Archive legacy code to documentation if needed

### 2.2 Logging & Debugging
- Replace console.log with proper logging service
- Implement log levels (debug, info, warn, error)
- Add production log filtering
- Create debug mode toggle

### 2.3 State Management
- Centralize user state management
- Implement single source of truth for auth state
- Add state synchronization between services
- Consider implementing NgRx or Akita for complex state

### 2.4 Performance Optimization
- Reduce network polling frequency (1s → 5s or event-based)
- Implement lazy loading for all routes
- Optimize bundle size (target < 2MB)
- Add image optimization and lazy loading

### 2.5 Input Validation
- Add form validation for all user inputs
- Implement backend validation models
- Add sanitization for user-generated content
- Create reusable validation directives

---

## Phase 3: New Features - Landowner Polygons

### 3.1 Polygon Management System

#### Backend Requirements
- **Polygon Data Model:**
  ```typescript
  interface LandownerPolygon {
    id: number;
    landowner_id: number;
    name: string;
    description: string;
    polygon_coordinates: LatLng[]; // GeoJSON format
    area_hectares: number;
    tree_count: number;
    status: 'active' | 'pending' | 'inactive';
    verification_status: 'verified' | 'unverified';
    created_at: Date;
    updated_at: Date;
  }
  ```

- **API Endpoints:**
  - `GET /api/v1/polygons` - Get all active polygons
  - `GET /api/v1/polygons/:id` - Get specific polygon
  - `GET /api/v1/polygons/:id/trees` - Get trees within polygon
  - `POST /api/v1/polygons` - Create new polygon (admin)
  - `PUT /api/v1/polygons/:id` - Update polygon (admin)
  - `DELETE /api/v1/polygons/:id` - Remove polygon (admin)

#### Frontend Implementation
- **Map Integration:**
  - Render polygons on Google Maps using Polygon API
  - Color-code polygons by status/verification
  - Add polygon click handlers for details
  - Show polygon info modal with:
    - Landowner name
    - Conservation area details
    - Number of trees registered
    - Contact information (if public)

- **Polygon Service:**
  ```typescript
  // src/app/services/polygon.service.ts
  class PolygonService {
    getPolygons(): Observable<LandownerPolygon[]>
    getPolygonById(id: number): Observable<LandownerPolygon>
    getTreesInPolygon(id: number): Observable<Report[]>
    renderPolygonsOnMap(map: google.maps.Map)
  }
  ```

- **UI Components:**
  - Polygon detail modal/pane
  - Polygon filter controls
  - Polygon legend on map
  - "View Trees in Area" action

---

## Phase 4: New Features - Campaigns & Projects

### 4.1 Campaign System (Campañas de Catastro y Concientización)

#### Data Models
```typescript
interface Campaign {
  id: number;
  type: 'cadastre' | 'awareness' | 'mixed';
  title: string;
  description: string;
  organization_name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';

  // Geographic scope
  region: {
    country: string;
    state?: string;
    city?: string;
    polygon_area?: LatLng[]; // Specific geographic boundary
    radius_km?: number; // For circular areas
    center?: LatLng;
  };

  // Campaign metrics
  target_tree_count: number;
  registered_tree_count: number;
  participant_count: number;

  // Timeline
  start_date: Date;
  end_date: Date;

  // Media
  banner_image: string;
  gallery_images: string[];

  // Participation
  participation_rules: string;
  rewards?: string; // Token rewards, recognition, etc.

  created_at: Date;
  updated_at: Date;
}
```

#### Features
- **Campaign Discovery:**
  - "Active Campaigns" page/tab
  - Location-based campaign filtering
  - Campaign detail view with participation info
  - Join/participate button

- **Campaign Participation:**
  - Link tree reports to campaigns
  - Campaign progress tracking
  - Participant leaderboard
  - Campaign badges/achievements

- **API Endpoints:**
  - `GET /api/v1/campaigns` - List active campaigns
  - `GET /api/v1/campaigns/:id` - Campaign details
  - `POST /api/v1/campaigns/:id/participate` - Join campaign
  - `GET /api/v1/campaigns/:id/participants` - List participants
  - `GET /api/v1/campaigns/:id/trees` - Trees registered in campaign
  - `GET /api/v1/campaigns/nearby?lat=X&lng=Y&radius=Z` - Nearby campaigns

### 4.2 Project System (Conservation, Educational, Reforestation)

#### Data Models
```typescript
enum ProjectType {
  CONSERVATION = 'conservation', // Proyectos de conservación
  EDUCATIONAL = 'educational',   // Proyectos educativos
  REFORESTATION = 'reforestation' // Ensayos de reforestación
}

interface Project {
  id: number;
  type: ProjectType;
  title: string;
  description: string;
  long_description: string;

  // Organization
  organization_name: string;
  organization_id: number;
  contact_email: string;
  website_url?: string;

  // Location
  location: {
    country: string;
    state: string;
    city: string;
    address: string;
    coordinates: LatLng;
    polygon_area?: LatLng[];
  };

  // Project goals
  status: 'planning' | 'active' | 'completed' | 'paused';
  target_tree_count: number;
  current_tree_count: number;
  adoption_capacity: number; // How many trees can be adopted
  adopted_tree_count: number;

  // Financial
  adoption_cost_per_tree?: number; // In USD or tokens
  total_budget?: number;
  funds_raised?: number;

  // Timeline
  start_date: Date;
  expected_end_date?: Date;
  actual_end_date?: Date;

  // Media
  cover_image: string;
  gallery_images: string[];
  video_url?: string;

  // Educational (for educational projects)
  educational_content?: {
    target_audience: string; // e.g., "Elementary students"
    curriculum_topics: string[];
    learning_objectives: string[];
  };

  // Reforestation (for reforestation projects)
  reforestation_details?: {
    species_planted: string[];
    planting_technique: string;
    survival_rate_target: number;
    monitoring_frequency: string;
  };

  created_at: Date;
  updated_at: Date;
}

interface TreeAdoption {
  id: number;
  project_id: number;
  tree_id: number; // Report ID
  user_id: number;
  adoption_date: Date;
  adoption_fee_paid: number;
  certificate_url?: string;
  status: 'active' | 'completed' | 'cancelled';
}
```

#### Features
- **Project Discovery:**
  - "Active Projects" page with filter by type
  - Map view showing project locations
  - Project detail page with full information
  - Search and filter (by location, type, organization)

- **Tree Adoption:**
  - Browse available trees for adoption within projects
  - Adopt tree with optional payment integration
  - View "My Adopted Trees" collection
  - Receive digital adoption certificate
  - Track adopted tree's growth (proof-of-life updates)
  - Adoption impact dashboard

- **Project Participation (Educational):**
  - Enroll in educational projects
  - Access learning materials
  - Participate in planting events
  - Track educational progress
  - Earn educational badges

- **API Endpoints:**
  ```
  # Projects
  GET  /api/v1/projects - List all projects (with filters)
  GET  /api/v1/projects/:id - Project details
  GET  /api/v1/projects/:id/trees - Trees in project
  GET  /api/v1/projects/nearby?lat=X&lng=Y&radius=Z - Nearby projects

  # Adoptions
  POST /api/v1/adoptions - Adopt a tree
  GET  /api/v1/adoptions/user/:userId - User's adoptions
  GET  /api/v1/adoptions/:id - Adoption details
  GET  /api/v1/adoptions/:id/certificate - Download certificate
  DELETE /api/v1/adoptions/:id - Cancel adoption

  # Project trees
  GET  /api/v1/projects/:id/trees/available - Trees available for adoption
  GET  /api/v1/projects/:id/statistics - Project statistics
  ```

---

## Phase 5: UI/UX Enhancements

### 5.1 New Pages & Components

#### Pages
1. **Campaigns Page** (`src/app/pages/campaigns/`)
   - List view of active campaigns
   - Campaign cards with progress indicators
   - Filter by location/type

2. **Campaign Detail Page** (`src/app/pages/campaign-detail/`)
   - Full campaign information
   - Participation button
   - Progress visualization
   - Participant list & leaderboard

3. **Projects Page** (`src/app/pages/projects/`)
   - Grid/list view of all projects
   - Filter by type (conservation/educational/reforestation)
   - Search functionality

4. **Project Detail Page** (`src/app/pages/project-detail/`)
   - Comprehensive project information
   - Photo gallery
   - Available trees for adoption
   - Adoption progress
   - Contact information

5. **My Adoptions Page** (`src/app/pages/my-adoptions/`)
   - List of adopted trees
   - Adoption certificates
   - Tree health updates
   - Impact metrics

6. **Polygon Info Modal** (`src/app/components/polygon-modal/`)
   - Landowner information
   - Conservation area details
   - Trees in area
   - Contact options

#### Components
1. **Campaign Card** (`src/app/components/campaign-card/`)
   - Reusable campaign display component
   - Progress bar
   - Quick actions

2. **Project Card** (`src/app/components/project-card/`)
   - Reusable project display component
   - Type badge
   - Adoption availability indicator

3. **Adoption Certificate** (`src/app/components/adoption-certificate/`)
   - Digital certificate display/download
   - QR code for verification
   - Social sharing

4. **Map Polygon Renderer** (`src/app/components/map-polygon/`)
   - Renders landowner polygons on map
   - Interactive polygon info
   - Color coding by status

### 5.2 Navigation Updates

**Tab Bar Additions:**
```typescript
// Update tabs.component.ts
tabs = [
  { path: 'home', icon: 'home', label: 'Home' },
  { path: 'tree', icon: 'leaf', label: 'Register' },
  { path: 'map', icon: 'map', label: 'Map' },
  { path: 'campaigns', icon: 'megaphone', label: 'Campaigns' }, // NEW
  { path: 'projects', icon: 'heart', label: 'Projects' }, // NEW
  { path: 'ents', icon: 'list', label: 'My Trees' },
  { path: 'profile', icon: 'person', label: 'Profile' }
]
```

---

## Phase 6: Backend Integration Preparation

### 6.1 API Service Extensions

```typescript
// src/app/services/polygon.service.ts
@Injectable({ providedIn: 'root' })
export class PolygonService {
  constructor(
    private http: HttpClient,
    private routes: routes,
    private authService: AuthService
  ) {}

  getPolygons(filters?: PolygonFilters): Observable<LandownerPolygon[]> {
    // Implementation
  }

  getPolygonById(id: number): Observable<LandownerPolygon> {
    // Implementation
  }

  getTreesInPolygon(polygonId: number): Observable<Report[]> {
    // Implementation
  }
}

// src/app/services/campaign.service.ts
@Injectable({ providedIn: 'root' })
export class CampaignService {
  constructor(
    private http: HttpClient,
    private routes: routes,
    private authService: AuthService
  ) {}

  getCampaigns(filters?: CampaignFilters): Observable<Campaign[]> {
    // Implementation
  }

  getCampaignById(id: number): Observable<Campaign> {
    // Implementation
  }

  participateInCampaign(campaignId: number): Observable<any> {
    // Implementation
  }

  getNearbyCampaigns(lat: number, lng: number, radius: number): Observable<Campaign[]> {
    // Implementation
  }
}

// src/app/services/project.service.ts
@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(
    private http: HttpClient,
    private routes: routes,
    private authService: AuthService
  ) {}

  getProjects(filters?: ProjectFilters): Observable<Project[]> {
    // Implementation
  }

  getProjectById(id: number): Observable<Project> {
    // Implementation
  }

  getProjectTrees(projectId: number): Observable<Report[]> {
    // Implementation
  }

  getAvailableTreesForAdoption(projectId: number): Observable<Report[]> {
    // Implementation
  }
}

// src/app/services/adoption.service.ts
@Injectable({ providedIn: 'root' })
export class AdoptionService {
  constructor(
    private http: HttpClient,
    private routes: routes,
    private authService: AuthService
  ) {}

  adoptTree(treeId: number, projectId: number, paymentInfo?: any): Observable<TreeAdoption> {
    // Implementation
  }

  getUserAdoptions(): Observable<TreeAdoption[]> {
    // Implementation
  }

  downloadCertificate(adoptionId: number): Observable<Blob> {
    // Implementation
  }

  cancelAdoption(adoptionId: number): Observable<any> {
    // Implementation
  }
}
```

### 6.2 Routes Service Extension

```typescript
// src/app/services/routes.ts
// Add new URL methods

polygonsUrl(): string {
  return this.getUrl("polygons");
}

campaignsUrl(): string {
  return this.getUrl("campaigns");
}

projectsUrl(): string {
  return this.getUrl("projects");
}

adoptionsUrl(): string {
  return this.getUrl("adoptions");
}
```

### 6.3 Environment Configuration

```typescript
// src/environments/environment.example.ts
// Add new API endpoints

api: {
  // ... existing endpoints
  polygons: 'api/v1/polygons',
  campaigns: 'api/v1/campaigns',
  projects: 'api/v1/projects',
  adoptions: 'api/v1/adoptions',
}
```

---

## Phase 7: Testing & Quality Assurance

### 7.1 Unit Testing
- Create unit tests for all new services
- Test polygon rendering logic
- Test campaign/project filtering
- Test adoption workflow

### 7.2 Integration Testing
- Test API integration for new endpoints
- Test map polygon rendering with real data
- Test campaign participation flow
- Test tree adoption flow end-to-end

### 7.3 E2E Testing
- User journey: Discover and join campaign
- User journey: Adopt a tree from project
- User journey: View landowner polygons
- User journey: Track adopted trees

---

## Implementation Roadmap

### Sprint 1: Foundation Fixes (2 weeks)
- [ ] Security hardening (remove API keys, env variables)
- [ ] Fix dependency conflicts
- [ ] Implement error handling service
- [ ] Remove dead code
- [ ] Replace console.log with logging service

### Sprint 2: Type Safety & Code Quality (1 week)
- [ ] Replace all `any` types
- [ ] Create comprehensive models
- [ ] Add input validation
- [ ] Implement state management improvements

### Sprint 3: Polygon Feature (2 weeks)
- [ ] Create polygon data models
- [ ] Implement polygon service
- [ ] Integrate polygons with map
- [ ] Create polygon info modal
- [ ] Test polygon rendering

### Sprint 4: Campaign System (2 weeks)
- [ ] Create campaign data models
- [ ] Implement campaign service
- [ ] Create campaigns page
- [ ] Create campaign detail page
- [ ] Implement participation flow
- [ ] Test campaign features

### Sprint 5: Project System (3 weeks)
- [ ] Create project data models
- [ ] Implement project service
- [ ] Create projects page
- [ ] Create project detail page
- [ ] Implement tree adoption flow
- [ ] Create adoption certificate generation
- [ ] Create "My Adoptions" page
- [ ] Test project & adoption features

### Sprint 6: Polish & Testing (1 week)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation updates
- [ ] Deployment preparation

---

## Success Metrics

### Technical Metrics
- ✅ Zero exposed API keys in source code
- ✅ All dependencies install without `--force`
- ✅ Bundle size < 2MB
- ✅ TypeScript strict mode enabled with zero errors
- ✅ Test coverage > 70%
- ✅ Zero console.log statements in production
- ✅ Lighthouse score > 90

### Feature Metrics
- ✅ Users can view and interact with landowner polygons
- ✅ Users can discover and join campaigns
- ✅ Users can browse and participate in projects
- ✅ Users can adopt trees and track them
- ✅ Digital certificates generated for adoptions
- ✅ All new features work on iOS and Android

### User Experience Metrics
- ✅ Campaign participation rate > 20%
- ✅ Tree adoption rate > 10%
- ✅ Polygon interaction rate > 30%
- ✅ User satisfaction score > 4.5/5
- ✅ App crash rate < 1%

---

## Next Steps

1. **Review this plan** with the team
2. **Create GitHub issues** from the provided templates
3. **Prioritize issues** based on business value
4. **Assign issues** to team members
5. **Begin Sprint 1** with foundation fixes
6. **Set up CI/CD** for automated testing and deployment
7. **Establish code review** process for all PRs

---

## Notes & Considerations

### Backend Coordination Required
- Confirm API endpoint specifications with backend team
- Establish data contracts for all new models
- Discuss authentication/authorization for new features
- Plan database migrations for new tables

### Payment Integration (for Tree Adoption)
- Determine payment provider (Stripe, PayPal, Web3 payment)
- Implement secure payment flow
- Handle payment failures and refunds
- Store payment records securely

### Certificate Generation
- Design certificate template
- Implement server-side or client-side generation
- Add QR code for verification
- Enable social media sharing

### Admin/Back-office Features
- Campaign creation and management interface needed
- Project creation and management interface needed
- Polygon creation and verification tools needed
- Analytics dashboard for all new features

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Maintained By:** Development Team
