from rest_framework import serializers
from finaldraft.models import GroupInfo


class GroupInfoSerializer(serializers.ModelSerializer):
	class Meta:
		model = GroupInfo
		fields = '__all__'
