from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from finaldraft.models import GroupInfo
from finaldraft.serializers.groupinfo import GroupInfoSerializer 
from finaldraft.serializers.user import UserDetailSerializer


@method_decorator(csrf_exempt, name='dispatch')
class GroupListViewSet( View ):
	def get(self, request):
		group_list = []
		group_ids = list(GroupInfo.objects.values_list('id', flat=True))
		for group_id in group_ids:
			group = get_object_or_404(GroupInfo, pk=group_id)
			if( request.user in group.member.all() ):
				group_list.append(group)
		
		serializer = GroupInfoSerializer( group_list , many=True )
		return JsonResponse(serializer.data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class GroupMemberListViewSet( View ):
	def get( self , request ):
		group_id = request.GET.get('group_id')
		group = GroupInfo.objects.filter(pk=group_id).first()
		if group is None:
			return JsonResponse({'error':'Group not found'}, status=status.HTTP_404_NOT_FOUND)
		member_list = group.member.all()
		serializer = UserDetailSerializer( member_list , many=True )
		return JsonResponse(serializer.data, safe=False)