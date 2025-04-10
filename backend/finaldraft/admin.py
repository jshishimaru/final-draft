from django.contrib import admin
from .models import Assignment,Submission,Attachment,Subtask,GroupInfo,SubtaskSubmissionInfo , Comment
# Register your models here.

admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(Attachment)
admin.site.register(Subtask)
admin.site.register(SubtaskSubmissionInfo)
admin.site.register(GroupInfo)
admin.site.register(Comment)