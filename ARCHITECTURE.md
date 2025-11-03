# Architecture

This document describes the technical architecture of the Register of placement schools prototype.

## Overview

The prototype is built using the [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/), which provides a Node.js and Express.js based framework for rapidly prototyping government services.

## Technology stack

### Core framework

- **GOV.UK Prototype Kit** (v13.18.1) - Base framework
- **GOV.UK Frontend** (v5.13.0) - Design system components and styling
- **Node.js** (v22.x) - JavaScript runtime
- **Express.js** - Web application framework

### Database

- **Sequelize** (v6.37.7) - ORM (Object-Relational Mapping)
- **SQLite3** (v5.1.7) - Database engine for local development
- **Sequelize CLI** - Database migrations and seeding

### Authentication

- **Passport.js** (v0.7.0) - Authentication middleware
- **Passport Local** (v1.0.0) - Local username/password strategy
- **bcrypt** (v6.0.0) - Password hashing
- **express-session** (v1.18.2) - Session management

### Template engine

- **Nunjucks** - Template rendering (via GOV.UK Prototype Kit)

### External APIs

- **Ordnance Survey Places API** - Address lookup functionality
- **Google Maps API** - Mapping and location services

### Utilities

- **Luxon** (v3.7.2) - Date and time manipulation
- **UUID** (v13.0.0) - Unique identifier generation
- **csv-parse** (v6.1.0) - CSV data parsing
- **marked** (v16.4.1) - Markdown rendering

## Application structure

```
app/
├── assets/
│   └── javascripts/       # Client-side JavaScript
│       ├── components/    # Interactive components (checkbox-filter, filter-toggle)
│       └── vendor/        # Third-party libraries (accessible-autocomplete)
├── config/
│   └── passport.js        # Passport authentication configuration
├── constants/
│   └── revisionFields.js  # Configuration for revision tracking
├── controllers/           # Request handlers
│   ├── authentication.js  # Login/logout logic
│   ├── content.js         # Content page controllers
│   ├── error.js           # Error handling
│   ├── feedback.js        # Feedback form
│   ├── search.js          # Search functionality
│   └── support/           # Support interface controllers
├── database/
│   └── config.json        # Database configuration
├── filters.js             # Nunjucks template filters
├── helpers/               # Utility functions
│   ├── academicYear.js    # Academic year calculations
│   ├── content.js         # Content helpers
│   ├── date.js            # Date formatting
│   ├── gias.js            # GIAS data helpers
│   ├── pagination.js      # Pagination logic
│   ├── search.js          # Search helpers
│   ├── string.js          # String manipulation
│   └── validation.js      # Form validation
├── hooks/                 # Sequelize lifecycle hooks
│   ├── activityHook.js    # Activity logging
│   └── revisionHook.js    # Data versioning
├── migrations/            # Database schema migrations
├── models/                # Sequelize data models
│   ├── user.js            # User accounts
│   ├── school.js          # School records
│   ├── placementSchool.js # Placement school associations
│   ├── provider.js        # Training providers
│   └── ...                # Reference data models
├── routes.js              # Application route definitions
├── seeders/               # Database seed data
│   └── helpers/           # Seed data utilities
├── services/              # Business logic services
│   ├── googleMaps.js      # Google Maps integration
│   └── placementSchoolSearch.js # Search service
└── utils/
    └── activityLogger.js  # Activity logging utility
```

## Key architectural patterns

### MVC Pattern

The application follows a Model-View-Controller (MVC) pattern:

- **Models**: Sequelize models in `app/models/` define data structure and relationships
- **Views**: Nunjucks templates render HTML (not shown in structure above, typically in `app/views/`)
- **Controllers**: Request handlers in `app/controllers/` process user input and coordinate responses

### Data layer

#### Database models

The application uses several key models:

- **User**: User accounts with authentication
- **School**: School master data
- **SchoolDetail**: Extended school information
- **SchoolAddress**: School location data
- **PlacementSchool**: Schools available for teacher training placements
- **Provider**: Initial teacher training providers
- **AcademicYear**: Academic year reference data
- **Reference Data Models**: Various lookup tables (school types, statuses, education phases, etc.)

#### Migrations and seeding

- Database schema is managed through Sequelize migrations in `app/migrations/`
- Initial data is populated via seeders in `app/seeders/`
- Run `npm run db:build` to migrate and seed the database

#### Revision tracking

The application implements data versioning:

- Changes to user records are tracked in `UserRevision` model
- Activity logging captures user actions via hooks
- Revision hooks automatically create snapshots on data changes

### Authentication flow

1. User submits credentials via login form
2. Passport.js validates against User model
3. bcrypt verifies hashed password
4. express-session maintains authenticated state
5. Routes are protected via authentication middleware

### Search functionality

The search service (`placementSchoolSearch.js`) provides:

- Full-text search across school data
- Filter by region, provider, academic year
- Pagination support
- Results ranking and relevance

## Environment configuration

The application uses environment variables for configuration:

- `ORDNANCE_SURVEY_API_KEY` - Ordnance Survey API access
- `ORDNANCE_SURVEY_API_SECRET` - Ordnance Survey API secret
- `GOOGLE_MAPS_API_KEY` - Google Maps API access
- `SESSION_SECRET` - Session encryption key
- `USE_SIGN_IN_FORM` - Toggle between form login and persona selection

## Session management

- Sessions are stored in-memory (default for Prototype Kit)
- Session data includes authenticated user information
- Flash messages for user feedback (via connect-flash)

## Frontend architecture

### JavaScript components

- **checkbox-filter.js**: Dynamic checkbox filtering
- **filter-toggle-button.js**: Show/hide filter panels
- **accessible-autocomplete**: Accessible autocomplete component

### Styling

- Uses GOV.UK Frontend Sass
- Custom styles extend the design system
- Responsive design following GOV.UK patterns

## Development vs production

### Local development

- SQLite database for simplicity
- Hot-reloading via Prototype Kit dev server
- Mock data via seeders

### Production considerations

- For production deployment, consider:
  - Switching to PostgreSQL or MySQL
  - External session store (Redis, database)
  - Environment-based configuration
  - Production-grade authentication
  - API rate limiting
  - Error monitoring

## Extension points

### Adding new features

1. Create migration for schema changes
2. Define/update Sequelize models
3. Create/update controllers
4. Add routes in `routes.js`
5. Create Nunjucks templates
6. Add seed data if needed

### Adding external services

- Services are encapsulated in `app/services/`
- API keys managed via environment variables
- Helper functions bridge services and controllers
