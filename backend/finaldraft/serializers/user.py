from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
		username = serializers.CharField()
		first_name = serializers.CharField()
		last_name = serializers.CharField()
		email = serializers.CharField()
		is_reviewer = serializers.BooleanField()

		class Meta:
			model = User
			fields = ['username','first_name','last_name','email','is_reviewer','id']


class UserDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['username','first_name','last_name','id']

class RevieweeSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['username','id']