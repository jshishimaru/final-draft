from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse
from finaldraft_backend.auth import OAuthAuthorize, OAuthGetToken , OAuthLogout , LoginView , SignUpView , LogoutView , IsAuthenticated
from finaldraft_backend.google_auth import GoogleOAuthAuthorize, GoogleOAuthCallback, GoogleOAuthLogout

urlpatterns = [
    path('admin/', admin.site.urls),
	path('auth/login/', LoginView.as_view() , name='login'),
	path('auth/logout/',LogoutView.as_view() , name='logout'),
	path('auth/signup/', SignUpView.as_view() , name='signup'),
	path('oauth/authorise/', OAuthAuthorize.as_view() , name='authorise'),
	path('oauth/channeli/callback/', OAuthGetToken.as_view() , name='get_token'),
	path('oauth/channeli/logout/' , OAuthLogout.as_view() , name='logout'),
    path('auth/isauthenticated/', IsAuthenticated.as_view() , name='isauthenticated'),
    # Google OAuth URLs
    path('oauth/google/authorize/', GoogleOAuthAuthorize.as_view(), name='google_authorize'),
    path('oauth/google/callback/', GoogleOAuthCallback.as_view(), name='google_callback'),
    path('oauth/google/logout/', GoogleOAuthLogout.as_view(), name='google_logout'),
    path('debug/auth/', lambda request: JsonResponse({
		'is_authenticated': request.user.is_authenticated,
		'session_keys': list(request.session.keys()),
		'user': str(request.user),
		'session_key': request.session.session_key,
	}), name='debug_auth'),

	path('finaldraft/', include('finaldraft.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)