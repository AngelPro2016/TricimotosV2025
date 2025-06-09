import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('window')

const DriverScreen = () => {
  const { signOut } = useAuth()
  const router = useRouter()

  const [selectedClient, setSelectedClient] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const clients = [
    {
      id: '1',
      name: 'Juan Pérez',
      time: '14:30',
      location: { latitude: -0.180653, longitude: -78.467838 },
    },
    {
      id: '2',
      name: 'María Gómez',
      time: '15:00',
      location: { latitude: -0.182, longitude: -78.47 },
    },
  ]

  const handleSignOut = () => {
    signOut()
    router.replace('/(auth)/sign-in')
  }

  const openClientModal = (client) => {
    setSelectedClient(client)
    setModalVisible(true)
  }

  const handleAccept = () => {
    Alert.alert('Carrera aceptada', `Has aceptado la carrera con ${selectedClient.name}`)
    setModalVisible(false)
    setSelectedClient(null)
    // Aquí lógica adicional: notificar backend, actualizar estado, etc.
  }

  const handleReject = () => {
    setModalVisible(false)
    setSelectedClient(null)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -0.180653,
          longitude: -78.467838,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {clients.map((client) => (
          <Marker
            key={client.id}
            coordinate={client.location}
            onPress={() => openClientModal(client)}
            pinColor={selectedClient?.id === client.id ? '#2e7d32' : '#f44336'}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientTime}>Hora: {client.time}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Modal con detalle y botones */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cliente seleccionado</Text>
            <Text style={styles.modalText}>Nombre: {selectedClient?.name}</Text>
            <Text style={styles.modalText}>Hora: {selectedClient?.time}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleReject}>
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
                <Text style={styles.buttonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: { width, height },
  callout: {
    width: 150,
    padding: 8,
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
  },
  clientTime: {
    fontSize: 14,
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2e7d32',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default DriverScreen
