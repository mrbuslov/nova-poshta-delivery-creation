from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views

# router = routers.DefaultRouter()
# router.register(r'users', views.UserDetail)



urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include('api.urls')),
    path('api-auth/', include('rest_framework.urls')), # add button Log in into API
]
