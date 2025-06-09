from django.urls import path
from . import views

urlpatterns = [
    path('api/solicitud/', views.crear_solicitud),
    path('api/solicitud/status/', views.estado_solicitud),
    path('api/solicitudes/pendientes/', views.listar_solicitudes_pendientes),
    path('api/solicitud/aceptar/<int:solicitud_id>/', views.aceptar_solicitud),
    path('api/ubicacion/', views.actualizar_ubicacion),
    path('api/solicitudes-con-ubicacion/', views.solicitudes_con_ubicacion),


]
