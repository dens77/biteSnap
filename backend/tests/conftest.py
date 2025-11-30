import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.core.files.uploadedfile import SimpleUploadedFile

from recipes.models import Tag, Ingredient, Recipe, RecipeIngredient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def unauthenticated_client():
    from django.contrib.auth.models import AnonymousUser
    client = APIClient()
    client.user = AnonymousUser()
    return client


@pytest.fixture
def test_user(db):
    user = User.objects.create_user(
        username='testuser',
        email='test@bitesnap.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    return user


@pytest.fixture
def test_user2(db):
    user = User.objects.create_user(
        username='testuser2',
        email='test2@bitesnap.com',
        password='testpass123',
        first_name='Test',
        last_name='User2'
    )
    return user


@pytest.fixture
def authenticated_client(test_user):
    client = APIClient()
    token, _ = Token.objects.get_or_create(user=test_user)
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    client.user = test_user
    return client


@pytest.fixture
def user_factory(db):
    def create_user(**kwargs):
        defaults = {
            'username': f'user_{User.objects.count()}',
            'email': f'user_{User.objects.count()}@test.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        defaults.update(kwargs)
        password = defaults.pop('password')
        user = User.objects.create_user(**defaults, password=password)
        return user
    return create_user


@pytest.fixture
def tag_factory(db):
    def create_tag(**kwargs):
        defaults = {
            'name': f'Tag {Tag.objects.count()}',
            'slug': f'tag-{Tag.objects.count()}'
        }
        defaults.update(kwargs)
        return Tag.objects.create(**defaults)
    return create_tag


@pytest.fixture
def ingredient_factory(db):
    def create_ingredient(**kwargs):
        defaults = {
            'name': f'Ingredient {Ingredient.objects.count()}',
            'measurement_unit': 'g'
        }
        defaults.update(kwargs)
        return Ingredient.objects.create(**defaults)
    return create_ingredient


@pytest.fixture
def recipe_factory(db, test_user):
    def create_recipe(**kwargs):
        author = kwargs.pop('author', test_user)
        tags = kwargs.pop('tags', [])
        ingredients_data = kwargs.pop('ingredients', [])

        defaults = {
            'name': f'Recipe {Recipe.objects.count()}',
            'text': 'Test recipe description',
            'cooking_time': 30,
            'image': SimpleUploadedFile(
                name='test.jpg',
                content=b'fake image',
                content_type='image/jpeg'
            )
        }
        defaults.update(kwargs)

        recipe = Recipe.objects.create(author=author, **defaults)

        if tags:
            recipe.tags.set(tags)

        for ingredient_data in ingredients_data:
            if isinstance(ingredient_data, dict):
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient_data['ingredient'],
                    amount=ingredient_data.get('amount', 100)
                )
            else:
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient_data,
                    amount=100
                )

        return recipe

    def create_batch(size, **kwargs):
        return [create_recipe(**kwargs) for _ in range(size)]

    create_recipe.create_batch = create_batch
    return create_recipe


@pytest.fixture
def test_tags(db):
    tags = [
        Tag.objects.create(name='Breakfast', slug='breakfast'),
        Tag.objects.create(name='Lunch', slug='lunch'),
        Tag.objects.create(name='Dinner', slug='dinner'),
        Tag.objects.create(name='Dessert', slug='dessert'),
    ]
    return tags


@pytest.fixture
def test_ingredients(db):
    ingredients = [
        Ingredient.objects.create(name='Flour', measurement_unit='cup'),
        Ingredient.objects.create(name='Sugar', measurement_unit='cup'),
        Ingredient.objects.create(name='Eggs', measurement_unit='piece'),
        Ingredient.objects.create(name='Milk', measurement_unit='ml'),
        Ingredient.objects.create(name='Butter', measurement_unit='gram'),
    ]
    return ingredients


@pytest.fixture
def test_recipe(test_user, test_tags, test_ingredients, db):
    from django.core.files.uploadedfile import SimpleUploadedFile

    image = SimpleUploadedFile(
        name='test_recipe.jpg',
        content=b'fake image content',
        content_type='image/jpeg'
    )

    recipe = Recipe.objects.create(
        author=test_user,
        name='Test Pancakes',
        image=image,
        text='Delicious test pancakes recipe',
        cooking_time=15
    )

    recipe.tags.set([test_tags[0], test_tags[3]])

    for ingredient in test_ingredients[:3]:
        RecipeIngredient.objects.create(
            recipe=recipe,
            ingredient=ingredient,
            amount=100
        )

    return recipe


@pytest.fixture
def test_recipes(test_user, test_user2, test_tags, test_ingredients, db):
    from django.core.files.uploadedfile import SimpleUploadedFile

    recipes = []

    for i in range(5):
        image = SimpleUploadedFile(
            name=f'test_recipe_{i}.jpg',
            content=b'fake image content',
            content_type='image/jpeg'
        )

        recipe = Recipe.objects.create(
            author=test_user if i < 3 else test_user2,
            name=f'Test Recipe {i+1}',
            image=image,
            text=f'Test recipe description {i+1}',
            cooking_time=10 + (i * 5)
        )

        recipe.tags.add(test_tags[i % len(test_tags)])

        RecipeIngredient.objects.create(
            recipe=recipe,
            ingredient=test_ingredients[0],
            amount=100 + (i * 10)
        )

        recipes.append(recipe)

    return recipes
