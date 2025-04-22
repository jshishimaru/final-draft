from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = 'django-insecure-d5a0w4xyj+d1$$knk+xc!)h)p1&w!rk)#0ebib&9b_pmp9m*m^'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
	'finaldraft',
	'corsheaders',
    'channels',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'corsheaders.middleware.CorsMiddleware',
]

# REST_FRAMEWORK = {
# 	'DEFAULT_AUTHENTICATION_CLASSES': [
# 		'rest_framework.authentication.SessionAuthentication',
# 			'rest_framework.authentication.TokenAuthentication',],
#     'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated',],
# 	}
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
	'Cross-Origin-Opener-Policy',
	'referrer-policy',
	'allow',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5174',
	'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5173',
]

CORS_ORIGIN_WHITELIST = [
	'http://localhost:5174',
]

ROOT_URLCONF = 'finaldraft_backend.urls'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'finaldraft', 'templates'),
		],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'finaldraft_backend.wsgi.application'
ASGI_APPLICATION = 'finaldraft_backend.asgi.application'

# Channels Configuration
try:
    import redis
    redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0)
    redis_client.ping()  # Test if Redis is running
    
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [('127.0.0.1', 6379)],
            },
        },
    }
    print("Redis connection successful, using Redis channel layer")
    
except (redis.ConnectionError, ImportError):
    # Fallback to in-memory channel layer
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }
    print("Redis connection failed, using in-memory channel layer")

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'finaldraft',
		'USER' : 'shishimaru',
		'PASSWORD' : 'bhadu123',
		'HOST' : 'localhost', 
		'PORT' : 5432,
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True



STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


CLIENT_ID = 'EpWbLyyGRi7GO68kHpvagrx76cZCTjVWBAbCUSbr' 
CLIENT_SECRET = 'i5okg9aAOBwWuLp2WvnQJ8DQf5Jnu6OpLTPYYOTMKSxOibMKk5mfbvXUiU81kgNDKf1qItACoyl2nWxxyvc3cONhjLo6CkuCHeBj321BaioLwv7DbWxFk84rJUDwqOxz'

import os

MEDIA_URL = '/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'finaldraft/media')

# Basic Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # The backend to use for sending emails
EMAIL_HOST = 'smtp.gmail.com'  
EMAIL_PORT = 587  
EMAIL_HOST_USER = 'jbsss785@gmail.com'  # Email account username
EMAIL_HOST_PASSWORD = 'wggh smgo ecna fina'  # Email account password/app password
EMAIL_USE_TLS = True  # Enable TLS encryption