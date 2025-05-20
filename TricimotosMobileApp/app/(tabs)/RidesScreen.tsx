import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';
import { useRouter } from 'expo-router';

const RidesScreen = () => {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [time, setTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación.');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setOrigin(`${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const handleConfirm = (date: Date) => {
    setTime(date);
    setDatePickerVisibility(false);
  };

  const handleRequestRide = () => {
    if (!origin || !numPeople || !time) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const now = new Date();
    const selectedTime = new Date(time);
    const diffInMinutes = (selectedTime.getTime() - now.getTime()) / 60000;

    if (diffInMinutes < 10 || selectedTime.getHours() >= 21) {
      Alert.alert('Error', 'Elige una hora al menos 10 minutos después y antes de las 9 PM.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(client)/EsperandoResScreen'); // 👈 Ruta corregida
    }, 2000);
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar Carrera</Text>

      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <Text style={styles.locationButtonText}>Obtener Ubicación Actual</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Número de Personas"
        keyboardType="numeric"
        value={numPeople}
        onChangeText={setNumPeople}
      />

      <TouchableOpacity style={styles.input} onPress={showDatePicker}>
        <Text style={styles.placeholderText}>
          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Seleccionar hora'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        date={time || new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={new Date(new Date().getTime() + 10 * 60000)}
        maximumDate={new Date(new Date().setHours(21, 0, 0, 0))}
      />

      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
        </MapView>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRequestRide} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Solicitando...' : 'Solicitar Carrera'}</Text>
        {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  placeholderText: { color: '#666', fontSize: 16 },
  button: {
    backgroundColor: '#FF5733',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  locationButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  map: { height: 200, marginBottom: 20, borderRadius: 10 },
});

export default RidesScreen;
