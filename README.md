# BiteSnap Recipe Management System

A clean and simple recipe management application built with React frontend and Django REST API backend.

## About

BiteSnap allows users to create, edit, and manage their favorite recipes with a modern, responsive interface. Features include user authentication, recipe CRUD operations, favorites system, tag-based filtering, and smart ingredient search.

**Technologies:** React 17, Django 4.2, Django REST Framework, SQLite

## Quick Setup


### Installation

**1. Clone and navigate to project:**
```bash
git clone repo
cd bitesnap
```

**2. Backend setup:**
```bash
cd backend
source ../venv/bin/activate  # Windows: ..\venv\Scripts\activate
pip install -r requirements.txt
                                #if database file is available, skip the next 4 steps
python manage.py makemigrations
python manage.py migrate
python manage.py load_ingredients
python manage.py create_test_data
python manage.py runserver
```

**3. Frontend setup (new terminal):**
```bash
cd frontend
npm start
```

**4. Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Test Login
- Email: `johndoe@example.com`
- Password: `password123`

## Usage

- **View Recipes**: Browse all recipes on the main page
- **Create Recipe**: Click "Create Recipe" to add a new recipe
- **Edit Recipe**: Click "Edit Recipe" on your own recipes
- **Add to Favorites**: Click the icon to bookmark recipes
- **Filter by Tags**: Use tag buttons to filter recipes by category
