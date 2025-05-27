import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import * as Location from 'expo-location'
import MapView, { Marker } from 'react-native-maps'
import { DateTimePickerModal } from 'react-native-modal-datetime-picker'
import { useRouter } from 'expo-router'

const RidesScreen = () => {
  const router = useRouter()
  const [numPeople, setNumPeople] = useState('')
  const [time, setTime] = useState<Date | null>(new Date())
  const [location, setLocation] = useState<any>(null)
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación.')
      return
    }
    const currentLocation = await Location.getCurrentPositionAsync({})
    setLocation(currentLocation.coords)

    const [placemark] = await Location.reverseGeocodeAsync(currentLocation.coords)
    if (placemark) {
      const { street, city, region } = placemark
      setAddress(`${street}, ${city}, ${region}`)
    }
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const handleConfirm = (date: Date) => {
    setTime(date)
    setDatePickerVisibility(false)
  }

  const handleRequestRide = () => {
    if (!location || !numPeople || !time) {
      Alert.alert('Faltan datos', 'Completa todos los campos para continuar.')
      return
    }

    const now = new Date()
    const minValidTime = new Date(now.getTime() + 10 * 60000)

    if (time < minValidTime) {
      Alert.alert('Hora inválida', 'La hora debe ser al menos 10 minutos en el futuro.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      router.push('/EsperandoResScreen')
    }, 2000)
  }

  useEffect(() => {
    getLocation()
  }, [])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Solicitar Carrera</Text>

          {address && (
            <>
              <Text style={styles.addressText}>📍 Dirección: {address}</Text>
              <Text style={styles.coordsText}>
                Coordenadas: {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
              </Text>
            </>
          )}

          <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
            <Text style={styles.locationButtonText}>📍 Obtener Ubicación Actual</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Número de personas"
            keyboardType="numeric"
            value={numPeople}
            onChangeText={setNumPeople}
          />

          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text style={styles.placeholderText}>
              {time ? `${time.toLocaleDateString()} ${time.toLocaleTimeString()}` : 'Seleccionar hora de salida'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            date={time || new Date()}
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
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

          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#aaa' }]}
            onPress={handleRequestRide}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Solicitando...' : 'Solicitar Carrera'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 30,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    color: '#555',
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  coordsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF5722',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: '#219653',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  map: {
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
  },
})

export default RidesScreen
