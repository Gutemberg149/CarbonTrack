// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário ao iniciar
  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioNome = await AsyncStorage.getItem("@usuario_nome");
      if (usuarioNome) {
        setUser({ name: usuarioNome });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (nome) => {
    try {
      await AsyncStorage.setItem("@usuario_nome", nome);
      setUser({ name: nome });
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@usuario_nome");
      setUser(null);
      return true;
    } catch (error) {
      console.error("Erro no logout:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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