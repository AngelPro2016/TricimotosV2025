from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Solicitud, Aceptacion, Ubicacion,Ride,UbicacionTricimotero
from .serializers import SolicitudSerializer, SolicitudConUbicacionSerializer
from .authentication import ClerkAuthentication
from django.utils import timezone

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
def crear_solicitud(request):
    # Extraemos el ID de Clerk desde el JWT decodificado en la autenticación
    clerk_user_id = request.user  # `request.user` debería ser el `clerk_user_id` si estás usando ClerkAuthentication
    
    # Agregamos el ID de Clerk a los datos recibidos desde el frontend
    data = request.data.copy()
    data['cliente_clerk_id'] = clerk_user_id  # Asignamos el `clerk_user_id` al campo adecuado

    # Ahora pasamos esos datos al serializer
    serializer = SolicitudSerializer(data=data)
    
    if serializer.is_valid():
        # Guardamos la solicitud
        solicitud = serializer.save()
        return Response({
            "message": "Solicitud creada", 
            "id": solicitud.id, 
            "clerk-id": solicitud.cliente_clerk_id
        }, status=status.HTTP_201_CREATED)
    
    # Si hay errores, los devolvemos
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
    # Obtén el ID del tricimotero autenticado
    tricimotero_clerk_id = request.user  # El ID del tricimotero autenticado
    
    try:
        solicitud = Solicitud.objects.get(id=solicitud_id, estado='pendiente')
    except Solicitud.DoesNotExist:
        return Response({"error": "Solicitud no encontrada o ya está aceptada."}, status=status.HTTP_404_NOT_FOUND)
 # Actualizar el estado de la solicitud a 'aceptada' y asignar el tricimotero
    solicitud.estado = 'aceptada'
    solicitud.tricimotero_clerk_id = tricimotero_clerk_id
    solicitud.save()

    # Crear la aceptación
    aceptacion = Aceptacion.objects.create(
        solicitud=solicitud,
        tricimotero_clerk_id=tricimotero_clerk_id,
        aceptada_en=timezone.now()
    )

    # Verificar si ya existe una ubicación para el cliente (solicitud.cliente_clerk_id)
    ubicacion_cliente, created = Ubicacion.objects.get_or_create(
        clerk_user_id=solicitud.cliente_clerk_id
    )

    # Crear el viaje (Ride) sin los atributos de destino_latitud y destino_longitud
    ride = Ride.objects.create(
        origin_address=solicitud.origen,
        destination_address=solicitud.destino,  # Mantener el destino como texto
        origin_latitude=ubicacion_cliente.latitud,
        origin_longitude=ubicacion_cliente.longitud,
        ride_time=30,  # Puedes calcular la duración en minutos o asignar un valor predeterminado
        fare_price=100.00,  # Aquí podrías calcular el precio basado en la distancia y tiempo
        payment_status='pendiente',  # El estado del pago inicial
        driver=None,  # Este campo se asignará más tarde cuando se asigne un conductor
        clerk_user_id=tricimotero_clerk_id,  # El ID del tricimotero
        created_at=timezone.now()
    )

    # Retornar la respuesta
    return Response({
        "message": "Solicitud aceptada exitosamente y viaje agendado.",
        "solicitud_id": solicitud.id,
        "tricimotero_clerk_id": solicitud.tricimotero_clerk_id,
        "cliente_clerk_id": solicitud.cliente_clerk_id,
        "ride_id": ride.id
    }, status=status.HTTP_200_OK)
    
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

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def listar_carreras_aceptadas(request):
    # Obtén el clerk_user_id del tricimotero autenticado
    tricimotero_clerk_id = request.user
    
    # Buscar todas las solicitudes que están aceptadas y asignadas al tricimotero
    solicitudes_aceptadas = Solicitud.objects.filter(
        tricimotero_clerk_id=tricimotero_clerk_id, estado='aceptada'
    )
    
    # Serializamos las solicitudes aceptadas
    solicitudes_serializer = SolicitudSerializer(solicitudes_aceptadas, many=True)
    
    # Retornamos la respuesta con los datos de las solicitudes aceptadas
    return Response(solicitudes_serializer.data)

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def ubicacion_conductor(request):
    clerk_id = request.GET.get("id")
    if not clerk_id:
        return Response({"detail": "ID requerido"}, status=400)
    
    ubicacion = Ubicacion.objects.filter(clerk_user_id=clerk_id).first()
    if not ubicacion:
        return Response({"detail": "Ubicación no encontrada"}, status=404)

    return Response({
        "latitud": ubicacion.latitud,
        "longitud": ubicacion.longitud,
        "actualizado": ubicacion.actualizado,
    })

@api_view(['POST'])
@authentication_classes([ClerkAuthentication])
def actualizar_ubicacion_tricimotero(request):
    clerk_user_id = request.user
    data = request.data
    lat = data.get("latitud")
    lng = data.get("longitud")

    if lat is None or lng is None:
        return Response({"detail": "Coordenadas faltantes."}, status=400)

    ubicacion, created = UbicacionTricimotero.objects.update_or_create(
        clerk_user_id=clerk_user_id,
        defaults={"latitud": lat, "longitud": lng}
    )
    return Response({"message": "Ubicación del tricimotero actualizada"})

@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def ubicacion_tricimotero(request):
    clerk_id = request.GET.get("id")
    if not clerk_id:
        return Response({"detail": "ID requerido"}, status=400)

    from .models import UbicacionTricimotero
    ubicacion = UbicacionTricimotero.objects.filter(clerk_user_id=clerk_id).first()
    if not ubicacion:
        return Response({"detail": "Ubicación no encontrada"}, status=404)

    return Response({
        "latitud": ubicacion.latitud,
        "longitud": ubicacion.longitud,
        "actualizado": ubicacion.actualizado,
    })
@api_view(['GET'])
@authentication_classes([ClerkAuthentication])
def ubicacion_cliente(request):
    clerk_id = request.GET.get("id")
    if not clerk_id:
        return Response({"detail": "ID requerido"}, status=400)

    ubicacion = Ubicacion.objects.filter(clerk_user_id=clerk_id).first()
    if not ubicacion:
        return Response({"detail": "Ubicación no encontrada"}, status=404)

    return Response({
        "latitud": ubicacion.latitud,
        "longitud": ubicacion.longitud,
        "actualizado": ubicacion.actualizado,
    })

