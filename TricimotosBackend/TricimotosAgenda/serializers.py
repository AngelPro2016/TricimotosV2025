from rest_framework import serializers
from .models import Solicitud

from rest_framework import serializers
from .models import Solicitud

class SolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = [
            'id',
            'cliente_clerk_id',  # Recibimos el `clerk_user_id` como string
            'origen',
            'destino',
            'hora_programada',
            'estado',
            'tricimotero_clerk_id',
        ]
        read_only_fields = ['estado', 'tricimotero_clerk_id']

class SolicitudConUbicacionSerializer(serializers.ModelSerializer):
    latitud = serializers.FloatField()
    longitud = serializers.FloatField()

    class Meta:
        model = Solicitud
        fields = [
            'id',
            'cliente_clerk_id',
            'origen',
            'destino',
            'hora_programada',
            'estado',
            'tricimotero_clerk_id',
            'latitud',
            'longitud',
        ]