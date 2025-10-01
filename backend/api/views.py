from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from djoser.views import UserViewSet as DjoserUserViewSet

from recipes.models import (
    Tag, Ingredient, Recipe, RecipeIngredient,
    Favorite
)
from api.serializers import (
    UserSerializer,
    TagSerializer, IngredientSerializer,
    RecipeListSerializer, RecipeCreateUpdateSerializer, RecipeMinifiedSerializer,
    FavoriteSerializer
)
from api.filters import RecipeFilter, IngredientFilter
from api.permissions import IsAuthorOrReadOnly
from api.pagination import CustomPageNumberPagination

User = get_user_model()


class UserViewSet(DjoserUserViewSet):
    """
    ViewSet for user operations
    """
    def list(self, request):
        return Response({'detail': 'User listing disabled.'}, status=status.HTTP_404_NOT_FOUND)
    
    def retrieve(self, request, pk=None):
        return Response({'detail': 'User profiles disabled.'}, status=status.HTTP_404_NOT_FOUND)  

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated]
    )
    def me(self, request):
        """Get current user."""
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)




class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for tags. Read-only for users.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class IngredientViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for ingredients. Read-only for users.
    """
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filterset_class = IngredientFilter


class RecipeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for recipes.
    """
    queryset = Recipe.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    pagination_class = CustomPageNumberPagination
    filterset_class = RecipeFilter

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=[IsAuthenticated]
    )
    def favorite(self, request, pk=None):
        """Add or remove recipe from favorites."""
        user = request.user
        recipe = get_object_or_404(Recipe, pk=pk)

        if request.method == 'POST':
            serializer = FavoriteSerializer(
                data={'user': user.id, 'recipe': recipe.id},
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # DELETE method
        favorite = Favorite.objects.filter(user=user, recipe=recipe)
        if not favorite.exists():
            return Response(
                {'error': 'Recipe is not in favorites.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
