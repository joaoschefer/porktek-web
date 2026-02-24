from rest_framework import serializers
from .models import Lote, Chegada, Morte, Racao, Saida, Observacao

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = "__all__"

class ChegadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chegada
        fields = "__all__"

class MorteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Morte
        fields = "__all__"

class RacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Racao
        fields = "__all__"

class SaidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saida
        fields = "__all__"

class ObservacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observacao
        fields = "__all__"
