# BiteSnap Recipe Management System

A clean and simple recipe management application built with React frontend and Django REST API backend.

## 🌐 Live Application

**Deployed on Azure Container Apps:**  
** https://bitesnap-frontend.salmonwave-3869e9d3.westeurope.azurecontainerapps.io/**

### Test Login Credentials
- Email: `test1@bitesnap.com`
- Password: `testpass123`

---

## About

BiteSnap allows users to create, edit, and manage their favorite recipes with a modern, responsive interface. Features include user authentication, recipe CRUD operations, favorites system, tag-based filtering, and smart ingredient search.

**Technologies:** React 17, Django 4.2, Django REST Framework, PostgreSQL, Azure Container Apps, Azure blob storage


## Usage

- **View Recipes**: Browse all recipes on the main page
- **Create Recipe**: Click "Create Recipe" to add a new recipe
- **Edit Recipe**: Click "Edit Recipe" on your own recipes
- **Add to Favorites**: Click the icon to bookmark recipes
- **Filter by Tags**: Use tag buttons to filter recipes by category

---

## Deployment Architecture

**Production Stack:**
- **Frontend**: Azure Container Apps (React + Nginx)
- **Backend**: Azure Container Apps (Django + Gunicorn)
- **Database**: Azure Database for PostgreSQL
- **Storage**: Azure Blob Storage (recipe images)
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights, /health endpoint

**Features:**
- ✅ Automated deployments on push to main
- ✅ Health monitoring and logging
- ✅ 85% test coverage with automated testing
- ✅ Containerized with Docker
