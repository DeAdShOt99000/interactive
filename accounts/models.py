from django.db import models

# Create your models here.

class ToDo(models.Model):
    task = models.CharField(max_length=255)
    task_date = models.DateField()
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class SignUpQueue(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    v_code = models.CharField(max_length=4, null=True, default=None)