from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from djoser.serializers import UserCreateSerializer, UserSerializer as DjoserUserSerializer
from drf_extra_fields.fields import Base64ImageField

from recipes.models import (
    Tag, Ingredient, Recipe, RecipeIngredient,
    Favorite
)

User = get_user_model()


class UserSerializer(DjoserUserSerializer):
    """
    User serializer .
    """

    class Meta:
        model = User
        fields = (
            'email', 'id', 'username', 'first_name',
            'last_name'
        )


class UserCreateSerializer(UserCreateSerializer):
    """
    Serializer for user registration.
    """
    class Meta:
        model = User
        fields = (
            'email', 'id', 'username', 'first_name',
            'last_name', 'password'
        )
        extra_kwargs = {
            'password': {'write_only': True}
        }


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for Tag model.
    """
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')


class IngredientSerializer(serializers.ModelSerializer):
    """
    Serializer for Ingredient model.
    """
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'measurement_unit')


class RecipeIngredientSerializer(serializers.ModelSerializer):
    """
    Serializer for ingredients in recipes (read operations).
    """
    id = serializers.ReadOnlyField(source='ingredient.id')
    name = serializers.ReadOnlyField(source='ingredient.name')
    measurement_unit = serializers.ReadOnlyField(source='ingredient.measurement_unit')

    class Meta:
        model = RecipeIngredient
        fields = ('id', 'name', 'measurement_unit', 'amount')


class RecipeIngredientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for adding ingredients to recipes (write operations).
    """
    id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
        source='ingredient'
    )

    class Meta:
        model = RecipeIngredient
        fields = ('id', 'amount')


class RecipeListSerializer(serializers.ModelSerializer):
    """
    Serializer for Recipe list/detail view.
    """
    tags = TagSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    ingredients = RecipeIngredientSerializer(
        source='recipe_ingredients',
        many=True,
        read_only=True
    )
    is_favorited = serializers.SerializerMethodField()
    image = serializers.ImageField()

    class Meta:
        model = Recipe
        fields = (
            'id', 'tags', 'author', 'ingredients',
            'is_favorited',
            'name', 'image', 'text', 'cooking_time'
        )

    def get_is_favorited(self, obj):
        """Check if recipe is in user's favorites."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(
                user=request.user, recipe=obj
            ).exists()
        return False


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating recipes.
    """
    ingredients = RecipeIngredientCreateSerializer(many=True, allow_empty=False)
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        allow_empty=False
    )
    image = Base64ImageField()

    class Meta:
        model = Recipe
        fields = (
            'id', 'ingredients', 'tags', 'image',
            'name', 'text', 'cooking_time'
        )
        extra_kwargs = {
            'name': {'allow_blank': False},
            'text': {'allow_blank': False},
        }

    def validate_ingredients(self, value):
        """Validate ingredients field."""
        if not value:
            raise serializers.ValidationError(
                'This field is required and cannot be empty.'
            )

        ingredients = []
        for item in value:
            ingredient = item['ingredient']
            if ingredient in ingredients:
                raise serializers.ValidationError(
                    'Ingredients cannot be duplicated.'
                )
            ingredients.append(ingredient)
        return value

    def validate_tags(self, value):
        """Validate tags field."""
        if not value:
            raise serializers.ValidationError(
                'This field is required and cannot be empty.'
            )

        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                'Tags cannot be duplicated.'
            )
        return value

    def validate(self, data):
        """Validate entire recipe data."""
        if not self.instance:  # Create operation
            required_fields = ['ingredients', 'tags', 'name', 'text', 'cooking_time', 'image']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({
                        field: ['This field is required.']
                    })
        else:  # Update operation
            required_fields = ['ingredients', 'tags']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({
                        field: ['This field is required.']
                    })

        return data

    def create_ingredients(self, ingredients_data, recipe):
        RecipeIngredient.objects.bulk_create([
            RecipeIngredient(
                recipe=recipe,
                ingredient=ingredient_data['ingredient'],
                amount=ingredient_data['amount']
            )
            for ingredient_data in ingredients_data
        ])

    def create(self, validated_data):
        """Create recipe with ingredients and tags."""
        ingredients_data = validated_data.pop('ingredients')
        tags_data = validated_data.pop('tags')

        recipe = Recipe.objects.create(**validated_data)
        recipe.tags.set(tags_data)
        self.create_ingredients(ingredients_data, recipe)

        return recipe

    def update(self, instance, validated_data):
        """Update recipe with ingredients and tags."""
        ingredients_data = validated_data.pop('ingredients', None)
        tags_data = validated_data.pop('tags', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.set(tags_data)

        if ingredients_data is not None:
            instance.recipe_ingredients.all().delete()
            self.create_ingredients(ingredients_data, instance)

        return instance

    def to_representation(self, instance):
        """Return the list serializer representation after create/update."""
        return RecipeListSerializer(
            instance,
            context=self.context
        ).data


class RecipeMinifiedSerializer(serializers.ModelSerializer):
    """
    recipe serializer for favorites.
    """
    class Meta:
        model = Recipe
        fields = ('id', 'name', 'image', 'cooking_time')


class FavoriteSerializer(serializers.ModelSerializer):
    """
    Serializer for adding recipes to favorites.
    """
    class Meta:
        model = Favorite
        fields = ('user', 'recipe')
        validators = [
            UniqueTogetherValidator(
                queryset=Favorite.objects.all(),
                fields=['user', 'recipe'],
                message='Recipe is already in favorites.'
            )
        ]

    def to_representation(self, instance):
        """Return minified recipe representation."""
        return RecipeMinifiedSerializer(
            instance.recipe,
            context=self.context
        ).data
