from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoteViewSet,
    ChegadaViewSet,
    MorteViewSet,
    RacaoViewSet,
    SaidaViewSet,
    ObservacaoViewSet,
)

router = DefaultRouter()
router.register("lotes", LoteViewSet)
router.register("chegadas", ChegadaViewSet)
router.register("mortes", MorteViewSet)
router.register("racoes", RacaoViewSet)
router.register("saidas", SaidaViewSet)
router.register("observacoes", ObservacaoViewSet)

urlpatterns = [
    path("", include(router.urls)),
]