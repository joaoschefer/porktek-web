from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Lote, Chegada, Morte, Racao, Saida, Observacao
from .serializers import (
    LoteSerializer,
    ChegadaSerializer,
    MorteSerializer,
    RacaoSerializer,
    SaidaSerializer,
    ObservacaoSerializer,
)


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all().order_by("-created_at")
    serializer_class = LoteSerializer

    @action(detail=False, methods=["get"])
    def atual(self, request):
        lote = Lote.objects.filter(ativo=True).order_by("-created_at").first()
        if not lote:
            return Response(None)
        return Response(LoteSerializer(lote).data)

    @action(detail=True, methods=["post"])
    def finalizar(self, request, pk=None):
        lote = self.get_object()
        lote.ativo = False
        lote.save()
        return Response({"ok": True})


class ChegadaViewSet(viewsets.ModelViewSet):
    queryset = Chegada.objects.all().order_by("-id")
    serializer_class = ChegadaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lote_id = self.request.query_params.get("lote")
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs


class MorteViewSet(viewsets.ModelViewSet):
    queryset = Morte.objects.all().order_by("-id")
    serializer_class = MorteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lote_id = self.request.query_params.get("lote")
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs


class RacaoViewSet(viewsets.ModelViewSet):
    queryset = Racao.objects.all().order_by("-id")
    serializer_class = RacaoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lote_id = self.request.query_params.get("lote")
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs


class SaidaViewSet(viewsets.ModelViewSet):
    queryset = Saida.objects.all().order_by("-id")
    serializer_class = SaidaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lote_id = self.request.query_params.get("lote")
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs


class ObservacaoViewSet(viewsets.ModelViewSet):
    queryset = Observacao.objects.all().order_by("-id")
    serializer_class = ObservacaoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lote_id = self.request.query_params.get("lote")
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs