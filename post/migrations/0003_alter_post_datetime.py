# Generated by Django 3.2.10 on 2022-10-21 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post', '0002_alter_post_datetime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='DateTime',
            field=models.DateField(verbose_name='Department date'),
        ),
    ]