import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.integration
class TestIngredientListEndpoint:

    def test_list_ingredients_success(self, api_client, ingredient_factory):
        ingredient_factory(name='Flour', measurement_unit='g')
        ingredient_factory(name='Sugar', measurement_unit='g')
        ingredient_factory(name='Salt', measurement_unit='g')

        url = reverse('api:ingredients-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert 'id' in response.data[0]
        assert 'name' in response.data[0]
        assert 'measurement_unit' in response.data[0]


@pytest.mark.django_db
@pytest.mark.integration
class TestIngredientFilterEndpoint:

    def test_filter_by_name_prefix(self, api_client, ingredient_factory):
        ingredient_factory(name='Flour', measurement_unit='g')
        ingredient_factory(name='Flax Seeds', measurement_unit='g')
        ingredient_factory(name='Sugar', measurement_unit='g')
        ingredient_factory(name='Salt', measurement_unit='g')

        url = reverse('api:ingredients-list')
        response = api_client.get(url, {'name': 'fl'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        names = [ing['name'] for ing in response.data]
        assert 'Flour' in names
        assert 'Flax Seeds' in names


@pytest.mark.django_db
@pytest.mark.integration
class TestIngredientDetailEndpoint:

    def test_retrieve_ingredient_success(self, api_client, ingredient_factory):
        ingredient = ingredient_factory(name='Test Ingredient', measurement_unit='kg')

        url = reverse('api:ingredients-detail', kwargs={'pk': ingredient.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == ingredient.id
        assert response.data['name'] == 'Test Ingredient'
        assert response.data['measurement_unit'] == 'kg'
