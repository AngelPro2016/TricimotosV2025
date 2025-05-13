import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';
import { useRouter } from 'expo-router'; // Importando useRouter de expo-router

const RidesScreen = () => {
  const router = useRouter(); // Usamos useRouter de expo-router
  const [origin, setOrigin] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Get current location using Expo Location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need location permissions to continue.");
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setOrigin(`${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
  };

  // Show DateTime Picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Handle date change
  const handleConfirm = (date: Date) => {
    setTime(date);
    setDatePickerVisibility(false);
  };

  // Handle ride request
  const handleRequestRide = () => {
    if (!origin || !numPeople || !time) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return;
    }

    // Check if selected time is at least 10 minutes later
    const currentTime = new Date();
    const selectedTime = new Date(time);
    if (selectedTime <= currentTime || selectedTime.getHours() > 21) {
      Alert.alert('Error', 'Please select a time that is at least 10 minutes later and before 9 PM.');
      return;
    }

    setLoading(true);
    // Handle backend request here
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Your ride has been successfully scheduled!');
      router.push('/home'); // Navegamos a la pantalla "Home" usando expo-router
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

      {/* DateTime Picker for selecting time */}
      <TouchableOpacity style={styles.input} onPress={showDatePicker}>
        <Text style={styles.placeholderText}>{time ? time.toLocaleString() : 'Hora de Solicitud'}</Text>
      </TouchableOpacity>

      {/* DateTime Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        date={time || new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={new Date(new Date().getTime() + 10 * 60000)} // Min 10 minutes from now
        maximumDate={new Date(new Date().setHours(21, 0, 0, 0))} // Max till 9 PM today
      />

      {/* Display Map with the current location */}
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
        </MapView>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestRide}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Solicitando...' : 'Solicitar Carrera'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF5733',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  map: {
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
});

export default RidesScreen;
