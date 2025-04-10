from rest_framework import serializers
from finaldraft.models import Attachment

class AttachmentURLSerializer(serializers.ModelSerializer):
	class Meta:
		model = Attachment
		fields = ['id','url']

class AttachmentSerializer(serializers.ModelSerializer):

	class Meta:
		model = Attachment
		fields = ['id', 'image', 'file', 'assignment', 'submission']

	def validate(self, data):
		if data.get('file') and data.get('image'):
			raise serializers.ValidationError("Only one of 'file' or 'image' can be provided, not both.")
		if not data.get('file') and not data.get('image'):
			raise serializers.ValidationError("One of 'file' or 'image' must be provided.")
		return data