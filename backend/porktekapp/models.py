from django.db import models

class Lote(models.Model):
    numero = models.CharField(max_length=50)
    data_inicio = models.DateField()
    total_animais = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lote {self.numero}"
    
class Chegada(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="chegadas")
    data = models.DateField()
    qtd = models.IntegerField()
    origem = models.CharField(max_length=120, blank=True)
    obs = models.CharField(max_length=255, blank=True)

class Morte(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="mortes")
    data = models.DateField()
    qtd = models.IntegerField()
    motivo = models.CharField(max_length=120, blank=True)
    obs = models.CharField(max_length=255, blank=True)

class Racao(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="racoes")
    data = models.DateField()
    kg = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=80, blank=True)
    obs = models.CharField(max_length=255, blank=True)

class Saida(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="saidas")
    data = models.DateField()
    qtd = models.IntegerField()
    destino = models.CharField(max_length=120, blank=True)
    obs = models.CharField(max_length=255, blank=True)

class Observacao(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="observacoes")
    data = models.DateField()
    tipo = models.CharField(max_length=80, blank=True)
    titulo = models.CharField(max_length=120, blank=True)
    obs = models.TextField(blank=True)
