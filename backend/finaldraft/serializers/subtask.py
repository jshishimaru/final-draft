from rest_framework import serializers
from finaldraft.models import Subtask


class SubtaskSerializer(serializers.ModelSerializer):
	class Meta:
		model = Subtask
		fields = '__all__'
