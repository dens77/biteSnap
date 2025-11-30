import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.integration
class TestTagListEndpoint:

    def test_list_tags_success(self, api_client, tag_factory):
        tag_factory(name='Breakfast', slug='breakfast')
        tag_factory(name='Lunch', slug='lunch')
        tag_factory(name='Dinner', slug='dinner')

        url = reverse('api:tags-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert 'id' in response.data[0]
        assert 'name' in response.data[0]
        assert 'slug' in response.data[0]


@pytest.mark.django_db
@pytest.mark.integration
class TestTagDetailEndpoint:

    def test_retrieve_tag_success(self, api_client, tag_factory):
        tag = tag_factory(name='Test Tag', slug='test-tag')

        url = reverse('api:tags-detail', kwargs={'pk': tag.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == tag.id
        assert response.data['name'] == 'Test Tag'
        assert response.data['slug'] == 'test-tag'
