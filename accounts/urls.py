from django.urls import path
from . import views

urlpatterns = [
    path('', views.Home.as_view(), name='home'),
    path('accounts/signup/', views.SignUp.as_view(), name='signup'),
    path('accounts/signup/verify-email', views.VerifyEmail.as_view(), name='verify-email'),
    path('accounts/login/', views.LogIn.as_view(), name='login'),
    path('accounts/logout/', views.log_out, name='logout'),
    path('todo', views.todayRedirect, name='today-todo'),
    path('todo/<str:date>', views.ToDoView.as_view(), name='todo'),
    path('todo/<str:date>/remove-tasks', views.remove_tasks, name='remove-tasks'),
    path('notes', views.NotesView.as_view(), name='notes'),
    path('notes/delete/<int:pk>', views.delete_note, name='delete-note'),
    
    path('accounts/re-send-verification', views.re_send_code, name='resed-verification'),
    path('todo-tasks-json/<str:date>', views.ToDoTasks.as_view(), name='todo-tasks-json'),
    path('notes-json', views.NotesJson.as_view(), name='notes-json'),
    path('favorite-json/<int:pk>', views.favoriteJson.as_view(), name='favorite-json'),
]