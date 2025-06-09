import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.decorativeLine1} />
      <View style={styles.decorativeLine2} />

      <Animatable.Image
        animation="bounceIn"
        duration={1500}
        source={require("../(tabs)/logotrici.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={styles.titleContainer}>
        <Text style={styles.titleText}>TRICIMOTERO ACTIVO</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400} style={styles.textBox}>
        <Text style={styles.description}>
          Bienvenido a tu panel de conductor. Desde aquí puedes ver nuevas solicitudes, aceptar carreras, y ayudar a movilizar La Maná de forma segura y rápida.
        </Text>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={700} style={styles.textBox}>
        <Text style={styles.featureTitle}>¿Qué puedes hacer como tricimotero?</Text>

        <View style={styles.featureItem}>
          <Icon name="account-clock-outline" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Ver solicitudes en tiempo real.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="check-decagram" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Aceptar viajes fácilmente.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="map-marker-distance" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Ver ubicación exacta del cliente.</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="chat-alert" size={24} color="#2e7d32" />
          <Text style={styles.featureText}>Acceder a soporte en caso de incidentes.</Text>
        </View>
      </Animatable.View>

      <View style={styles.iconsContainer}>
        <Animatable.View animation="bounceIn" delay={1000} style={styles.iconBox}>
          <Icon name="account-group" size={36} color="#fff" />
          <Text style={styles.iconLabel}>Clientes</Text>
        </Animatable.View>
        <Animatable.View animation="bounceIn" delay={1200} style={styles.iconBox}>
          <Icon name="bike-fast" size={36} color="#fff" />
          <Text style={styles.iconLabel}>Velocidad</Text>
        </Animatable.View>
        <Animatable.View animation="bounceIn" delay={1400} style={styles.iconBox}>
          <Icon name="security" size={36} color="#fff" />
          <Text style={styles.iconLabel}>Seguridad</Text>
        </Animatable.View>
      </View>

      <Animatable.View animation="pulse" iterationCount="infinite" delay={2000}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/solicitudes")}>
          <Text style={styles.ctaText}>Ver solicitudes disponibles</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0fff4",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
    zIndex: 2,
  },
  titleContainer: {
    backgroundColor: "#ffffffee",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: "#2e7d32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2e7d32",
    textAlign: "center",
    textShadowColor: "#a5d6a7",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  textBox: {
    backgroundColor: "#ffffffcc",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#333",
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 25,
    width: "100%",
  },
  iconBox: {
    backgroundColor: "#81c784",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: width * 0.25,
    marginHorizontal: 5,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "bold",
  },
  ctaButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginBottom: 30,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  decorativeLine1: {
    position: "absolute",
    top: 100,
    left: -100,
    width: width * 1.5,
    height: 100,
    backgroundColor: "#c8e6c9",
    transform: [{ rotate: "-10deg" }],
    zIndex: 0,
  },
  decorativeLine2: {
    position: "absolute",
    bottom: 150,
    right: -100,
    width: width * 1.5,
    height: 100,
    backgroundColor: "#f0f4c3",
    transform: [{ rotate: "15deg" }],
    zIndex: 0,
  },
});

export default Home;
