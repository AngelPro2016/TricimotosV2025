// 📄 app/EsperandoResScreen.tsx

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'

const EsperandoRespuestaScreen = () => {
  const [isAvailable, setIsAvailable] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)

      if (seconds >= 10) {
        clearInterval(timer)
        setIsAvailable(false) // Simula que no hay conductores disponibles
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [seconds])

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {isAvailable ? (
          <>
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            <Text style={styles.title}>Buscando tricimoto disponible...</Text>
            <Text style={styles.subtitle}>Tiempo transcurrido: {seconds} s</Text>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>No hay conductores disponibles.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                Alert.alert('Intentar de nuevo')
                router.replace('/EsperandoResScreen') // Reinicia búsqueda
              }}
            >
              <Text style={styles.buttonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('../(tabs)/home')}>
        <Text style={styles.skipButtonText}>Omitir</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  loader: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 20,
  },
  skipButtonText: {
    color: '#8d8d8d',
    fontSize: 16,
  },
})

export default EsperandoRespuestaScreen
