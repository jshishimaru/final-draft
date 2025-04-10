import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from finaldraft.models import Submission, Attachment , Assignment
from finaldraft.serializers.attachment import AttachmentSerializer
from django.views.decorators.csrf import csrf_protect 


@method_decorator(csrf_exempt, name='dispatch')
class SubmissionAttachmentList(View):
	
	def get(self, request):
		submission = get_object_or_404(Submission, pk=request.GET.get('submission_id'))
		attachments = Attachment.objects.filter(submission=submission)
		attachment_list = []
		for attachment in attachments:
			attachment_info = {
			    'id': attachment.id,
			    'name': os.path.basename(attachment.image.name) if attachment.image else os.path.basename(attachment.file.name) if attachment.file else None
			}
			attachment_list.append(attachment_info)
		return JsonResponse(attachment_list, safe=False)
		
	def post(self,request):
		data = request.POST
		image = request.FILES.get('image')
		file = request.FILES.get('file')
		print(data.get('submission_id'))
		submission = get_object_or_404(Submission, pk=data.get('submission_id'))
		attachment_data = {
			'image': image,
			'file': file,
			'submission': submission.id,
		}
		serializer = AttachmentSerializer(data=attachment_data)
		if serializer.is_valid():
			serializer.save()
			return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class AssignmentAttachmentList(View):

	def get( self , request):
		assignment = get_object_or_404(Assignment, pk=request.GET.get('assignment_id'))
		attachments = Attachment.objects.filter(assignment=assignment)
		attachment_list = []
		for attachment in attachments:
			attachment_info = {
			    'id': attachment.id,
			    'name': os.path.basename(attachment.image.name) if attachment.image else os.path.basename(attachment.file.name) if attachment.file else None,
				'url': request.build_absolute_uri(attachment.image.url) if attachment.image else request.build_absolute_uri(attachment.file.url) if attachment.file else None
			}
			attachment_list.append(attachment_info)
		return JsonResponse(attachment_list, safe=False)
	
	def post(self,request):
		data = request.POST
		image = request.FILES.get('image')
		file = request.FILES.get('file')
		assignment = get_object_or_404(Assignment, pk=data.get('assignment_id'))
		attachment_data = {
			'image': image,
			'file': file,
			'assignment': assignment.id,
		}
		serializer = AttachmentSerializer(data=attachment_data)
		if serializer.is_valid():
			serializer.save()
			return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class AttachmentURI(View):

	def get(self, request):
		attachment = get_object_or_404(Attachment, pk=request.GET.get('attachment_id'))
		if attachment.image:
			url = request.build_absolute_uri(attachment.image.url)
		elif attachment.file:
			url = request.build_absolute_uri(attachment.file.url)
		else:
			url = None
		return JsonResponse({'url': url})
	
	def post(self, request):
		attachment = get_object_or_404(Attachment, pk=request.POST.get('attachment_id'))