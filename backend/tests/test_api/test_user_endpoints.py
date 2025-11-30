import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.integration
class TestUserRegistration:

    def test_user_registration_success(self, api_client):
        url = reverse('api:users-list')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert response.data['username'] == 'newuser'
        assert response.data['email'] == 'newuser@test.com'
        assert 'password' not in response.data
        assert User.objects.filter(username='newuser').exists()

    def test_user_registration_duplicate_username(self, api_client, test_user):
        url = reverse('api:users-list')
        data = {
            'username': test_user.username,
            'email': 'different@test.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.integration
class TestUserLogin:

    def test_login_success(self, api_client, db):
        user = User.objects.create_user(
            username='logintest',
            email='logintest@test.com',
            password='testpass123'
        )

        url = '/api/auth/token/login/'
        data = {
            'email': 'logintest@test.com',
            'password': 'testpass123'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'auth_token' in response.data
        assert Token.objects.filter(user=user).exists()

    def test_login_invalid_credentials(self, api_client, db):
        User.objects.create_user(
            username='testuser2',
            email='testuser2@test.com',
            password='testpass123'
        )

        url = '/api/auth/token/login/'
        data = {
            'email': 'testuser2@test.com',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.integration
class TestUserLogout:

    def test_logout_authenticated_user(self, authenticated_client):
        url = '/api/auth/token/logout/'
        response = authenticated_client.post(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Token.objects.filter(user=authenticated_client.user).exists()

    def test_logout_unauthenticated_user(self, api_client):
        url = '/api/auth/token/logout/'
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.integration
class TestUserProfile:

    def test_get_current_user_authenticated(self, authenticated_client):
        url = reverse('api:users-me')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == authenticated_client.user.username
        assert response.data['email'] == authenticated_client.user.email
        assert response.data['first_name'] == authenticated_client.user.first_name
        assert response.data['last_name'] == authenticated_client.user.last_name
        assert 'password' not in response.data

    def test_get_current_user_unauthenticated(self, api_client):
        url = reverse('api:users-me')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.integration
class TestPasswordChange:

    def test_change_password_success(self, authenticated_client):
        url = '/api/users/set_password/'
        data = {
            'current_password': 'testpass123',
            'new_password': 'newtestpass456'
        }
        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_204_NO_CONTENT

        authenticated_client.user.refresh_from_db()
        assert authenticated_client.user.check_password('newtestpass456')

    def test_change_password_unauthenticated(self, api_client):
        url = '/api/users/set_password/'
        data = {
            'current_password': 'testpass123',
            'new_password': 'newtestpass456'
        }
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
