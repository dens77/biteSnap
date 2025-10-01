from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import UserViewSet, TagViewSet, IngredientViewSet, RecipeViewSet

app_name = 'api'

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('tags', TagViewSet, basename='tags')
router.register('ingredients', IngredientViewSet, basename='ingredients')
router.register('recipes', RecipeViewSet, basename='recipes')

urlpatterns = [
    # Authentication endpoints (djoser)
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
    
    # API endpoints
    path('', include(router.urls)),
]
