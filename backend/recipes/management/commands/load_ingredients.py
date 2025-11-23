import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from recipes.models import Ingredient


class Command(BaseCommand):
    help = 'Load ingredients from CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing ingredients before loading',
        )

    def handle(self, *args, **options):
        """Load ingredients from CSV file."""
        clear_existing = options['clear']

        # Path to data directory
        data_dir = os.path.join(settings.BASE_DIR.parent, 'data')
        file_path = os.path.join(data_dir, 'ingredients.csv')

        self.load_from_csv(file_path, clear_existing)

    def load_from_csv(self, file_path, clear_existing=False):
        """Load ingredients from CSV file using bulk operations for better performance."""
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'CSV file not found: {file_path}')
            )
            return

        if clear_existing:
            Ingredient.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Cleared existing ingredients')
            )

        self.stdout.write('Loading ingredients from CSV...')

        # Collect all ingredients to create
        ingredients_to_create = []
        skipped_count = 0

        # Get existing ingredient names to avoid duplicates (1 query instead of N)
        existing_names = set(
            Ingredient.objects.values_list('name', flat=True)
        )
        self.stdout.write(f'Found {len(existing_names)} existing ingredients')

        with open(file_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)

            for row_num, row in enumerate(csv_reader, 1):
                if len(row) != 2:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipping row {row_num}: Invalid format'
                        )
                    )
                    skipped_count += 1
                    continue

                name, measurement_unit = row
                name = name.strip()
                measurement_unit = measurement_unit.strip()

                if not name or not measurement_unit:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipping row {row_num}: Empty name or unit'
                        )
                    )
                    skipped_count += 1
                    continue

                # Skip if already exists
                if name in existing_names:
                    skipped_count += 1
                    continue

                # Add to batch for bulk creation
                ingredients_to_create.append(
                    Ingredient(name=name, measurement_unit=measurement_unit)
                )

                # Progress indicator
                if len(ingredients_to_create) % 100 == 0:
                    self.stdout.write(f'Processed {len(ingredients_to_create)} new ingredients...')

        # Bulk create all at once (much faster with remote databases)
        if ingredients_to_create:
            self.stdout.write(f'Creating {len(ingredients_to_create)} ingredients in bulk...')
            Ingredient.objects.bulk_create(
                ingredients_to_create,
                batch_size=500,  # Insert in batches of 500
                ignore_conflicts=True  # Skip duplicates if any
            )
            created_count = len(ingredients_to_create)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully loaded {created_count} ingredients from CSV'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING('No new ingredients to add')
            )

        if skipped_count:
            self.stdout.write(
                self.style.WARNING(f'Skipped {skipped_count} items (duplicates or invalid)')
            )
