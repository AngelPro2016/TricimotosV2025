from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Solicitud, Aceptacion, Ubicacion
from .serializers import SolicitudSerializer, SolicitudConUbicacionSerializer
from .authentication import ClerkAuthentication

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
def crear_solicitud(request):
    clerk_user_id = request.user
    data = request.data.copy()
    data['cliente_clerk_id'] = clerk_user_id

    serializer = SolicitudSerializer(data=data)
    if serializer.is_valid():
        solicitud = serializer.save()
        return Response({"message": "Solicitud creada", "id": solicitud.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def estado_solicitud(request):
    clerk_user_id = request.user
    try:
        solicitud = Solicitud.objects.filter(cliente_clerk_id=clerk_user_id).latest('hora_programada')
        return Response({
            "estado": solicitud.estado,
            "asignado": solicitud.tricimotero_clerk_id,
        })
    except Solicitud.DoesNotExist:
        return Response({"detail": "No hay solicitudes activas"}, status=status.HTTP_404)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def listar_solicitudes_pendientes(request):
    solicitudes = Solicitud.objects.filter(estado='pendiente')
    serializer = SolicitudSerializer(solicitudes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
def aceptar_solicitud(request, solicitud_id):
    tricimotero_id = request.user
    try:
        solicitud = Solicitud.objects.get(id=solicitud_id, estado='pendiente')
        solicitud.estado = 'aceptada'
        solicitud.tricimotero_clerk_id = tricimotero_id
        solicitud.save()

        Aceptacion.objects.create(solicitud=solicitud, tricimotero_clerk_id=tricimotero_id)
        return Response({"message": "Solicitud aceptada"})
    except Solicitud.DoesNotExist:
        return Response({"detail": "Solicitud no válida o ya asignada"}, status=status.HTTP_404)
    
@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
def actualizar_ubicacion(request):
    clerk_user_id = request.user
    data = request.data
    lat = data.get("latitud")
    lng = data.get("longitud")

    if lat is None or lng is None:
        return Response({"detail": "Coordenadas faltantes."}, status=400)

    ubicacion, created = Ubicacion.objects.update_or_create(
        clerk_user_id=clerk_user_id,
        defaults={"latitud": lat, "longitud": lng}
    )
    return Response({"message": "Ubicación actualizada"})

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def solicitudes_con_ubicacion(request):
    solicitudes = Solicitud.objects.filter(estado="pendiente")
    datos_con_ubicacion = []

    for solicitud in solicitudes:
        ubicacion = Ubicacion.objects.filter(clerk_user_id=solicitud.cliente_clerk_id).first()
        if ubicacion:
            datos_con_ubicacion.append({
                "id": solicitud.id,
                "cliente_clerk_id": solicitud.cliente_clerk_id,
                "origen": solicitud.origen,
                "destino": solicitud.destino,
                "hora_programada": solicitud.hora_programada,
                "estado": solicitud.estado,
                "tricimotero_clerk_id": solicitud.tricimotero_clerk_id,
                "latitud": ubicacion.latitud,
                "longitud": ubicacion.longitud,
            })

    return Response(SolicitudConUbicacionSerializer(datos_con_ubicacion, many=True).data)
