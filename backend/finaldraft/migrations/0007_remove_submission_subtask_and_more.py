# Generated by Django 5.1.1 on 2024-10-15 18:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finaldraft', '0006_submission_subtask_subtasksubmissioninfo'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='submission',
            name='subtask',
        ),
        migrations.RemoveField(
            model_name='subtasksubmissioninfo',
            name='reviewee',
        ),
    ]
