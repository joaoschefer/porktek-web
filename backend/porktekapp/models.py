from django.db import models

class Lote (models.Model):
    numero = models.CharField(max_length=50)
    
