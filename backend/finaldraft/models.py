from django.db import models
import datetime
from django.contrib.auth.models import User


class Assignment(models.Model):
	title = models.CharField(max_length=50)
	date = models.DateField( default=datetime.date.today)
	deadline = models.DateField()
	description = models.CharField(max_length=50)
	creator = models.ForeignKey(User, on_delete=models.CASCADE)
	reviewer = models.ManyToManyField(User , related_name='reviewer_assignments' , blank=True)
	reviewee = models.ManyToManyField(User , related_name='reviewee_assignments' , blank=True)
	maxTeamSize = models.IntegerField(default=1)

	def __str__(self):
		return str(self.pk) + " - " + self.title

class Subtask( models.Model):
	title = models.CharField(max_length=200)
	date = models.DateField( default=datetime.date.today)
	deadline = models.DateField()
	assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE , blank=True)

	def __str__(self):
		return str(self.pk) + " - " + self.title

class Submission( models.Model):
	date = models.DateTimeField( default=datetime.datetime.now)	
	reviewee = models.ManyToManyField(User , related_name='reviewee_submissions' , blank=True)
	reviewer = models.ManyToManyField(User , related_name='reviewer_submissions' , blank=True)
	approved_by = models.ForeignKey(User, on_delete=models.CASCADE , related_name='approved_submissions' , null=True , blank=True)
	remark = models.CharField(max_length=200 , blank=True)
	is_completed = models.BooleanField(default=False)
	repo_link = models.URLField(blank=True)
	assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)

	def __str__(self):
		return str(self.pk) + " - " + self.assignment.title + " " + str(self.date)


class SubtaskSubmissionInfo(models.Model):
	subtask = models.ForeignKey(Subtask, on_delete=models.CASCADE)
	submission = models.ForeignKey(Submission, on_delete=models.CASCADE , null=True)
	is_completed = models.BooleanField(default=False)

	def __str__(self):
		return self.subtask.title + " " + str(self.submission.date)


class Attachment(models.Model):
	image=models.ImageField(upload_to='finaldraft/media/images/', blank=True , null=True)
	file=models.FileField(upload_to='finaldraft/media/files/', blank=True , null=True)
	assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, blank=True , null=True)
	submission = models.ForeignKey(Submission, on_delete=models.CASCADE , blank=True , null=True)

	def __str__(self):
		return str(self.pk)

class GroupInfo(models.Model):
	name = models.CharField(max_length=50)
	member = models.ManyToManyField(User, related_name='groupinfo' , blank=True)

	def __str__(self):
		return str(self.pk) + " - " + self.name

class Comment(models.Model):
	content = models.CharField(max_length=200)
	submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
	author = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return str(self.pk) + " - " + self.submission.assignment.title + " " + self.author.username
	
