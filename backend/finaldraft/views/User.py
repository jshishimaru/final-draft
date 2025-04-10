from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import User
from finaldraft.serializers.user import UserProfileSerializer , RevieweeSerializer
from finaldraft.models import Assignment , Submission , GroupInfo
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json

class UserSelfProfileViewSet(View):
	def get(self, request):
		user = request.user
		is_reviewer = user.groups.filter(name='Reviewer').exists()
		user_data = {
			'username': user.username,
			'first_name': user.first_name,
			'last_name': user.last_name,
			'email': user.email,
			'is_reviewer': is_reviewer,
			'id': user.id
		}
		serializer = UserProfileSerializer(user_data)
		return JsonResponse(serializer.data)

class GetallReviewees(View):
	def get(self, request):
		users = User.objects.all()
		reviewee_list = []
		for user in users:
			if user.groups.filter(name='Reviewee').exists():
				reviewee_list.append(user)
		serializer = RevieweeSerializer(reviewee_list, many=True)
		return JsonResponse(serializer.data, safe=False)

class GetallReviewers(View):
	def get(self, request):
		users = User.objects.all()
		reviewer_list = []
		for user in users:
			if not user.groups.filter(name='Reviewee').exists():
				reviewer_list.append(user)
		serializer = RevieweeSerializer(reviewer_list, many=True)
		return JsonResponse(serializer.data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class GetUserStatus(View):
	def get(self, request):
		assignment_id = request.GET.get('assignment_id')
		assignment = Assignment.objects.get(id=assignment_id)
		user_set = assignment.reviewee.all()
		status=[]
		
		for user in assignment.reviewee.all():
			is_completed = False;
			is_submitted = False;
			assignment_submissions = Submission.objects.filter(assignment=assignment)
			for submission in assignment_submissions:
				if submission.reviewee.filter(id=user.id).exists():
					is_submitted = True
					if submission.is_completed:
						is_completed = True
						break
			response = {
				'id': user.id,
				'username': user.username,
				'status': 'completed' if is_completed else 'in_iteration' if is_submitted else 'pending'
			}
			status.append(response)
		return JsonResponse(status , safe=False)	

class GetAssignmentReviewers(View):
	def get(self, request):
		assignment_id = request.GET.get('assignment_id')
		assignment = Assignment.objects.get(id=assignment_id)
		reviewers = assignment.reviewer.all()
		reviewer_list = []
		for reviewer in reviewers:
			reviewer_list.append({'id': reviewer.id, 'username': reviewer.username})
		return JsonResponse(reviewer_list, safe=False)

class getUsernames(View):

	def get(self,request):
		print(request.GET.get('user_ids'))
		user_ids_str = request.GET.get('user_ids')
		try:
			user_ids = json.loads(user_ids_str)
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid JSON format'}, status=400)

		user_info = []
		for user_id in user_ids:
			user = User.objects.get(id=user_id)
			user_info.append({'id': user.id, 'username': user.username})
		return JsonResponse(user_info, safe=False)

class getCompleteUserInfo(View):
	def get(self,request):
		user_id = request.GET.get('user_id')
		user = User.objects.get(id=user_id)
		user_data = {
			'username': user.username,
			'first_name': user.first_name,
			'last_name': user.last_name,
			'is_reviewer': user.groups.filter(name='Reviewer').exists()
		}
		group_names=[];
		for group in GroupInfo.objects.filter(member=user):
			group_names.append(group.name)
		user_data['groups'] = group_names
		assignment_statuses = []
		for assignment in Assignment.objects.filter(reviewer=user):
			submission_found = False;
			completed = False;
			submissions = Submission.objects.filter(assignment=assignment)
			for submission in submissions:
					if submission.reviewee.filter(id=user.id).exists():
						submission_found = True;
						if submission.is_completed:
							completed = True;
							break;
			if( completed ):
				assignment_statuses.append({'assignment': assignment.title, 'status': 'completed'})
			elif( submission_found ):
				assignment_statuses.append({'assignment': assignment.title, 'status': 'in_iteration'})
			else:
				assignment_statuses.append({'assignment': assignment.title, 'status': 'pending'})
		
		user_data['assignment_statuses'] = assignment_statuses
		return JsonResponse(user_data)