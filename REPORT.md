# BiteSnap DevOps Implementation Report

## Project Overview

BiteSnap is a recipe management application that was successfully migrated from a local development setup to a fully cloud native architecture on Azure. This report covers the improvements made, the deployment architecture, CI/CD pipeline implementation, and monitoring setup.

**Live Application:** https://bitesnap-frontend.salmonwave-3869e9d3.westeurope.azurecontainerapps.io/

---

## 1. Code Quality Improvements

### Refactoring and Code Cleanup

**Constants Extraction**
- Created `backend/recipes/constants.py` with 13 reusable constants
- Removed all magic numbers and hardcoded values from models
- Made the code more maintainable - now you only need to change values in one place

**Filter Logic Upgrade**
- Fixed tag filtering to work correctly with multiple tags using OR logic
- Added `.distinct()` to prevent duplicate results when filtering by favorites
- Improved ingredient search to be case-insensitive and support name prefix matching

**Performance Optimization**
- Optimized `load_ingredients.py` management command to use bulk operations
- Changed from creating ingredients one by one to batch creation (500 at a time)
- Added progress indicators for better user experience
- Result: Loading 2000+ ingredients now takes seconds instead of minutes, especially important for remote databases

### Testing Infrastructure

**Test Coverage: 85.92%** (exceeds 70% requirement)
- **52 automated tests** covering critical functionality
- **30 unit tests** for models, serializers, permissions, and filters
- **22 integration tests** for API endpoints
- Used `pytest`, `pytest-django`, and `factory-boy` for professional test setup
- Organized tests with clear markers: `@pytest.mark.unit` and `@pytest.mark.integration`

**Code Quality Tools**
- Configured `flake8` for Python linting with custom rules in `setup.cfg`
- Zero linting errors in production code, follows PEP8 standards
- Enforced through CI pipeline - builds fail if code quality drops

---

## 2. Deployment Architecture

### Before vs After

**Before:**
- SQLite database (not suitable for production)
- Local file storage for images
- Running on localhost only
- Manual deployment process

**After:**
- Azure Database for PostgreSQL (managed, scalable)
- Azure Blob Storage for recipe images
- Deployed globally on Azure Container Apps
- Fully automated CI/CD pipeline


### Infrastructure Components

**Containerization**
- Backend: Multi-stage Docker build with Python 3.9 and Gunicorn
- Frontend: Multi-stage Docker build (Node.js for build, Nginx for serving)
- Images stored in Azure Container Registry (bitesnapdenis.azurecr.io)

**Database**
- Azure Database for PostgreSQL (Flexible Server)
- Automatic backups and point in time restore

**Storage**
- Azure Blob Storage for media files
- Container: `media/`
- Configured with `django-storages` library
- Falls back to local storage in development

**Networking**
- Both containers have public ingress enabled
- CORS configured to allow frontend-backend communication
- Health probes configured for both containers

---

## 3. CI/CD Pipeline

### GitHub Actions Workflow

The deployment is completely automated through GitHub Actions. Every push triggers the pipeline.

**Pipeline Stages:**

```
Push to GitHub

Stage 1: Code Quality & Tests
  Checkout code
  Setup Python 3.9
  Install dependencies
  Run flake8 linting
  Spin up PostgreSQL test database
  Run 52 automated tests
  Check code coverage ≥70%
  Upload coverage report to Codecov

Stage 2: Build Docker Images 
  Login to Azure Container Registry
  Build backend Docker image
  Build frontend Docker image
  Tag images with git commit SHA
  Push images to ACR

Stage 3: Deploy to Azure
  Deploy backend container app
  Deploy frontend container app
  Configure environment variables
  Run database migrations
  Load ingredients data
  Create test user accounts
    
Deployment Complete
  Frontend: https://bitesnap-frontend.[region].azurecontainerapps.io
  Backend: https://bitesnap-backend.[region].azurecontainerapps.io
```

**Quality Gates**
- Pipeline fails if linting has any errors
- Pipeline fails if any test fails
- Pipeline fails if code coverage drops below 70%
- Only passing code gets deployed to production

**Secrets Management**
- 13 GitHub Secrets configured for sensitive data
- Database credentials, Azure credentials, API keys
- Never committed to repository
- Injected as environment variables during deployment

---

## 4. Monitoring and Health Checks

### Health Endpoint

Implemented `/health` endpoint that checks:
- Application status
- Database connectivity (runs a test query)
- Storage configuration (Azure Blob vs local)
- Timestamp for last health check
- Returns HTTP 200 if healthy, HTTP 503 if unhealthy


**Used for:**
- Azure Container Apps health probes
- Monitoring service availability
- Debugging deployment issues

### Logging

**Structured Logging Configuration**
- Console logging for Docker containers
- Log levels: INFO, WARNING, ERROR, CRITICAL
- Django request/response logging
- Database query logging in development

**What gets logged:**
- All HTTP requests and responses
- Database migrations
- Authentication events
- File uploads to Azure Blob
- Health check failures

### Azure Application Insights

- Connection string configured via environment variable
- Automatic metrics collection when deployed
- Tracks: request rates, response times, error rates
- Can view logs and metrics in Azure Portal

---

## 5. Key Features Implemented

### Security
- HTTPS enabled on both containers
- SSL/TLS for database connections
- Secrets stored in GitHub Secrets and Azure
- CORS properly configured
- Django SECRET_KEY rotated for production

### Scalability
- Containers can scale horizontally
- Managed PostgreSQL can scale up/down
- Blob storage is unlimited
- Stateless backend design

### Reliability
- Health probes restart containers if unhealthy
- Database has automatic backups
- Zero downtime deployments
- Can rollback to previous image version


---


## 6. Assignment Requirements Met

### DevOps Practices 
- Infrastructure as Code (Dockerfiles, docker-compose)
- Automated CI/CD pipeline (GitHub Actions)
- Containerization (Docker + Azure Container Apps)
- Cloud deployment (Azure)
- Monitoring and logging (Health checks, Application Insights)
- Secrets management (GitHub Secrets)

### Code Quality 
- Automated testing (52 tests, 86% coverage)
- Linting (flake8, zero errors)
- Code refactoring (constants extracted, filters improved)
- SOLID principles applied
- Quality gates in pipeline (tests must pass)

### Documentation 
- Comprehensive README with deployment instructions
- Test reports with coverage metrics
- implementation report

---

## 7. Lessons Learned

**What Worked Well:**
- GitHub Actions made CI/CD very straightforward
- Azure Container Apps simplified deployment vs managing VMs
- Pytest fixtures made tests easy to write and maintain
- Docker ensured consistency between dev and production

**What I'd Do Differently:**
- Start with PostgreSQL locally from the beginning
- Set up test database earlier in development
- Write tests alongside features, not after


