from rest_framework import serializers
from finaldraft.models import Submission, SubtaskSubmissionInfo


class SubmissionCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Submission
		fields = [
			'assignment',
			'remark',
			'is_completed',
			'repo_link',
		]

class SubtaskSubmissionInfoSerializer(serializers.ModelSerializer):
	class Meta:
		model = SubtaskSubmissionInfo
		fields = [
			'is_completed',
		]

class SubmissionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Submission
		fields = '__all__'

class SubmissionListSerializer(serializers.ModelSerializer):
    approved_by_username = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = ['id', 'reviewee', 'date', 'approved_by_username']

    def get_approved_by_username(self, obj):
        return obj.approved_by.username if obj.approved_by else None