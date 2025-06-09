// app/driver/DriverHomeScreen.tsx

import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'

const DriverHomeScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false)
  const router = useRouter()

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Panel de Conductor</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Estado: {isAvailable ? 'Disponible' : 'No disponible'}</Text>
        <TouchableOpacity
          style={[styles.button, isAvailable ? styles.offlineButton : styles.onlineButton]}
          onPress={toggleAvailability}
        >
          <Text style={styles.buttonText}>{isAvailable ? 'Desactivar' : 'Activar'} Recepción</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/driver/DriverRidesScreen')}
      >
        <Text style={styles.buttonText}>Ver clientes disponibles</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push('/driver/DriverRideDetailScreen', {
            name: 'Juan Pérez',
            time: '14:30',
            latitude: '-0.180653',
            longitude: '-78.467838',
          })
        }
      >
        <Text style={styles.buttonText}>Ver detalle carrera actual</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace('/auth/sign-in')}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0ffe0', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 40 },
  statusContainer: { marginBottom: 30, alignItems: 'center' },
  statusText: { fontSize: 20, marginBottom: 10 },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  onlineButton: {
    backgroundColor: '#4caf50',
  },
  offlineButton: {
    backgroundColor: '#f44336',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  logoutButton: {
    marginTop: 40,
    paddingVertical: 12,
    backgroundColor: '#777',
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontSize: 16, textAlign: 'center' },
})

export default DriverHomeScreen
