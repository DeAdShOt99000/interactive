from django.urls import path
from . import views

urlpatterns = [
    path('', views.Home.as_view(), name='home'),
    path('todo', views.todayRedirect, name='today-todo'),
    path('todo/<str:date>', views.ToDoView.as_view(), name='todo'),
    path('todo/<str:date>/remove-tasks', views.remove_tasks, name='remove-tasks'),
    path('accounts/signup/', views.SignUp.as_view(), name='signup'),
    path('accounts/signup/verify-email', views.VerifyEmail.as_view(), name='verify-email'),
    path('accounts/login/', views.LogIn.as_view(), name='login'),
    path('accounts/logout/', views.log_out, name='logout'),
    
    path('todo-tasks-json/<str:date>', views.ToDoTasks.as_view(), name='todo-tasks-json'),
    path('accounts/re-send-verification', views.re_send_code, name='resed-verification'),
]