import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext.js";

export default function Login({ navigation }) {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useAuth(); // Use o contexto

  const isButtonDisabled = nome.trim() === "" || senha.trim() === "";

  const handleLogin = async () => {
    const success = await login(nome.trim()); // Salva via contexto

    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "TelaHome" }],
      });
    } else {
      Alert.alert("Erro", "Não foi possível realizar o acesso");
    }
  };

  return (
    <LinearGradient colors={["#1a472a", "#2D5A27", "#4CAF50"]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>CarbonTrack</Text>
          <Text style={styles.appSubtitle}>Monitoramento de Carbono</Text>
        </View>

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <TextInput placeholder="Seu nome" style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#999" />

        <TextInput placeholder="Sua senha" style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholderTextColor="#999" />

        <TouchableOpacity style={[styles.button, isButtonDisabled && styles.buttonDisabled]} onPress={handleLogin} disabled={isButtonDisabled}>
          <LinearGradient
            colors={isButtonDisabled ? ["#ccc", "#aaa"] : ["#4CAF50", "#2D5A27"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="log-in" size={20} color="#FFF" />
            <Text style={styles.buttonText}>ENTRAR</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("TelaSignup")} style={styles.link}>
          <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D5A27",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  version: {
    marginTop: 20,
    fontSize: 10,
    color: "#CCC",
  },
});
