from rest_framework import serializers
from finaldraft.models import ChatRoom, ChatMessage
from finaldraft.serializers.user import UserDetailSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model using Django REST Framework"""
    sender = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'timestamp', 'sender', 'room']
        read_only_fields = ['id', 'timestamp', 'sender', 'room']


class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for ChatRoom model using Django REST Framework"""
    members = UserDetailSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'room_identifier', 'is_direct_message', 
            'created_at', 'members', 'assignment',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['id', 'created_at', 'room_identifier']
    
    def get_last_message(self, obj):
        """Get the most recent message in the room"""
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender_name': last_message.sender.username,
                'timestamp': last_message.timestamp
            }
        return None
    
    def get_unread_count(self, obj):
        """Get the count of unread messages for the current user"""
        # This would need to be implemented with a message read status tracking system
        # For now returning 0 as placeholder
        return 0