from rest_framework import serializers
from .models import Solicitud, Ubicacion

class SolicitudSerializer(serializers.ModelSerializer):
    latitud = serializers.SerializerMethodField()
    longitud = serializers.SerializerMethodField()

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
        read_only_fields = ['estado', 'tricimotero_clerk_id', 'cliente_clerk_id']

    def get_latitud(self, obj):
        ubicacion = Ubicacion.objects.filter(clerk_user_id=obj.cliente_clerk_id).first()
        return ubicacion.latitud if ubicacion else None

    def get_longitud(self, obj):
        ubicacion = Ubicacion.objects.filter(clerk_user_id=obj.cliente_clerk_id).first()
        return ubicacion.longitud if ubicacion else None
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