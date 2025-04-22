from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from django.contrib.sessions.models import Session
import datetime
from django.utils import timezone

User = get_user_model()

@database_sync_to_async
def get_user_from_session(session_key):
    """
    Get the user from a session key
    """
    try:
        session = Session.objects.get(session_key=session_key)
        session_data = session.get_decoded()
        user_id = session_data.get('_auth_user_id')
        
        if user_id:
            return User.objects.get(id=user_id)
        return AnonymousUser()
    except (Session.DoesNotExist, User.DoesNotExist):
        return AnonymousUser()

class WebSocketAuthMiddleware:
    """
    Custom middleware for WebSockets authentication
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Get the session key from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        session_key = query_params.get('session_key', [None])[0]
        
        if session_key:
            scope['user'] = await get_user_from_session(session_key)
        else:
            scope['user'] = AnonymousUser()
        
        return await self.app(scope, receive, send)