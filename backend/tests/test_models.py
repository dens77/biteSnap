import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.core.files.uploadedfile import SimpleUploadedFile
from recipes.models import Tag, Recipe, RecipeIngredient, Favorite

User = get_user_model()


@pytest.mark.unit
@pytest.mark.django_db
class TestUserModel:
    def test_user_creation_and_full_name(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.full_name == 'John Doe'


@pytest.mark.unit
@pytest.mark.django_db
class TestTagModel:
    def test_tag_creation(self):
        tag = Tag.objects.create(name='Breakfast', slug='breakfast')
        assert tag.name == 'Breakfast'
        assert tag.slug == 'breakfast'
        assert str(tag) == 'Breakfast'

    def test_tag_unique_constraints(self):
        Tag.objects.create(name='Lunch', slug='lunch')
        with pytest.raises(IntegrityError):
            Tag.objects.create(name='Lunch', slug='lunch-2')


@pytest.mark.unit
@pytest.mark.django_db
class TestRecipeModel:
    def test_recipe_creation(self, test_user):
        image = SimpleUploadedFile('test.jpg', b'fake image', content_type='image/jpeg')
        recipe = Recipe.objects.create(
            author=test_user,
            name='Pancakes',
            image=image,
            text='Delicious pancakes',
            cooking_time=15
        )
        assert recipe.name == 'Pancakes'
        assert recipe.author == test_user
        assert str(recipe) == 'Pancakes'

    def test_recipe_with_tags(self, test_user, test_tags):
        image = SimpleUploadedFile('test.jpg', b'fake image', content_type='image/jpeg')
        recipe = Recipe.objects.create(
            author=test_user,
            name='Breakfast Recipe',
            image=image,
            text='Test recipe',
            cooking_time=10
        )
        recipe.tags.add(test_tags[0], test_tags[1])
        assert recipe.tags.count() == 2

    def test_recipe_with_ingredients(self, test_user, test_ingredients):
        image = SimpleUploadedFile('test.jpg', b'fake image', content_type='image/jpeg')
        recipe = Recipe.objects.create(
            author=test_user,
            name='Cake',
            image=image,
            text='Test cake',
            cooking_time=60
        )
        RecipeIngredient.objects.create(
            recipe=recipe,
            ingredient=test_ingredients[0],
            amount=200
        )
        assert recipe.ingredients.count() == 1


@pytest.mark.unit
@pytest.mark.django_db
class TestRecipeIngredientModel:
    def test_recipe_ingredient_creation(self, test_recipe, test_ingredients):
        recipe_ingredient = RecipeIngredient.objects.create(
            recipe=test_recipe,
            ingredient=test_ingredients[3],
            amount=250
        )
        assert recipe_ingredient.recipe == test_recipe
        assert recipe_ingredient.amount == 250
        assert 'Milk' in str(recipe_ingredient)


@pytest.mark.unit
@pytest.mark.django_db
class TestFavoriteModel:
    def test_favorite_creation(self, test_user, test_recipe):
        favorite = Favorite.objects.create(
            user=test_user,
            recipe=test_recipe
        )
        assert favorite.user == test_user
        assert favorite.recipe == test_recipe
        assert str(favorite) == f'{test_user.username} - {test_recipe.name}'
