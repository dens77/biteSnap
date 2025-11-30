import pytest
from rest_framework import status


@pytest.mark.django_db
@pytest.mark.integration
class TestHealthEndpoint:

    def test_health_check_success(self, api_client):
        url = '/health'
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/json'

        data = response.json()
        assert 'status' in data
        assert 'timestamp' in data
        assert 'version' in data
        assert 'application' in data
        assert 'checks' in data

        assert data['status'] == 'healthy'
        assert data['application'] == 'BiteSnap'
        assert data['version'] == '1.0.0'

    def test_health_check_database_connectivity(self, api_client):
        url = '/health'
        response = api_client.get(url)

        data = response.json()
        assert 'database' in data['checks']
        assert data['checks']['database'] == 'connected'

    def test_health_check_storage_configuration(self, api_client):
        url = '/health'
        response = api_client.get(url)

        data = response.json()
        assert 'storage' in data['checks']
        assert data['checks']['storage'] in ['azure_blob_configured', 'local_storage']
