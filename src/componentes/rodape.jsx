import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";

const Footer = ({ isDarkMode }) => (
  <LinearGradient colors={isDarkMode ? ["#1E272E", "#0D1117"] : ["#2D5A27", "#1B3A1A"]} style={styles.rodape} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={styles.conteudoRodape}>
      <FontAwesome5 name="leaf" size={28} color="#4CAF50" />
      <Text style={[styles.tituloRodape, isDarkMode && styles.textoRodapeEscuro]}>CarbonTrack</Text>
      <Text style={[styles.subtituloRodape, isDarkMode && styles.textoRodapeEscuro]}>Monitoramento Inteligente de Carbono</Text>

      <View style={styles.divisorRodape} />

      <Text style={[styles.versaoRodape, isDarkMode && styles.textoRodapeEscuro]}>Versão 1.0.0</Text>
      <Text style={[styles.copyrightRodape, isDarkMode && styles.textoRodapeEscuro]}>© 2024 CarbonTrack. Todos os direitos reservados.</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  rodape: {
    marginTop: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  conteudoRodape: {
    alignItems: "center",
  },
  tituloRodape: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
    marginBottom: 6,
  },
  subtituloRodape: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 20,
  },
  divisorRodape: {
    width: 50,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 15,
  },
  versaoRodape: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  copyrightRodape: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
  textoRodapeEscuro: {
    color: "#E0E0E0",
  },
});

export default Footer;
