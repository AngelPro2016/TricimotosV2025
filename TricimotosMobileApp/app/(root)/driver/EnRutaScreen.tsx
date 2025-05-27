import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const EnRutaScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    };

    getLocation();
  }, []);

  const handleFinishRide = () => {
    Alert.alert('Viaje finalizado', 'Has completado la entrega.');
    router.push('/(tabs)/home'); // o cualquier destino posterior
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛵 En Ruta</Text>

      {location ? (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="Tú" />
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleFinishRide}>
        <Text style={styles.buttonText}>Finalizar viaje</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#FF5733', textAlign: 'center', marginBottom: 20 },
  map: { height: 300, borderRadius: 10, marginBottom: 20 },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingText: { textAlign: 'center', color: '#666', marginTop: 20 },
});

export default EnRutaScreen;
