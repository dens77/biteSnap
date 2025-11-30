import pytest
from unittest.mock import Mock
from api.filters import RecipeFilter, IngredientFilter
from recipes.models import Ingredient, Favorite


@pytest.mark.unit
@pytest.mark.django_db
class TestIngredientFilter:

    def test_filter_by_name_starting_with(self):
        Ingredient.objects.create(name='Flour', measurement_unit='cup')
        Ingredient.objects.create(name='Sugar', measurement_unit='gram')
        Ingredient.objects.create(name='Salt', measurement_unit='gram')

        filter_instance = IngredientFilter()
        queryset = Ingredient.objects.all()

        filtered = filter_instance.filters['name'].filter(queryset, 'f')

        assert filtered.count() == 1
        assert filtered.first().name == 'Flour'


@pytest.mark.unit
@pytest.mark.django_db
class TestRecipeFilter:

    def test_filter_by_tags(self, test_recipes, test_tags):
        mock_request = Mock()
        mock_request.query_params.getlist.return_value = [test_tags[0].slug]

        filter_instance = RecipeFilter(request=mock_request)
        queryset = filter_instance.filter_tags(
            test_recipes[0].__class__.objects.all(),
            'tags',
            None
        )

        assert queryset.count() >= 1

    def test_filter_is_favorited_authenticated_user(self, test_user, test_recipes):
        Favorite.objects.create(user=test_user, recipe=test_recipes[0])

        mock_request = Mock()
        mock_request.user = test_user

        filter_instance = RecipeFilter(request=mock_request)
        queryset = filter_instance.filter_is_favorited(
            test_recipes[0].__class__.objects.all(),
            'is_favorited',
            True
        )

        assert queryset.count() == 1
        assert test_recipes[0] in queryset
