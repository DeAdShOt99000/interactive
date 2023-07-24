from django.db import models
from django.contrib.auth.models import User

from datetime import datetime

# Create your models here.

class SignUpQueue(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    v_code = models.CharField(max_length=4, null=True, default=None)
    
class ToDo(models.Model):
    task = models.CharField(max_length=255)
    task_date = models.DateField()
    is_done = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class Notes(models.Model):
    subject = models.CharField(max_length=255, null=True, default=None)
    note = models.TextField(default='Empty Note')
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField()
    
    def save(self, keep_updated_at=False, *args, **kwargs):
        if not keep_updated_at:
            self.updated_at = datetime.now()
    
        super().save(*args, **kwargs)