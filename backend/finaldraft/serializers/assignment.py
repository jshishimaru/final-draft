from rest_framework import serializers
from finaldraft.models import Assignment
from finaldraft.serializers.subtask import SubtaskSerializer
from finaldraft.serializers.attachment import AttachmentURLSerializer


class AssignmentSerializer(serializers.ModelSerializer):

	class Meta:
		model = Assignment
		fields = '__all__'

class AssignmentInfoSerializer(serializers.ModelSerializer):

	class Meta:
		model = Assignment
		fields = [
			'title',
			'date',
			'deadline',
			'description',
			'creator',	
		]