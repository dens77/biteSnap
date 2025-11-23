from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, RegexValidator
from django.db.models import UniqueConstraint


class User(AbstractUser):
    """
    User model with additional fields.
    """
    email = models.EmailField(
        max_length=254,
        unique=True,
        verbose_name='Email Address',
        help_text='Required. 254 characters or fewer. Must be unique.'
    )
    first_name = models.CharField(
        max_length=150,
        verbose_name='First Name',
        help_text='Required. 150 characters or fewer.'
    )
    last_name = models.CharField(
        max_length=150,
        verbose_name='Last Name',
        help_text='Required. 150 characters or fewer.'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.username})'

    @property
    def full_name(self):
        """Return full name of the user."""
        return f'{self.first_name} {self.last_name}'.strip()


class Tag(models.Model):
    """
    Tag model for categorizing recipes.
    """
    name = models.CharField(
        max_length=32,
        unique=True,
        verbose_name='Tag Name',
        help_text='Unique tag name'
    )
    slug = models.SlugField(
        max_length=32,
        unique=True,
        validators=[
            RegexValidator(
                regex='^[-a-zA-Z0-9_]+$',
                message='Slug can only contain letters, numbers, hyphens and underscores'
            )
        ],
        verbose_name='Tag Slug',
        help_text='Unique URL-friendly identifier'
    )

    class Meta:
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    """
    Ingredient model for recipe ingredients.
    """
    name = models.CharField(
        max_length=128,
        verbose_name='Ingredient Name',
        help_text='Name of the ingredient'
    )
    measurement_unit = models.CharField(
        max_length=64,
        verbose_name='Measurement Unit',
        help_text='Unit of measurement (e.g., g, ml, pcs)'
    )

    class Meta:
        verbose_name = 'Ingredient'
        verbose_name_plural = 'Ingredients'
        ordering = ['name']
        constraints = [
            UniqueConstraint(
                fields=['name', 'measurement_unit'],
                name='unique_ingredient_unit'
            )
        ]

    def __str__(self):
        return f'{self.name} ({self.measurement_unit})'


class Recipe(models.Model):
    """
    Recipe model for storing food recipes.
    """
    author = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='recipes',
        verbose_name='Recipe Author'
    )
    name = models.CharField(
        max_length=256,
        verbose_name='Recipe Name',
        help_text='Name of the recipe'
    )
    image = models.ImageField(
        upload_to='recipes/images/',
        verbose_name='Recipe Image',
        help_text='Recipe photo'
    )
    text = models.TextField(
        verbose_name='Description',
        help_text='Recipe description and instructions'
    )
    ingredients = models.ManyToManyField(
        Ingredient,
        through='RecipeIngredient',
        related_name='recipes',
        verbose_name='Ingredients'
    )
    tags = models.ManyToManyField(
        Tag,
        related_name='recipes',
        verbose_name='Tags'
    )
    cooking_time = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Cooking Time',
        help_text='Cooking time in minutes'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created At'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Updated At'
    )

    class Meta:
        verbose_name = 'Recipe'
        verbose_name_plural = 'Recipes'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class RecipeIngredient(models.Model):
    """
    Intermediate model for Recipe-Ingredient relationship with amount.
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='recipe_ingredients',
        verbose_name='Recipe'
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name='recipe_ingredients',
        verbose_name='Ingredient'
    )
    amount = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Amount',
        help_text='Amount of ingredient'
    )

    class Meta:
        verbose_name = 'Recipe Ingredient'
        verbose_name_plural = 'Recipe Ingredients'
        constraints = [
            UniqueConstraint(
                fields=['recipe', 'ingredient'],
                name='unique_recipe_ingredient'
            )
        ]

    def __str__(self):
        return f'{self.ingredient.name} in {self.recipe.name}: {self.amount} {self.ingredient.measurement_unit}'


class Favorite(models.Model):
    """
    Model for tracking user's favorite recipes.
    """
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='User'
    )
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name='Recipe'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Added to Favorites'
    )

    class Meta:
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'
        constraints = [
            UniqueConstraint(
                fields=['user', 'recipe'],
                name='unique_user_recipe_favorite'
            )
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.recipe.name}'
