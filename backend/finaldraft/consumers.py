import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatRoom, ChatMessage
from django.shortcuts import get_object_or_404


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat messages
    """
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        # Check if user is authenticated and has access to this room
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Check if user is a member of the room
        is_member = await self.is_room_member(self.user.id, self.room_id)
        if not is_member:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        
        if not message:
            return
        
        # Save message to database
        chat_message = await self.save_message(message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.user.username,
                'user_id': self.user.id,
                'message_id': chat_message.get('id'),
                'timestamp': chat_message.get('timestamp'),
                'first_name': self.user.first_name,
                'last_name': self.user.last_name
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id'],
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
            'first_name': event['first_name'],
            'last_name': event['last_name']
        }))
    
    @database_sync_to_async
    def save_message(self, message):
        """Save a new message to the database"""
        room = get_object_or_404(ChatRoom, pk=self.room_id)
        chat_message = ChatMessage.objects.create(
            room=room,
            sender=self.user,
            content=message
        )
        return {
            'id': chat_message.id,
            'timestamp': chat_message.timestamp.isoformat()
        }
    
    @database_sync_to_async
    def is_room_member(self, user_id, room_id):
        """Check if the user is a member of the room"""
        try:
            room = ChatRoom.objects.get(pk=room_id)
            return room.members.filter(pk=user_id).exists()
        except ChatRoom.DoesNotExist:
            return False