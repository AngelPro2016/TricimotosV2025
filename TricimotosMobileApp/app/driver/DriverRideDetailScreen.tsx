// app/driver/DriverRideDetailScreen.tsx

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import MapView, { Marker } from 'react-native-maps'

const DriverRideDetailScreen = () => {
  const router = useRouter()
  const params = useLocalSearchParams()

  const client = {
    name: params.name || 'Cliente Desconocido',
    time: params.time || 'N/A',
    location: {
      latitude: params.latitude ? Number(params.latitude) : -0.180653,
      longitude: params.longitude ? Number(params.longitude) : -78.467838,
    },
  }

  const handleStartRide = () => {
    Alert.alert('Viaje iniciado', '¡Buena suerte!')
    // Aquí agregar lógica para iniciar viaje y actualizar estado
  }

  const handleCancelRide = () => {
    Alert.alert(
      'Cancelar viaje',
      '¿Estás seguro que quieres cancelar esta carrera?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: () => router.push('/driver/DriverRidesScreen'),
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Detalle de Carrera</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{client.name}</Text>

        <Text style={styles.label}>Hora solicitada:</Text>
        <Text style={styles.value}>{client.time}</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: client.location.latitude,
          longitude: client.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={client.location} />
      </MapView>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelRide}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStartRide}>
          <Text style={styles.buttonText}>Iniciar Viaje</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0ffe0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', marginBottom: 20, textAlign: 'center' },
  infoBox: {
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  startButton: {
    backgroundColor: '#2e7d32',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
})

export default DriverRideDetailScreen
