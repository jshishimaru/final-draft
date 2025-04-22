from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from finaldraft.models import Assignment, GroupInfo, User , Subtask , Attachment , ChatRoom
from finaldraft.serializers.assignment import AssignmentSerializer
from finaldraft.serializers.subtask import SubtaskSerializer
from rest_framework.authentication import SessionAuthentication
from finaldraft.services.emailservice import EmailService
import json


class AssignmentListViewSet(APIView):

	@csrf_exempt
	def get( self , request , format=None):
		user = request.user
		if not user.is_authenticated:
			return Response({'error': 'User not authenticated'}, status=status.HTTP_403_FORBIDDEN)
		assignments = Assignment.objects.filter( Q(reviewee=user) or Q(reviewer=user) )
		serializer = AssignmentSerializer( assignments , many=True )
		return Response(serializer.data)
	
@method_decorator(csrf_exempt, name='dispatch')	
class AssignmentInfoViewSet( View):

	def get(self, request):
		assignment_id = request.GET.get('assignment_id')
		assignment = get_object_or_404(Assignment, pk=assignment_id)		
		serializer = AssignmentSerializer( assignment )
		return JsonResponse(serializer.data)

	def post(self, request):
		data = request.POST
		# reviewee_groups = data.get('reviewee_groups', [])
		# reviewee_users = data.get('reviewee_users', [])
		# reviewer_groups = data.get('reviewer_groups', [])
		# reviewer_users = data.get('reviewer_users', [])	

		reviewee_users_str = data.get('reviewee_users', '[]')
		reviewee_users = json.loads(reviewee_users_str)

		# Repeat for other similar fields
		reviewee_groups_str = data.get('reviewee_groups', '[]')
		reviewee_groups = json.loads(reviewee_groups_str)

		reviewer_users_str = data.get('reviewer_users', '[]')
		reviewer_users = json.loads(reviewer_users_str)

		reviewer_groups_str = data.get('reviewer_groups', '[]')
		reviewer_groups = json.loads(reviewer_groups_str)

		all_user_ids= User.objects.values_list('id', flat=True)
		reviewee_list = []
		reviewer_list = []

		for group_id in reviewee_groups:
			group = get_object_or_404(GroupInfo, pk=group_id)
			user_list=group.member.all()
			reviewee_list.extend(user_list)

		for group_id in reviewer_groups:
			group = get_object_or_404(GroupInfo , pk=group_id)
			user_list=group.member.all()
			reviewer_list.extend(user_list)

		for user_id in reviewee_users:
			user = get_object_or_404(User, pk=user_id)
			reviewee_list.append(user)

		for user_id in reviewer_users:
			user = get_object_or_404(User, pk=user_id)
			reviewer_list.append(user)

		assignment_data = {
			'title': data.get('title'),
			'date': data.get('date'),
			'deadline': data.get('deadline'),
			'description': data.get('description'),
			'creator': request.user.id,
		}

		serializer = AssignmentSerializer(data=assignment_data)
		if serializer.is_valid():
			assignment=serializer.save()
			assignment.reviewee.add(*reviewee_list)
			assignment.reviewer.add(*reviewer_list)

			room, created = ChatRoom.get_or_create_assignment_chat_room(assignment)
			
			# Add the creator, reviewees, and reviewers to the chat room
			users_to_add = set([request.user])  
			users_to_add.update(reviewee_list)  
			users_to_add.update(reviewer_list)  #
			
			# Add all collected users to the chat room
			room.members.add(*list(users_to_add))

			send_to_mail = request.POST.get('send_to_mail', False)
			if send_to_mail:
				EmailService.send_assignment_notifications(assignment, reviewee_list)

			response_data={
				'assignment_id': assignment.id,
			}
			
			return JsonResponse( response_data , status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request):
		if request.user.groups.filter(name='Reviewer').exists():
			assignment_id = request.GET.get('assignment_id')
			assignment = get_object_or_404(Assignment, pk=assignment_id)
			assignment.delete()
			return JsonResponse({'message': 'Assignment deleted successfully'})
		else:
			return JsonResponse({'error': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)

@method_decorator(csrf_exempt, name='dispatch')
class AssignmentSubtaskListViewSet( View ):

	def get( self , request ):
		assignment = get_object_or_404(Assignment, pk=request.GET.get('assignment_id'))
		subtasks = Subtask.objects.filter(assignment=assignment)
		serializer = SubtaskSerializer( subtasks , many=True )
		return JsonResponse(serializer.data, safe=False)
	
	def post(self, request):
		data = JSONParser().parse(request)
		assignment = get_object_or_404(Assignment, pk=data.get('assignment_id'))
		subtask_data = {
			'title': data.get('title'),
			'date': data.get('date'),
			'deadline': data.get('deadline'),
			'assignment': assignment.id,
		}
		serializer = SubtaskSerializer(data=subtask_data)
		if serializer.is_valid():
			subtask = serializer.save(assignment=assignment)
			return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)