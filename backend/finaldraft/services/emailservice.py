from django.core.mail import send_mass_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

class EmailService:
    
	@staticmethod
	def send_assignment_notifications(assignment, reviewees):
		mail_data = []
        
		for reviewee in reviewees:
			subject = f'New Assignment: {assignment.title}'
			html_message = render_to_string('emails/new_assignment_notification.html', {
			    'assignment': assignment,
			    'reviewee': reviewee
			})
			plain_message = strip_tags(html_message)
			from_email = settings.EMAIL_HOST_USER
			to_email = reviewee.email
            
		mail_data.append((
		    subject,
		    plain_message,
		    from_email,
		    [to_email]
		))
        
		try:
			send_mass_mail(tuple(mail_data), fail_silently=False)
			return True
		except Exception as e:
			print(f"Error sending emails: {str(e)}")
			return False
        
       
	@staticmethod
	def tag_reviewer_notifications(submission, reviewers):
		mail_data = []	

		for reviewer in reviewers:
			subject = 'New Review Request'
			html_message = render_to_string('emails/tag_reviewer_notification.html', {
			    'submission': submission,
			    'reviewer_name': reviewer.first_name,
			    'assignment': submission.assignment,
			    'review_url': f'http://localhost:5173/homepage/assignments/submissions/{submission.assignment.id}/review/{submission.id}'
			})
			plain_message = strip_tags(html_message)
			from_email = settings.EMAIL_HOST_USER
			to_email = reviewer.email

			mail_data.append((
			    subject,
			    plain_message,
			    from_email,
			    [to_email]
			))

		try:
			send_mass_mail(tuple(mail_data), fail_silently=False)
			return True
		except Exception as e:
			print(f"Error sending emails: {str(e)}")
			return False

            

