import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

const CarreraAsignadaScreen = () => {
  const router = useRouter();

  const [clientLocation, setClientLocation] = useState({
    latitude: -1.046, // Simulada - ajusta con tu dato real
    longitude: -79.460,
  });

  const [eta, setEta] = useState(5); // Tiempo estimado en minutos
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmArrival = () => {
    Alert.alert('Confirmado', 'Has llegado al punto de recogida.');
    setArrivalConfirmed(true);
  };

  const handleStartRide = () => {
    // Navegar a la siguiente pantalla (simulada)
    router.push('/(driver)/EnRutaScreen'); // asegúrate de tener esta pantalla creada
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🚖 Carrera Asignada</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📍 Dirección de recogida:</Text>
        <Text style={styles.value}>Calle Simulada #123, La Maná</Text>

        <Text style={styles.label}>👥 Número de pasajeros:</Text>
        <Text style={styles.value}>2 personas</Text>

        <Text style={styles.label}>🕒 Tiempo estimado:</Text>
        <Text style={styles.value}>{eta} min</Text>
      </View>

      <MapView
        style={styles.map}
        region={{
          latitude: clientLocation.latitude,
          longitude: clientLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={clientLocation} title="Ubicación del cliente" />
      </MapView>

      {!arrivalConfirmed ? (
        <TouchableOpacity style={styles.button} onPress={handleConfirmArrival}>
          <Text style={styles.buttonText}>He llegado al punto de recogida</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={handleStartRide}>
          <Text style={styles.buttonText}>Iniciar viaje</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF5733',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  map: {
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CarreraAsignadaScreen;
