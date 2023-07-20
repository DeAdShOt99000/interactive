from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views import View
from django.template import loader
from django.core import serializers
from django.core.mail import send_mail

import datetime
import json
import random

from .models import ToDo, SignUpQueue


def send_verification_code(queued_user):
    v_code = str(random.randint(0, 9999)).zfill(4)
    queued_user.v_code = v_code
    queued_user.save()
    print(v_code)
    send_mail(
            'Verification Code',
            f'''
            Hello {queued_user.first_name}!
            
            Here is your verification code: {v_code}
            ''',
            'zezo.09@hotmail.com',
            [queued_user.email],
            fail_silently=False,
        )

# Create your views here.

class SignUp(View):
    def get(self, request):
        # template = loader.get_template('accounts/signup.html')
        # return HttpResponse(template.render())
        return render(request, 'accounts/signup.html')
    def post(self, request):
        v_code_input = request.POST.get('v-code-input')
        email = request.POST.get('email')
        if v_code_input and email:
            try:
                queued_user = SignUpQueue.objects.get(email=email)
            except:
                return HttpResponse('Nope.')
            if queued_user.v_code == v_code_input:
                User.objects.create_user(username=queued_user.username, password=queued_user.password, email=email, first_name=queued_user.first_name, last_name=queued_user.last_name)
                queued_user.delete()
                return HttpResponse('Sign up Success!')
            return render(request, 'accounts/verify-email.html', {'email': email, 'code_failed': True})
            
        # firstname = request.POST['firstname']
        # lastname = request.POST['lastname']
        # username = request.POST['username']
        # email = request.POST['email']
        # password = request.POST['password']

        # newuser = User.objects.create_user(username=username, password=password, email=email, first_name=firstname, last_name=lastname)
        # return HttpResponse(newuser)
    
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
        
class ToDoView(View):
    def get(self, request, date):
        tasks = ToDo.objects.filter(task_date=date)
        
        current_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        prev_day = current_date - datetime.timedelta(days=1)
        next_day = current_date + datetime.timedelta(days=1)
        
        return render(request, 'todo.html', {'tasks': tasks, 'date': current_date, 'prev_day': prev_day, 'next_day': next_day})
    
    def post(self, request, date):
        task = request.POST['task']
        task_date = request.POST['date']
        ToDo.objects.create(task=task, task_date=task_date)
        return redirect(reverse('todo', args=[date]))
    
def todayRedirect(request):
    date = datetime.date.today()
    return redirect(reverse('todo', args=[date]))

class ToDoTasks(View):
    def get(self, request, date):
        serialized_tasks = serializers.serialize('json', ToDo.objects.filter(task_date=date))
        return JsonResponse(serialized_tasks, safe=False)
    
    def post(self, request, date):
        update_task_id = json.loads(request.body)['update_task_id']
        task = ToDo.objects.get(id=int(update_task_id))
        if task.is_done:
            task.is_done = False
        else:
            task.is_done = True
        task.save()
        serializer = serializers.serialize('json', ToDo.objects.filter(task_date=date))
        # print(serializer)
        # print(type(update_task_id))
        # print(update_task_id)
        return JsonResponse(serializer, safe=False)
    
def remove_tasks(request, date):
    if request.method == 'POST':
        if len(request.POST) > 1:
            skipTheFirst = 0
            for id in request.POST:
                if skipTheFirst != 0:
                    task = ToDo.objects.get(id=int(id))
                    task.delete()
                else:
                    skipTheFirst += 1
        return redirect(reverse('todo', args=[date]))
    
class VerifyEmail(View):
    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        queued_user = SignUpQueue.objects.create(username=username, password=password, email=email, first_name=firstname, last_name=lastname)
        send_verification_code(queued_user)

        return render(request, 'accounts/verify-email.html', {'email': email})
    
def re_send_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        print(email)
        try:
            queued_user = SignUpQueue.objects.get(email=email)
        except:
            return HttpResponse('Nope.')
        send_verification_code(queued_user)
    return JsonResponse({'message': 'success'}, safe=False)
        
        