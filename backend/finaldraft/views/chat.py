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
from finaldraft.models import User, ChatRoom, ChatMessage, Assignment
from django.core.exceptions import ValidationError
import json
from finaldraft.serializers.chat import ChatRoomSerializer, ChatMessageSerializer

# Keep the custom serializers for backward compatibility
class ChatRoomSerializerLegacy:
    @staticmethod
    def serialize(room, include_messages=False):
        data = {
            'id': room.id,
            'room_identifier': room.room_identifier,
            'is_direct_message': room.is_direct_message,
            'created_at': room.created_at.isoformat(),
            'members': list(room.members.values('id', 'username')),
        }
        
        if room.assignment:
            data['assignment'] = {
                'id': room.assignment.id,
                'title': room.assignment.title
            }
            
        if include_messages:
            data['messages'] = ChatMessageSerializerLegacy.serialize_many(room.messages.all())
            
        return data
    
    @staticmethod
    def serialize_many(rooms):
        return [ChatRoomSerializerLegacy.serialize(room) for room in rooms]


class ChatMessageSerializerLegacy:
    @staticmethod
    def serialize(message):
        return {
            'id': message.id,
            'content': message.content,
            'timestamp': message.timestamp.isoformat(),
            'sender': {
                'id': message.sender.id,
                'username': message.sender.username,
                'first_name': message.sender.first_name,
                'last_name': message.sender.last_name
            },
            'room_id': message.room.id
        }
    
    @staticmethod
    def serialize_many(messages):
        return [ChatMessageSerializerLegacy.serialize(message) for message in messages]


@method_decorator(csrf_exempt, name='dispatch')
class ChatRoomListView(View):
    def get(self, request):
        """Get all chat rooms the user is a member of"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        rooms = ChatRoom.objects.filter(members=request.user).order_by('-created_at')
        serializer = ChatRoomSerializer(rooms, many=True)
        return JsonResponse(serializer.data, safe=False)
    
    def post(self, request):
        """Create a new direct message chat room between users"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = JSONParser().parse(request)
        recipient_id = data.get('recipient_id')
        
        if not recipient_id:
            return JsonResponse({'error': 'Recipient ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipient = get_object_or_404(User, pk=recipient_id)
            room, created = ChatRoom.get_or_create_direct_chat_room(request.user, recipient)
            serializer = ChatRoomSerializer(room)
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ChatRoomDetailView(View):
    def get(self, request, room_id):
        """Get details of a specific chat room with messages"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        room = get_object_or_404(ChatRoom, pk=room_id)
        
        # Check if user is a member of this room
        if request.user not in room.members.all():
            return JsonResponse({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ChatRoomSerializer(room)
        messages = room.messages.all().order_by('-timestamp')[:50]  # Get last 50 messages
        message_serializer = ChatMessageSerializer(messages, many=True)
        
        data = serializer.data
        data['messages'] = message_serializer.data
        
        return JsonResponse(data)


@method_decorator(csrf_exempt, name='dispatch')
class ChatMessageView(View):
    def get(self, request, room_id):
        """Get all messages in a chat room"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        room = get_object_or_404(ChatRoom, pk=room_id)
        
        # Check if user is a member of this room
        if request.user not in room.members.all():
            return JsonResponse({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Support pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        offset = (page - 1) * page_size
        
        messages = room.messages.all().order_by('-timestamp')[offset:offset+page_size]
        serializer = ChatMessageSerializer(messages, many=True)
        return JsonResponse(serializer.data, safe=False)
    
    def post(self, request, room_id):
        """Send a new message to a chat room"""
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        room = get_object_or_404(ChatRoom, pk=room_id)
        
        # Check if user is a member of this room
        if request.user not in room.members.all():
            return JsonResponse({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = JSONParser().parse(request)
        content = data.get('content')
        
        if not content:
            return JsonResponse({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = ChatMessage.objects.create(
            room=room,
            sender=request.user,
            content=content
        )
        
        serializer = ChatMessageSerializer(message)
        # Note: In a real Django Channels implementation, we would send a WebSocket message here
        # from channels.layers import get_channel_layer
        # from asgiref.sync import async_to_sync
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f"chat_{room_id}", {"type": "chat.message", "message": serializer.data}
        # )
        
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)