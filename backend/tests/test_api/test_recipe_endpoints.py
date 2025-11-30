import pytest
from django.urls import reverse
from rest_framework import status
from recipes.models import Recipe, Favorite


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeListEndpoint:

    def test_list_recipes_unauthenticated(self, api_client, recipe_factory):
        recipe_factory.create_batch(3)

        url = reverse('api:recipes-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 3

    def test_list_recipes_filter_by_tag(self, api_client, recipe_factory, tag_factory):
        tag1 = tag_factory(slug='breakfast')
        tag2 = tag_factory(slug='lunch')
        recipe1 = recipe_factory(tags=[tag1])
        recipe2 = recipe_factory(tags=[tag2])

        url = reverse('api:recipes-list')
        response = api_client.get(url, {'tags': 'breakfast'})

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        recipe_ids = [r['id'] for r in response.data['results']]
        assert recipe1.id in recipe_ids
        assert recipe2.id not in recipe_ids


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeDetailEndpoint:

    def test_retrieve_recipe_success(self, api_client, recipe_factory):
        recipe = recipe_factory()

        url = reverse('api:recipes-detail', kwargs={'pk': recipe.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == recipe.id
        assert response.data['name'] == recipe.name


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeCreateEndpoint:

    def test_create_recipe_unauthenticated(self, api_client):
        url = reverse('api:recipes-list')
        data = {
            'name': 'Test Recipe',
            'text': 'Test description',
            'cooking_time': 30
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeUpdateEndpoint:

    def test_update_other_user_recipe(self, authenticated_client, recipe_factory, user_factory, tag_factory, ingredient_factory):
        import base64

        other_user = user_factory()
        tag = tag_factory()
        ingredient = ingredient_factory()
        recipe = recipe_factory(
            author=other_user,
            tags=[tag],
            ingredients=[{'ingredient': ingredient, 'amount': 100}]
        )

        image_content = b'hacked image'
        base64_image = base64.b64encode(image_content).decode('utf-8')

        url = reverse('api:recipes-detail', kwargs={'pk': recipe.id})
        data = {
            'name': 'Hacked Recipe',
            'text': recipe.text,
            'cooking_time': recipe.cooking_time,
            'image': f'data:image/jpeg;base64,{base64_image}',
            'tags': [tag.id],
            'ingredients': [{'id': ingredient.id, 'amount': 100}]
        }
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeDeleteEndpoint:

    def test_delete_own_recipe(self, authenticated_client, recipe_factory):
        recipe = recipe_factory(author=authenticated_client.user)
        recipe_id = recipe.id

        url = reverse('api:recipes-detail', kwargs={'pk': recipe.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Recipe.objects.filter(id=recipe_id).exists()

    def test_delete_other_user_recipe(self, authenticated_client, recipe_factory, user_factory):
        other_user = user_factory()
        recipe = recipe_factory(author=other_user)
        recipe_id = recipe.id

        url = reverse('api:recipes-detail', kwargs={'pk': recipe.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Recipe.objects.filter(id=recipe_id).exists()


@pytest.mark.django_db
@pytest.mark.integration
class TestRecipeFavoriteEndpoint:

    def test_add_recipe_to_favorites(self, authenticated_client, recipe_factory):
        recipe = recipe_factory()

        url = reverse('api:recipes-favorite', kwargs={'pk': recipe.id})
        response = authenticated_client.post(url)

        assert response.status_code == status.HTTP_201_CREATED
        assert Favorite.objects.filter(
            user=authenticated_client.user,
            recipe=recipe
        ).exists()

    def test_remove_recipe_from_favorites(self, authenticated_client, recipe_factory):
        recipe = recipe_factory()
        Favorite.objects.create(user=authenticated_client.user, recipe=recipe)

        url = reverse('api:recipes-favorite', kwargs={'pk': recipe.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Favorite.objects.filter(
            user=authenticated_client.user,
            recipe=recipe
        ).exists()
