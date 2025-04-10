from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from finaldraft.views.assignment import AssignmentListViewSet, AssignmentInfoViewSet, AssignmentSubtaskListViewSet
from finaldraft.views.group import GroupListViewSet, GroupMemberListViewSet
from finaldraft.views.submission import SubmissionViewSet, SubmissionListViewSet, SubmissionApproveViewSet , SubmissionEditViewSet , CommentViewSet
from finaldraft.views.attachment import SubmissionAttachmentList , AttachmentURI , AssignmentAttachmentList
from finaldraft.views.User import UserSelfProfileViewSet , GetallReviewees , GetallReviewers , GetUserStatus , getUsernames , GetAssignmentReviewers , getCompleteUserInfo

urlpatterns = [
	path('user/profile/self/' , UserSelfProfileViewSet.as_view() , name='profile'),
	path('users/reviewees/' , GetallReviewees.as_view() , name='reviewees'),
	path('users/reviewers/' , GetallReviewers.as_view() , name='reviewers'),
	path('users/assignments/', AssignmentListViewSet.as_view() , name='assignment'),
	path('users/groups/', GroupListViewSet.as_view() , name='group'),
	path('users/usernames/', getUsernames.as_view() , name='usernames'),
	path('users/userinfo/', getCompleteUserInfo.as_view() , name='userinfo'),
	path('assignment/', AssignmentInfoViewSet.as_view() , name='assignemntInfo'),
	path('assignment/users/status/', GetUserStatus.as_view() , name='userstatus'),
	path('assignment/users/reviewers/', GetAssignmentReviewers.as_view() , name='userstatus'),	
	path('group/members/', GroupMemberListViewSet.as_view() , name='groupmembers'),
	path('assignment/subtasks/', AssignmentSubtaskListViewSet.as_view() , name='subtask'),
	path('assignment/users/submissions/', SubmissionViewSet.as_view() , name='submission'),
	path('assignment/submissions/' , SubmissionListViewSet.as_view() , name='submissionlist'),
	path('assignment/submissions/edit/' , SubmissionEditViewSet.as_view() , name='submissionlist'),
	path('assignment/submissions/attachments/', SubmissionAttachmentList.as_view() , name='attachment'),
	path('assignment/attachments/', AssignmentAttachmentList.as_view() , name='attachmenturi'),
	path('assignment/submissions/approve/', SubmissionApproveViewSet.as_view() , name='submissionapprove'),
	path('attachments/uri/', AttachmentURI.as_view() , name='attachmenturi'),
	path('assignment/submissions/comments/', CommentViewSet.as_view() , name='comment'),
]
