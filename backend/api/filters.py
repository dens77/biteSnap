from django_filters import rest_framework as filters
from recipes.models import Recipe, Ingredient


class IngredientFilter(filters.FilterSet):
    """
    Filter for ingredients search.
    """
    name = filters.CharFilter(
        field_name='name',
        lookup_expr='istartswith'
    )

    class Meta:
        model = Ingredient
        fields = ['name']


class RecipeFilter(filters.FilterSet):
    """
    Filter for recipes by tags, author, and favorite status.
    """
    tags = filters.CharFilter(method='filter_tags')
    is_favorited = filters.BooleanFilter(method='filter_is_favorited')

    class Meta:
        model = Recipe
        fields = ['author', 'tags', 'is_favorited']

    def filter_tags(self, queryset, name, value):
        tags = self.request.query_params.getlist('tags')
        if tags:
            return queryset.filter(tags__slug__in=tags).distinct()
        return queryset

    def filter_is_favorited(self, queryset, name, value):

        user = self.request.user
        if user.is_authenticated and value:
            return queryset.filter(favorited_by__user=user).distinct()
        return queryset
