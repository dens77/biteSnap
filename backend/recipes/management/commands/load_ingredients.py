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
        """Load ingredients from CSV file."""
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

        created_count = 0
        skipped_count = 0

        self.stdout.write('Loading ingredients from CSV...')

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

                # Create ingredient if it doesn't exist
                ingredient, created = Ingredient.objects.get_or_create(
                    name=name,
                    measurement_unit=measurement_unit
                )

                if created:
                    created_count += 1
                    if created_count % 100 == 0:
                        self.stdout.write(f'Loaded {created_count} ingredients...')
                else:
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully loaded {created_count} ingredients from CSV'
            )
        )
        if skipped_count:
            self.stdout.write(
                self.style.WARNING(f'Skipped {skipped_count} items')
            )

