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
	

class ChatRoom(models.Model):
    """Represents a chat room, either for an assignment or a direct message."""
    # Unique identifier, e.g., 'assignment_123' or 'dm_5_8'
    room_identifier = models.CharField(max_length=100, unique=True, help_text="Unique identifier for the chat room")
    assignment = models.OneToOneField(Assignment, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_room', help_text="Link to assignment if it's an assignment group chat")
    members = models.ManyToManyField(User, related_name='chat_rooms', help_text="Users participating in this chat")
    is_direct_message = models.BooleanField(default=False, help_text="True if this is a direct message between two users")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.assignment:
            return f"Chat for Assignment: {self.assignment.title}"
        elif self.is_direct_message:
            member_names = list(self.members.values_list('username', flat=True))
            if len(member_names) == 2:
                 return f"Direct Chat between {member_names[0]} and {member_names[1]}"
            else:
                 return f"Direct Chat Room {self.pk}" # Fallback
        return f"Chat Room {self.pk}"

    @staticmethod
    def get_or_create_direct_chat_room(user1, user2):
        """Gets or creates a direct chat room for two users."""
        if user1.id == user2.id:
            raise ValueError("Cannot create a direct chat room with the same user.")
        user_ids = sorted([user1.id, user2.id])
        room_identifier = f"dm_{user_ids[0]}_{user_ids[1]}"

        # Query based on identifier or members (more robust)
        room = ChatRoom.objects.filter(
            Q(room_identifier=room_identifier) |
            (Q(is_direct_message=True) & Q(members=user1) & Q(members=user2))
        ).distinct().first()

        created = False
        if not room:
            room = ChatRoom.objects.create(
                room_identifier=room_identifier,
                is_direct_message=True
            )
            room.members.add(user1, user2)
            created = True
        return room, created

    @staticmethod
    def get_or_create_assignment_chat_room(assignment):
        """Gets or creates a chat room for an assignment."""
        room_identifier = f"assignment_{assignment.id}"
        room, created = ChatRoom.objects.get_or_create(
            assignment=assignment,
            defaults={'room_identifier': room_identifier, 'is_direct_message': False}
        )
        # Optional: Add relevant users from the assignment to the members list upon creation
        # if created:
        #     members_to_add = set([assignment.creator])
        #     members_to_add.update(assignment.reviewer.all())
        #     members_to_add.update(assignment.reviewee.all())
        #     # Add other relevant users if needed (e.g., from submissions)
        #     room.members.add(*list(members_to_add))
        return room, created


class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp'] 

    def __str__(self):
        return f"Message from {self.sender.username} in Room {self.room.pk} at {self.timestamp}"