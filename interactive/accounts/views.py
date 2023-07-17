from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.views import View
from django.template import loader
# Create your views here.

class SignUp(View):
    def get(self, request):
        template = loader.get_template('accounts/signup.html')
        return HttpResponse(template.render())
    def post(self, request):
        pass

# def signup(request):
#     return HttpResponse('Welcome to sign up page!')