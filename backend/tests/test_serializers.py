import pytest
from django.contrib.auth import get_user_model
from api.serializers import (
    UserSerializer, TagSerializer, IngredientSerializer,
    RecipeListSerializer, RecipeCreateUpdateSerializer,
    FavoriteSerializer
)
from recipes.models import Tag, Ingredient, Favorite

User = get_user_model()


@pytest.mark.unit
@pytest.mark.django_db
class TestTagSerializer:
    def test_tag_serialization(self):
        tag = Tag.objects.create(name='Breakfast', slug='breakfast')
        serializer = TagSerializer(tag)

        assert serializer.data['id'] == tag.id
        assert serializer.data['name'] == 'Breakfast'
        assert serializer.data['slug'] == 'breakfast'


@pytest.mark.unit
@pytest.mark.django_db
class TestIngredientSerializer:
    def test_ingredient_serialization(self):
        ingredient = Ingredient.objects.create(
            name='Flour',
            measurement_unit='cup'
        )
        serializer = IngredientSerializer(ingredient)

        assert serializer.data['id'] == ingredient.id
        assert serializer.data['name'] == 'Flour'
        assert serializer.data['measurement_unit'] == 'cup'


@pytest.mark.unit
@pytest.mark.django_db
class TestUserSerializer:
    def test_user_serialization(self, test_user):
        serializer = UserSerializer(test_user)

        assert serializer.data['id'] == test_user.id
        assert serializer.data['email'] == test_user.email
        assert serializer.data['username'] == test_user.username
        assert serializer.data['first_name'] == test_user.first_name
        assert serializer.data['last_name'] == test_user.last_name
        assert 'password' not in serializer.data


@pytest.mark.unit
@pytest.mark.django_db
class TestRecipeListSerializer:
    def test_recipe_serialization_with_relations(self, test_recipe):
        serializer = RecipeListSerializer(test_recipe)
        data = serializer.data

        assert data['id'] == test_recipe.id
        assert data['name'] == test_recipe.name
        assert data['cooking_time'] == test_recipe.cooking_time
        assert 'tags' in data
        assert 'ingredients' in data
        assert 'author' in data
        assert 'is_favorited' in data


@pytest.mark.unit
@pytest.mark.django_db
class TestRecipeCreateUpdateSerializer:
    def test_validate_ingredients_duplicates(self, test_ingredients):
        serializer = RecipeCreateUpdateSerializer()
        ingredients_data = [
            {'ingredient': test_ingredients[0], 'amount': 100},
            {'ingredient': test_ingredients[0], 'amount': 200}
        ]

        with pytest.raises(Exception) as exc_info:
            serializer.validate_ingredients(ingredients_data)
        assert 'duplicate' in str(exc_info.value).lower()


@pytest.mark.unit
@pytest.mark.django_db
class TestFavoriteSerializer:
    def test_favorite_creation(self, test_user, test_recipe):
        data = {'user': test_user.id, 'recipe': test_recipe.id}
        serializer = FavoriteSerializer(data=data)

        assert serializer.is_valid()
        favorite = serializer.save()
        assert favorite.user == test_user
        assert favorite.recipe == test_recipe

    def test_favorite_duplicate_validation(self, test_user, test_recipe):
        Favorite.objects.create(user=test_user, recipe=test_recipe)

        data = {'user': test_user.id, 'recipe': test_recipe.id}
        serializer = FavoriteSerializer(data=data)

        assert not serializer.is_valid()
        assert 'non_field_errors' in serializer.errors or 'already' in str(serializer.errors).lower()
