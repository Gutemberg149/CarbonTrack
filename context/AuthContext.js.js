import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from '../src/config.js';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("@auth_token");
      const storedUser = await AsyncStorage.getItem("@user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("📀 Dados carregados do storage:", JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.toLowerCase(),
        senha
      });

      if (response.data.token) {
        const userData = {
          id: response.data.id,
          nome: response.data.nome,
          email: response.data.email
        };

        setToken(response.data.token);
        setUser(userData);

        await AsyncStorage.setItem("@auth_token", response.data.token);
        await AsyncStorage.setItem("@user", JSON.stringify(userData));
        
        // ✅ Salvar também no formato antigo para compatibilidade
        await AsyncStorage.setItem("usuario_id", response.data.id.toString());
        await AsyncStorage.setItem("usuario_nome", response.data.nome);
        await AsyncStorage.setItem("usuario_email", response.data.email);
        await AsyncStorage.setItem("auth_token", response.data.token);

        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const signup = async (nome, email, senha) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios`, {
        nome,
        email: email.toLowerCase(),
        senha
      });

      if (response.data) {
        // Salvar dados do usuário no storage
        await AsyncStorage.setItem("usuario_nome", nome);
        await AsyncStorage.setItem("usuario_email", email.toLowerCase());
        await AsyncStorage.setItem("usuario_senha", senha);
        await AsyncStorage.setItem("@usuario_nome", nome);
        await AsyncStorage.setItem("@usuario_email", email.toLowerCase());
        
        if (response.data.id) {
          await AsyncStorage.setItem("usuario_id", response.data.id.toString());
          await AsyncStorage.setItem("@usuario_id", response.data.id.toString());
        }
        
        // Fazer login automaticamente
        return await login(email, senha);
      }
      return false;
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return false;
    }
  };

  // ✅ LOGOUT CORRIGIDO - NÃO limpa o AsyncStorage
  const logout = async () => {
    try {
      // Apenas limpa o estado em memória
      setToken(null);
      setUser(null);
      
      console.log("🔓 Logout realizado, dados mantidos no storage");
      return true;
    } catch (error) {
      console.error("Erro no logout:", error);
      return false;
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}