from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views import View
from django.template import loader
# Create your views here.

class SignUp(View):
    def get(self, request):
        # template = loader.get_template('accounts/signup.html')
        # return HttpResponse(template.render())
        return render(request, 'accounts/signup.html')
    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']

        newuser = User.objects.create_user(username=username, password=password, email=email, first_name=firstname, last_name=lastname)
        return HttpResponse(newuser)
    
class LogIn(View):
    def get(self, request):
        return render(request, 'accounts/login.html')
    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect(reverse('home'))
        return HttpResponse('Login Failed.')

class Home(View):
    def get(self, request):
        return render(request, 'home.html')
    
def log_out(request):
    logout(request)
    return redirect(reverse('login'))
        

# def signup(request):
#     return HttpResponse('Welcome to sign up page!')