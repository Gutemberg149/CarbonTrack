import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from '../config';

export default function Signup({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isButtonDisabled = () => {
    if (nome.trim() === "") return true;
    if (!isValidEmail(email)) return true;
    if (senha.trim() === "") return true;
    if (senha !== confirmarSenha) return true;
    if (senha.length < 6) return true;
    return loading;
  };

  const handleSignup = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erro", "Digite um email válido");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Cadastrando no backend:", { nome, email, senha });
      
      const response = await axios.post(`${API_BASE_URL}/usuarios`, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim()
      });

      console.log("✅ Usuário criado:", response.data);

      if (response.data) {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: email.trim().toLowerCase(),
          senha: senha.trim()
        });

        console.log("✅ Login automático realizado");

        if (loginResponse.data.token) {
          // SALVAR APENAS COM CHAVES 
          await AsyncStorage.setItem("usuario_nome", nome.trim());
          await AsyncStorage.setItem("usuario_senha", senha.trim());
          await AsyncStorage.setItem("usuario_id", response.data.id || loginResponse.data.id);
          await AsyncStorage.setItem("usuario_email", email.trim().toLowerCase());
          await AsyncStorage.setItem("auth_token", loginResponse.data.token);
          
          // VERIFICAR SE SALVOU
          const testNome = await AsyncStorage.getItem("usuario_nome");
          const testSenha = await AsyncStorage.getItem("usuario_senha");
          const testToken = await AsyncStorage.getItem("auth_token");
          
          console.log("🔍 VERIFICAÇÃO PÓS-SALVAMENTO:");
          console.log("  - Nome salvo:", testNome);
          console.log("  - Senha salva:", testSenha ? "existe" : "não existe");
          console.log("  - Token salvo:", testToken ? "existe" : "não existe");
          
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
          throw new Error("Falha no login automático");
        }
      }
    } catch (error) {
      console.error("❌ Erro no cadastro:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1a472a", "#2D5A27", "#4CAF50"]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>CarbonTrack</Text>
          <Text style={styles.appSubtitle}>Crie sua cuenta</Text>
        </View>

        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#4CAF50" />
          <TextInput 
            placeholder="Nome completo" 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome} 
            placeholderTextColor="#999" 
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#4CAF50" />
          <TextInput 
            placeholder="E-mail" 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            placeholderTextColor="#999" 
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#4CAF50" />
          <TextInput
            placeholder="Senha (mínimo 6 caracteres)"
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

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#4CAF50" />
          <TextInput
            placeholder="Confirmar senha"
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!mostrarSenha}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isButtonDisabled() && styles.buttonDisabled]} 
          onPress={handleSignup} 
          disabled={isButtonDisabled()}
        >
          <LinearGradient
            colors={isButtonDisabled() ? ["#ccc", "#aaa"] : ["#4CAF50", "#2D5A27"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Feather name="user-plus" size={20} color="#FFF" />
                <Text style={styles.buttonText}>CRIAR CONTA</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

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