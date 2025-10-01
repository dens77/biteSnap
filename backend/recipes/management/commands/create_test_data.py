from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from recipes.models import Tag

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test users and tags for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before creating new',
        )

    def handle(self, *args, **options):
        """Create test data."""
        clear_existing = options['clear']

        if clear_existing:
            # Clear existing test data (be careful in production!)
            User.objects.filter(username__startswith='test').delete()
            User.objects.filter(username='chef').delete()
            Tag.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Cleared existing test data')
            )

        self.create_test_users()
        self.create_test_tags()

        self.stdout.write(
            self.style.SUCCESS('Test data created successfully!')
        )
        self.stdout.write('You can login with:')
        self.stdout.write('- Username: testuser1, Password: testpass123')
        self.stdout.write('- Username: chef, Password: chefpass123')

    def create_test_users(self):
        """Create test users."""
        users_data = [
            {
                'username': 'testuser1',
                'email': 'test1@bitesnap.com',
                'password': 'testpass123',
                'first_name': 'John',
                'last_name': 'Doe'
            },
            {
                'username': 'testuser2',
                'email': 'test2@bitesnap.com',
                'password': 'testpass123',
                'first_name': 'Jane',
                'last_name': 'Smith'
            },
            {
                'username': 'chef',
                'email': 'chef@bitesnap.com',
                'password': 'chefpass123',
                'first_name': 'Chef',
                'last_name': 'Gordon'
            },
        ]

        created_count = 0
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                created_count += 1
                self.stdout.write(
                    f'Created user: {user.username} ({user.email})'
                )

        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} test users')
        )

    def create_test_tags(self):
        """Create test tags."""
        tags_data = [
            {'name': 'Breakfast', 'slug': 'breakfast'},
            {'name': 'Lunch', 'slug': 'lunch'},
            {'name': 'Dinner', 'slug': 'dinner'},
            {'name': 'Dessert', 'slug': 'dessert'},
            {'name': 'Vegetarian', 'slug': 'vegetarian'},
            {'name': 'Quick', 'slug': 'quick'},
        ]

        created_count = 0
        for tag_data in tags_data:
            tag, created = Tag.objects.get_or_create(**tag_data)
            if created:
                created_count += 1
                self.stdout.write(f'Created tag: {tag.name}')

        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} test tags')
        )
