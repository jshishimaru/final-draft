import os
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.shortcuts import redirect
from django.contrib.auth import login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.urls import reverse
import json

class GoogleOAuthConfig:
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
    GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI
    
    # Google OAuth URLs
    GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
    GOOGLE_REVOKE_TOKEN_URL = 'https://oauth2.googleapis.com/revoke'
    
class GoogleOAuthAuthorize(View):
    """
    Redirects the user to Google's OAuth authorization page.
    """
    def get(self, request):
        # Create authorization URL with required parameters
        auth_url = f"{GoogleOAuthConfig.GOOGLE_AUTH_URL}?response_type=code&client_id={GoogleOAuthConfig.GOOGLE_CLIENT_ID}&redirect_uri={GoogleOAuthConfig.GOOGLE_REDIRECT_URI}&scope=email profile&access_type=offline&prompt=consent"
        return redirect(auth_url)

@method_decorator(csrf_exempt, name='dispatch')
class GoogleOAuthCallback(View):
    """
    Handles the OAuth callback from Google, obtains tokens, and logs user in.
    """
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return JsonResponse({'error': 'Authorization code not provided'}, status=400)
            
        # Exchange authorization code for access token
        token_data = {
            'code': code,
            'client_id': GoogleOAuthConfig.GOOGLE_CLIENT_ID,
            'client_secret': GoogleOAuthConfig.GOOGLE_CLIENT_SECRET,
            'redirect_uri': GoogleOAuthConfig.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        
        token_response = requests.post(GoogleOAuthConfig.GOOGLE_TOKEN_URL, data=token_data)
        if token_response.status_code != 200:
            return JsonResponse({'error': 'Failed to obtain access token'}, status=token_response.status_code)
            
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        # Get user information using the access token
        user_info_response = requests.get(
            GoogleOAuthConfig.GOOGLE_USER_INFO_URL,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if user_info_response.status_code != 200:
            return JsonResponse({'error': 'Failed to get user information'}, status=user_info_response.status_code)
            
        user_info = user_info_response.json()
        
        # Extract user data
        email = user_info.get('email')
        name = user_info.get('name', '')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        google_id = user_info.get('sub')
        
        if not email:
            return JsonResponse({'error': 'Email not provided by Google'}, status=400)
            
        # Get or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create a new user
            username = email.split('@')[0]
            
            # Ensure username is unique
            base_username = username
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{count}"
                count += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            
            # Save additional user info if needed
            # This is where you could extend the user model or create a profile
            
        # Log the user in
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        frontend_url = settings.FRONTEND_URL
        # Set session variables more explicitly
        request.session['is_authenticated'] = True
        request.session['user_id'] = user.id
        # Force session to persist
        request.session.modified = True
        request.session.save()
        
        # Create a response that both redirects and keeps the session cookie
        response = redirect(f"{settings.FRONTEND_URL}/homepage")
        
        # Set session cookie explicitly (as a backup)
        session_cookie = request.session.session_key
        max_age = 7 * 24 * 60 * 60  # 7 days
        response.set_cookie(
            'sessionid', 
            session_cookie, 
            max_age=max_age,
            httponly=True,
            samesite='Lax',
            secure=False,  # Change to True in production with HTTPS
            domain=None,   # Use the default domain
            path='/'    
        )
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Origin"] = settings.FRONTEND_URL
        
        
        return response
        
        # Redirect to frontend with success message or store tokens
        # For production, you should use a more secure method to transfer tokens
        # frontend_url = settings.FRONTEND_URL
        # return redirect(f"{frontend_url}/homepage")
        # frontend_url = settings.FRONTEND_URL
        # return redirect(f"{frontend_url}?login_success=true&user_id={user.id}")

@method_decorator(csrf_exempt, name='dispatch')
class GoogleOAuthLogout(View):
    """
    Logs the user out and revokes the Google token if provided.
    """
    def post(self, request):
        # If you have stored the token in the session or received it in the request
        token = request.POST.get('token')
        
        if token:
            # Revoke the token on Google's side
            requests.post(
                GoogleOAuthConfig.GOOGLE_REVOKE_TOKEN_URL,
                params={'token': token},
                headers={'content-type': 'application/x-www-form-urlencoded'}
            )
        
        # Log out from Django
        logout(request)
        
        return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})