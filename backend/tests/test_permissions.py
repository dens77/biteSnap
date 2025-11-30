import pytest
from unittest.mock import Mock
from api.permissions import IsAuthorOrReadOnly


@pytest.mark.unit
@pytest.mark.django_db
class TestIsAuthorOrReadOnlyPermission:
    def test_read_permission_allowed_for_any_user(self, test_user, test_recipe):
        permission = IsAuthorOrReadOnly()
        request = Mock()
        request.method = 'GET'
        request.user = test_user
        assert permission.has_object_permission(request, None, test_recipe) is True

    def test_write_permission_allowed_for_author(self, test_user, test_recipe):
        permission = IsAuthorOrReadOnly()
        request = Mock()
        request.method = 'POST'
        request.user = test_user
        assert permission.has_object_permission(request, None, test_recipe) is True

    def test_write_permission_denied_for_non_author(self, test_user, test_user2, test_recipe):
        permission = IsAuthorOrReadOnly()
        request = Mock()
        request.method = 'POST'
        request.user = test_user2
        assert permission.has_object_permission(request, None, test_recipe) is False
