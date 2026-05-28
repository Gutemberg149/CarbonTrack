// src/telas/Signup.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signup({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login } = useAuth();

  const isButtonDisabled = nome.trim() === "" || email.trim() === "" || senha.trim() === "";

  const handleSignup = async () => {
    try {
      // Salvar usuário via AuthContext
      const success = await login(nome.trim());

      if (success) {
        // Aqui você pode também salvar o email em outro lugar se necessário
        await AsyncStorage.setItem("@usuario_email", email.trim());

        Alert.alert("Sucesso!", "Conta criada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "TelaHome" }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Erro", "Não foi possível criar a conta.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar os dados de usuário.");
    }
  };

  return (
    <LinearGradient colors={["#1a472a", "#2D5A27", "#4CAF50"]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.card}>
        {/* Logo CarbonTrack */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>CarbonTrack</Text>
          <Text style={styles.appSubtitle}>Crie sua conta</Text>
        </View>

        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

        {/* Campo Nome */}
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#4CAF50" />
          <TextInput placeholder="Nome completo" style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#999" />
        </View>

        {/* Campo Email */}
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#4CAF50" />
          <TextInput placeholder="E-mail" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#999" />
        </View>

        {/* Campo Senha */}
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#4CAF50" />
          <TextInput
            placeholder="Senha"
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Feather name={mostrarSenha ? "eye-off" : "eye"} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity style={[styles.button, isButtonDisabled && styles.buttonDisabled]} onPress={handleSignup} disabled={isButtonDisabled}>
          <LinearGradient
            colors={isButtonDisabled ? ["#ccc", "#aaa"] : ["#4CAF50", "#2D5A27"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="user-plus" size={20} color="#FFF" />
            <Text style={styles.buttonText}>CRIAR CONTA</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Link para Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("TelaLogin")}>
            <Text style={styles.loginLink}>Faça login</Text>
          </TouchableOpacity>
        </View>

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
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  version: {
    marginTop: 20,
    fontSize: 10,
    color: "#CCC",
  },
});
