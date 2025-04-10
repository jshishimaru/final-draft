from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path,include
from finaldraft_backend.auth import OAuthAuthorize, OAuthGetToken , OAuthLogout , LoginView , SignUpView , LogoutView , IsAuthenticated


urlpatterns = [
    path('admin/', admin.site.urls),
	path('auth/login/', LoginView.as_view() , name='login'),
	path('auth/logout/',LogoutView.as_view() , name='logout'),
	path('auth/signup/', SignUpView.as_view() , name='signup'),
	path('oauth/authorise/', OAuthAuthorize.as_view() , name='authorise'),
	path('oauth/channeli/callback/', OAuthGetToken.as_view() , name='get_token'),
	path('oauth/channeli/logout/' , OAuthLogout.as_view() , name='logout'),
    path('auth/isauthenticated/', IsAuthenticated.as_view() , name='isauthenticated'),
	path('finaldraft/', include('finaldraft.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)