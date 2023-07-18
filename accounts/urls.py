from django.urls import path
from . import views

urlpatterns = [
    path('', views.Home.as_view(), name='home'),
    path('accounts/signup/', views.SignUp.as_view(), name='signup'),
    path('accounts/login/', views.LogIn.as_view(), name='login'),
    path('accounts/logout/', views.log_out, name='logout'),
    
]