import pytest
from io import StringIO
from django.core.management import call_command
from django.contrib.auth import get_user_model
from recipes.models import Tag

User = get_user_model()


@pytest.mark.unit
@pytest.mark.django_db
class TestCreateTestDataCommand:
    def test_command_creates_test_users(self):
        out = StringIO()
        call_command('create_test_data', stdout=out)
        assert User.objects.filter(username='testuser1').exists()
        assert User.objects.filter(username='testuser2').exists()
        assert User.objects.filter(username='chef').exists()
        output = out.getvalue()
        assert 'successfully' in output.lower()

    def test_command_creates_test_tags(self):
        out = StringIO()
        call_command('create_test_data', stdout=out)
        assert Tag.objects.filter(name='Breakfast').exists()
        assert Tag.objects.filter(name='Lunch').exists()
        assert Tag.objects.filter(name='Dinner').exists()
        assert Tag.objects.count() >= 4

    def test_command_with_clear_flag(self):
        call_command('create_test_data')
        out = StringIO()
        call_command('create_test_data', clear=True, stdout=out)
        assert User.objects.filter(username='testuser1').exists()
        output = out.getvalue()
        assert 'Cleared' in output or 'cleared' in output.lower()

    def test_command_idempotent(self):
        call_command('create_test_data')
        first_user_count = User.objects.count()
        first_tag_count = Tag.objects.count()
        call_command('create_test_data')
        second_user_count = User.objects.count()
        second_tag_count = Tag.objects.count()
        assert first_user_count == second_user_count
        assert first_tag_count == second_tag_count
