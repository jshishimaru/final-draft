from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import requests
from django.contrib.auth.models import User,Group


redirect_url ='http://localhost:8000/oauth/channeli/callback/'
authorize_url ='https://channeli.in/oauth/authorise/'
token_url ='https://channeli.in/open_auth/token/'
get_user_data_url ='https://channeli.in/open_auth/get_user_data/'
logout_url = 'https://channeli.in/open_auth/revoke_token/'

class OAuthAuthorize(View):
	def get(self, request):
		client_id = settings.CLIENT_ID
		state = 'random_state'
		auth_url = f"{authorize_url}?client_id={client_id}&redirect_uri={redirect_url}&state={state}"		
		return redirect(auth_url)

class OAuthGetToken(View):
	def get(self, request):
		code = request.GET.get('code')
		state = request.GET.get('state')

		client_id = settings.CLIENT_ID
		client_secret = settings.CLIENT_SECRET

		data = {
			'client_id': client_id,
			'client_secret': client_secret,
			'code': code,
			'redirect_uri': redirect_url,
			'grant_type': 'authorization_code',
			'state':state
		}

		response = requests.post(token_url, data=data)
		if response.status_code != 200:
			return JsonResponse({'error': 'Failed to obtain access token'}, status=response.status_code)

		token_data = response.json()
		access_token = token_data.get('access_token')
		refresh_token = token_data.get('refresh_token')
		
		user_info = requests.get(get_user_data_url, headers = {'Authorization': f'Bearer {access_token}'})
		user_data = user_info.json()

		PersonalEmail = user_data["contactInformation"]["emailAddress"]
		InstituteEmail = user_data["contactInformation"]["instituteWebmailAddress"]
		
		mails = {
			'PersonalEmail': PersonalEmail,
			'InstituteEmail': InstituteEmail
		}

		user = User.objects.filter( Q(email=InstituteEmail) or Q(email=PersonalEmail))[0]
		if user is not None:
			login(request, user);
			user_data = {
				'username': user.username,
				'first_name': user.first_name,
				'last_name': user.last_name,
				'email': user.email,
				'group' : user.groups.all()[0].name
			}	
			print(user_data);
			return redirect('http://localhost:5173/homepage/assignments/')
		return redirect("http://localhost:5173/")


class OAuthLogout(View):
	def get(self, request):
		params = {
			'client_id': settings.CLIENT_ID,
			'client_secret': settings.CLIENT_SECRET,
			'token': request.GET.get('token'),
			'token_type_hint' : request.GET.get('token_type_hint'),
		}
		response = requests.post(logout_url , data = params)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
	def get(self, request):
		return JsonResponse({'message': 'Login Required'}, status=401)
	
	def post(self, request):
		username = request.POST.get('username')
		password = request.POST.get('password')
		user = authenticate(username=username, password=password)
		if user is not None:
			login(request, user)
			user_data = {
				'username': user.username,
				'first_name': user.first_name,
				'last_name': user.last_name,
				'email': user.email,
				'group' : user.groups.all()[0].name
			}
			return JsonResponse(user_data)
		else:
			return JsonResponse({'error': 'Credentials Do Not Match'}, status=401)

@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(View):
	def post(self, request):
		username = request.POST.get('username')
		password = request.POST.get('password')
		email = request.POST.get('email')
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')

		if not username or not password or not email or not first_name or not last_name:
			return JsonResponse({'error': 'All fields are required'} )

		if User.objects.filter(username=username).exists():
			return JsonResponse({'error': 'User already exists'})
		
		if User.objects.filter(email=email).exists():
			return JsonResponse({'error': 'An account with this email already exists'})

		group_name = 'Reviewee'
		group, created = Group.objects.get_or_create(name=group_name)
		user = User.objects.create_user(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
		user.groups.add(group)
		user.save()
		user_data = User.objects.filter(username=username).values()[0]
		return JsonResponse(user_data)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
	def post(self, request):
		logout(request)
		return JsonResponse({'message': 'Logged out successfully'})
	
@method_decorator(csrf_exempt, name='dispatch')
class IsAuthenticated(View):
	def get(self, request):
		if request.user.is_authenticated:
			return JsonResponse({'is_authenticated': 'True'})
		else:
			return JsonResponse({'is_authenticated': 'False'}, status=401)
