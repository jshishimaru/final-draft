import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework import status
from finaldraft.models import Assignment, Subtask, Submission, Attachment , SubtaskSubmissionInfo , Comment ,User
from finaldraft.serializers.submission import SubmissionCreateSerializer, SubtaskSubmissionInfoSerializer, SubmissionListSerializer 
from finaldraft.serializers.comment import CommentSerializer 
from django.contrib.auth.mixins import LoginRequiredMixin 
from finaldraft.services.emailservice import EmailService

import json

@method_decorator(csrf_exempt, name='dispatch')
class SubmissionViewSet(View):

	def get( self , request ):
		submission_id = request.GET.get('submission_id')
		submission = get_object_or_404(Submission, pk=submission_id)
		assignment_name = submission.assignment.title
		reviewee_list = submission.reviewee.all()
		reviewee_name_list = []
		for reviewee in reviewee_list:
			reviewee_name_list.append({'username': reviewee.username})
		attachments = Attachment.objects.filter(submission=submission)
		attachment_list = []
		for attachment in attachments:
			attachment_info = {
			    'id': attachment.id,
			    'name': os.path.basename(attachment.image.name) if attachment.image else os.path.basename(attachment.file.name) if attachment.file else None
			}
			attachment_list.append(attachment_info)
		subtasks = SubtaskSubmissionInfo.objects.filter(submission=submission)
		submission_subtasks_info = []
		for subtask in subtasks:
			subtask_info = {
				'id': subtask.subtask.id,
				'name': subtask.subtask.title,
				'status': subtask.is_completed,
			}
			submission_subtasks_info.append(subtask_info)
		submission_info = {
			'repo_link': submission.repo_link,
			'date': submission.date,
			'remark': submission.remark,
			'assignment_name': assignment_name,
			'reviewees': reviewee_name_list,
			'attachments': attachment_list,
			'status': submission.is_completed,
			'subtasks': submission_subtasks_info,
			'is_approved': submission.approved_by is not None,
		}
		return JsonResponse(submission_info, safe=False)

	def post(self,request):
		data = JSONParser().parse(request)
		assignment= get_object_or_404(Assignment, pk=data.get('assignment_id'))
		subtask_list = []
		reviewer_list = list(data.get('reviewer_ids'))
		reviewee_list = list(data.get('reviewee_ids'))
		for subtask_id in data.get('subtask_ids'):
			subtask = get_object_or_404(Subtask, pk=subtask_id)
			subtask_list.append(subtask)
		
		submission_data = {
			'date': data.get('date'),
			'assignment': assignment.id,
			'remark': data.get('remark'),	
			'repo_link': data.get('repo_link'),		
		}
		reviewers=[];
		for reviewer_id in reviewer_list:
			reviewers.append( get_object_or_404(User,pk=reviewer_id) )
		print(submission_data)
		serializer = SubmissionCreateSerializer(data=submission_data)
		if serializer.is_valid():
			submission = serializer.save(assignment=assignment)
			EmailService.tag_reviewer_notifications( submission , reviewers );
			submission.reviewee.add(*reviewee_list)
			submission.reviewer.add(*reviewer_list)
			for subtask in subtask_list:
				subtask_info_data = {
					'subtask': subtask.id,
					'is_completed': False,
				}
				submission_info_serializer = SubtaskSubmissionInfoSerializer(data=subtask_info_data)
				if submission_info_serializer.is_valid():
					subtask_info = submission_info_serializer.save(subtask=subtask)
					subtask_info.submission = submission
					subtask_info.save()
					
			reponse_data = {
				'submission_id': submission.id,
			}
			return JsonResponse(reponse_data, status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	
@method_decorator(csrf_exempt, name='dispatch')	
class SubmissionEditViewSet(View):

	def post(self,request):
		submission = get_object_or_404(Submission, pk=request.POST.get('submission_id'))
		submission.is_completed = request.POST.get('is_completed')
		completed_subtask_str = request.POST.get('completed_subtasks','[]')
		total_subtasks = SubtaskSubmissionInfo.objects.filter(submission=submission)
		completed_subtasks = json.loads(completed_subtask_str)
		approved_by = request.user
		for subtask_id in completed_subtasks:
			subtask = get_object_or_404(Subtask, pk=subtask_id)
			subtask_info = get_object_or_404(submission.subtasksubmissioninfo_set, subtask=subtask)
			subtask_info.is_completed = True
			subtask_info.save()

		for subtask_info in total_subtasks:
			if subtask_info.subtask.id not in completed_subtasks:
				subtask_info.is_completed = False
				subtask_info.save()
		submission.approved_by = approved_by
		submission.save()

		return JsonResponse({'success':'Submission updated'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class SubmissionListViewSet(View):

	def get(self,request):

		user = request.user

		if user.groups.filter(name='Reviewer').exists():
			assignment = get_object_or_404(Assignment, pk=request.GET.get('assignment_id'))
			submissions=Submission.objects.filter(assignment=assignment)
			serializer = SubmissionListSerializer(submissions, many=True)
			return JsonResponse(serializer.data, safe=False)
		else:
			submissions = Submission.objects.filter(reviewee=user)
			serializer = SubmissionListSerializer(submissions, many=True)
			return JsonResponse(serializer.data, safe=False)


@method_decorator(csrf_exempt, name='dispatch')
class SubmissionApproveViewSet(View):

	def post(self,request):
		submission = get_object_or_404(Submission, pk=request.POST.get('submission_id'))
		assignment=submission.assignment
		if request.user not in assignment.reviewer.all():
			return JsonResponse({'error':'You are not allowed to approve this submission'}, status=status.HTTP_403_FORBIDDEN)
		submission.approved_by = request.user
		submission.save()
		return JsonResponse({'success':'Submission approved'}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class CommentViewSet( View):

	def get(self,request):
		submission = get_object_or_404(Submission, pk=request.GET.get('submission_id'))
		comments = Comment.objects.filter(submission=submission)
		comment_list = []
		for comment in comments:
			comment_info = {
				'id': comment.id,
				'content': comment.content,
				'author': comment.author.username,
			}
			comment_list.append(comment_info)

		return JsonResponse(comment_list, safe=False)

	def post(self,request):
		submission = get_object_or_404(Submission, pk=request.POST.get('submission_id'))
		author = request.user.id
		content = request.POST.get('content')
		comment = {
			'content': content,
			'submission': submission.id,
			'author': author,
		}
		serializer = CommentSerializer(data=comment)
		if serializer.is_valid():
			serializer.save()
			return JsonResponse({'success':'Comment added'}, status=status.HTTP_200_OK)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)