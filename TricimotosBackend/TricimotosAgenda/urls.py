from django.urls import path
from . import views

urlpatterns = [
    path('api/solicitud/', views.crear_solicitud),
    path('api/estado-solicitud/', views.estado_solicitud),
    path('api/solicitudes/pendientes/', views.listar_solicitudes_pendientes),
    path('api/solicitud/aceptar/<int:solicitud_id>/', views.aceptar_solicitud),
    path('api/ubicacion/', views.actualizar_ubicacion),
    path('api/solicitudes-con-ubicacion/', views.solicitudes_con_ubicacion),
    path('api/carreras/aceptadas/', views.listar_carreras_aceptadas, name='listar_carreras_aceptadas'),
    path('api/ubicacion-conductor/', views.ubicacion_conductor, name='ubicacion_conductor'),
    path('api/ubicacion-tricimotero/', views.actualizar_ubicacion_tricimotero, name='actualizar_ubicacion_tricimotero'),
    path('api/ubicacion-tricimotero-info/', views.ubicacion_tricimotero, name='ubicacion_tricimotero'),
    path('api/ubicacion-cliente/', views.ubicacion_cliente, name='ubicacion_cliente'),
]
