from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views import View
from django.template import loader
from django.core import serializers
from django.core.mail import send_mail

from .models import ToDo, SignUpQueue, Notes

import datetime
import json
import random

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

class Home(View):
    def get(self, request):
        return render(request, 'home.html')

class SignUp(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/signup.html')
        else:
            return redirect(reverse('home'))

    def post(self, request):
        data = json.loads(request.body)
        v_code_input = data.get('v-code-input')
        email = data.get('email')
        if v_code_input and email:
            try:
                queued_user = SignUpQueue.objects.get(email=email)
            except:
                return HttpResponse('Nope.')
            if queued_user.v_code == v_code_input:
                newuser = User.objects.create_user(username=queued_user.username, password=queued_user.password, email=email, first_name=queued_user.first_name, last_name=queued_user.last_name)
                queued_user.delete()
                login(request, newuser)
                return JsonResponse({'code_failed': False}, safe=False)
            return JsonResponse({'code_failed': True}, safe=False)
    
class VerifyEmail(View):
    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        try:
            queued_user = SignUpQueue.objects.get(email=email)
        except:
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

class LogIn(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/login.html')
        else:
            return redirect(reverse('home'))
    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect(reverse('home'))
        return HttpResponse('Login Failed.')

def log_out(request):
    logout(request)
    return redirect(reverse('login'))
        
class ToDoView(View):
    def get(self, request, date):
        tasks = ToDo.objects.filter(task_date=date, owner_id=self.request.user.id)
        
        current_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        prev_day = current_date - datetime.timedelta(days=1)
        next_day = current_date + datetime.timedelta(days=1)
        
        return render(request, 'todo.html', {'tasks': tasks, 'date': current_date, 'prev_day': prev_day, 'next_day': next_day})
    
    def post(self, request, date):
        task = request.POST['task']
        task_date = request.POST['date']
        ToDo.objects.create(task=task, task_date=task_date, owner=self.request.user)
        return redirect(reverse('todo', args=[date]))
    
def todayRedirect(request):
    date = datetime.date.today()
    return redirect(reverse('todo', args=[date]))

class ToDoTasks(View):
    def get(self, request, date):
        serialized_tasks = serializers.serialize('json', ToDo.objects.filter(task_date=date, owner_id=self.request.user.id))
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
    
class NotesView(View):
    def get(self, request):
        return render(request, 'notes.html')
    def post(self, request):
        data = json.loads(request.body)
        subject = data.get('subject')
        if (not subject):
            subject = 'No Subject'
        note = data.get('note')
        # subject = request.POST.get('subject')
        # note = request.POST.get('note')
        new_note = Notes.objects.create(subject=subject, note=note, owner=request.user)
        serialized = serializers.serialize('json', [new_note,])
        # return redirect(reverse('notes'))
        return JsonResponse(serialized, safe=False)
    
class NotesJson(View):
    def get(self, request):
        try:
            notes = Notes.objects.filter(owner=request.user).order_by('-updated_at')
        except:
            return JsonResponse('{}', safe=False)
        serialized = serializers.serialize('json', notes)
        return JsonResponse(serialized, safe=False)
        
    def post(self, request):
        data = json.loads(request.body)
        pk = data.get('id')
        try:
            note = Notes.objects.get(pk=pk, owner=request.user)
        except:
            return HttpResponse('Nope. Note')
        note.note = data.get('note')
        if (data.get('subject')):
            note.subject = data.get('subject')
        else:
            note.subject = 'No Subject'
        note.save()
        return JsonResponse({'message': 'success', 'updated_at': note.updated_at}, safe=False)
    
class favoriteJson(View):
    def get(self, request, pk):
        try:
            note = Notes.objects.get(pk=pk, owner=request.user)
        except:
            return HttpResponse('Nope, Favorite')
        
        if (note.favorite):
            note.favorite = 0
        else:
            note.favorite = 1
        note.save(keep_updated_at=True)
        return JsonResponse({'message': 'success', 'favorite': note.favorite}, safe=False)
    
def delete_note(request, pk):
    try:
        note = Notes.objects.get(pk=pk, owner=request.user)
    except:
        return HttpResponse('Nope. Delete')
    note.delete()
    return JsonResponse({'message': 'success'}, safe=False)