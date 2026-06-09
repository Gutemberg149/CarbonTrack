import React, { useContext, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import Footer from "../componentes/rodape.jsx";

const MetricCard = ({ icon, title, value, color, isDarkMode, loading }) => (
  <LinearGradient colors={isDarkMode ? ["#1E1E1E", "#2A2A2A"] : ["#FFFFFF", "#F8F9FA"]} style={styles.cardMetrica} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={[styles.containerIcone, { backgroundColor: color + "20" }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <View style={styles.containerTextoMetrica}>
      <Text style={[styles.tituloMetrica, isDarkMode && styles.textoEscuro]}>{title}</Text>
      {loading ? <ActivityIndicator size="small" color={color} /> : <Text style={[styles.valorMetrica, isDarkMode && styles.textoEscuro]}>{value}</Text>}
    </View>
  </LinearGradient>
);

const ActivityItem = ({ activity, isDarkMode, onPress }) => (
  <TouchableOpacity style={[styles.itemAtividade, isDarkMode && styles.itemAtividadeEscuro]} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.containerIconeAtividade}>
      <MaterialCommunityIcons name={activity.icon} size={20} color="#4CAF50" />
    </View>
    <View style={styles.conteudoAtividade}>
      <Text style={[styles.tituloAtividade, isDarkMode && styles.textoEscuro]}>{activity.title}</Text>
    </View>
    <Text style={styles.valorAtividade}>{activity.amount}</Text>
  </TouchableOpacity>
);



export default function TelaHome({ navigation }) {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useContext(AppContext);
  const themeStyles = isDarkMode ? styles.escuro : styles.claro;
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [propriedades, setPropriedades] = useState([]);
  const [totalCO2, setTotalCO2] = useState(0);
  const [totalPropriedades, setTotalPropriedades] = useState(0);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);

  // Carregar dados do usuário do AsyncStorage
  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        let storedToken = await AsyncStorage.getItem("auth_token");
        let storedUserId = await AsyncStorage.getItem("usuario_id");
        let storedNome = await AsyncStorage.getItem("usuario_nome");

        if (!storedToken) {
          storedToken = await AsyncStorage.getItem("@auth_token");
          storedUserId = await AsyncStorage.getItem("@usuario_id");
          storedNome = await AsyncStorage.getItem("@usuario_nome");
        }

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
          setUserName(storedNome || "Usuário");
          console.log("✅ Dados carregados:", { userId: storedUserId, nome: storedNome });
        } else {
          console.log("⚠️ Nenhum token encontrado");
          navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    carregarDadosUsuario();
  }, [navigation]);

  // Função para buscar propriedades
  const carregarPropriedades = useCallback(async () => {
    if (!token || !userId) return;

    setCarregando(true);
    try {
      console.log("📤 Buscando propriedades do usuário:", userId);

      const response = await axios.get(`${API_BASE_URL}/propriedades`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let todasPropriedades = [];
      if (response.data && response.data._embedded) {
        todasPropriedades = response.data._embedded.propriedadeResponseDTOList || [];
      } else if (Array.isArray(response.data)) {
        todasPropriedades = response.data;
      }

      const propriedadesDoUsuario = todasPropriedades.filter((prop) => prop.donoId === userId || prop.usuarioId === userId);

      console.log("✅ Propriedades encontradas:", propriedadesDoUsuario.length);
      setPropriedades(propriedadesDoUsuario);
      setTotalPropriedades(propriedadesDoUsuario.length);

      const somaCO2 = propriedadesDoUsuario.reduce((total, prop) => {
        return total + (prop.carbonoEstimado || 0);
      }, 0);

      setTotalCO2(somaCO2);
      console.log("📊 Total CO2:", somaCO2.toFixed(2), "t");

      // Gerar atividades recentes 
      const ultimasPropriedades = [...propriedadesDoUsuario]
        .sort((a, b) => {
          return (b.anoAquisicao || 0) - (a.anoAquisicao || 0);
        })
        .slice(0, 3); 

      const atividades = ultimasPropriedades.map((prop) => ({
        id: prop.id,
        title: prop.nome,
        amount: `+${(prop.carbonoEstimado || 0).toFixed(2)} tCO2`,
        icon: "tree",
        route: "TelaListaPropriedades",
      }));

      setAtividadesRecentes(atividades);
      console.log("📋 Atividades recentes geradas:", atividades.length);
    } catch (error) {
      console.error("❌ Erro ao buscar propriedades:", error.response?.status);

      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert("Erro de Autenticação", "Sua sessão expirou. Faça login novamente.");
        navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
      }
    } finally {
      setCarregando(false);
    }
  }, [token, userId, navigation]);

  // Recarregar dados quando voltar a tela
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 TelaHome recebeu foco - recarregando dados...");
      if (token && userId) {
        carregarPropriedades();
      }
    }, [token, userId, carregarPropriedades])
  );

  // Carregar dados iniciais
  useEffect(() => {
    if (token && userId) {
      carregarPropriedades();
    }
  }, [token, userId]);

  const handleNavigateToProperties = useCallback(() => {
    navigation.navigate("TelaListaPropriedades");
  }, [navigation]);

  const handleNavigateToNewProperty = useCallback(() => {
    navigation.navigate("TelaNovaPropriedade");
  }, [navigation]);

  const handleActivityPress = useCallback(
    (activity) => {
      if (activity.route) {
        navigation.navigate(activity.route);
      }
    },
    [navigation]
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            console.log("🔓 Logout realizado, dados mantidos no storage");
            navigation.reset({
              index: 0,
              routes: [{ name: "TelaLogin" }],
            });
          } catch (error) {
            console.error("Erro no logout:", error);
          }
        },
      },
    ]);
  }, [logout, navigation]);

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudoScroll}>
        <LinearGradient
          colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
          style={styles.cabecalho}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={styles.boasvindas}>Bem-vindo,</Text>
            <Text style={styles.nomeUsuario}>{userName || "Usuário"}</Text>
          </View>
          <View style={styles.appNameContainer}>
            <FontAwesome5 name="leaf" size={20} color="#FFF" />
            <Text style={styles.appNameHeader}>CarbonTrack</Text>
          </View>
          <View style={styles.acoesCabecalho}>
            <TouchableOpacity onPress={handleLogout} style={styles.botaoLogout}>
              <Feather name="log-out" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.botaoTema}>
              <Feather name={isDarkMode ? "sun" : "moon"} size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.containerMetricas}>
          <TouchableOpacity onPress={handleNavigateToProperties} activeOpacity={0.7} style={styles.botaoMetrica}>
            <MetricCard
              icon="droplet"
              title="CO2 Sequestrado"
              value={`${totalCO2.toFixed(2)} t`}
              color="#4CAF50"
              isDarkMode={isDarkMode}
              loading={carregando}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToProperties} activeOpacity={0.7} style={styles.botaoMetrica}>
            <MetricCard icon="home" title="Propriedades" value={totalPropriedades} color="#2196F3" isDarkMode={isDarkMode} loading={carregando} />
          </TouchableOpacity>
        </View>

        <View style={styles.containerAtividades}>
          <View style={styles.cabecalhoSecao}>
            <Text style={[styles.tituloSecao, themeStyles.texto]}>As 3 últimas atividades</Text>
          </View>

          {carregando ? (
            <View style={styles.carregandoAtividades}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={[styles.textoCarregando, themeStyles.subTexto]}>Carregando atividades...</Text>
            </View>
          ) : atividadesRecentes.length > 0 ? (
            atividadesRecentes.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} isDarkMode={isDarkMode} onPress={() => handleActivityPress(activity)} />
            ))
          ) : (
            <View style={styles.semAtividades}>
              <Text style={[styles.textoSemAtividades, themeStyles.subTexto]}>Nenhuma propriedade cadastrada ainda</Text>
              <TouchableOpacity onPress={handleNavigateToNewProperty}>
                <Text style={styles.textoAdicionarPrimeira}>Adicionar primeira propriedade</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.containerBotaoAdicionar}>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={handleNavigateToProperties} activeOpacity={0.8}>
            <LinearGradient colors={["#4CAF50", "#2D5A27"]} style={styles.gradienteBotaoAdicionar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="folder" size={24} color="#FFF" />
              <Text style={styles.textoBotaoAdicionar}>Todas as Propriedades</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.containerBotaoAdicionar}>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={handleNavigateToNewProperty} activeOpacity={0.8}>
            <LinearGradient colors={["#4CAF50", "#2D5A27"]} style={styles.gradienteBotaoAdicionar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="plus" size={24} color="#FFF" />
              <Text style={styles.textoBotaoAdicionar}>Nova Propriedade</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Footer isDarkMode={isDarkMode} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudoScroll: {
    paddingBottom: 0,
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
  },
  acoesCabecalho: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  boasvindas: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  nomeUsuario: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  botaoTema: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoLogout: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  appNameContainer: {
    flexDirection: "row",
    alignItems: "top",
    justifyContent: "center",
    marginTop: 15,
    gap: 8,
    height: 40,
  },
  appNameHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 1,
  },
  containerMetricas: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  botaoMetrica: {
    width: "100%",
  },
  cardMetrica: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  containerTextoMetrica: {
    flex: 1,
  },
  tituloMetrica: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  valorMetrica: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  containerAtividades: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cabecalhoSecao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemAtividade: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemAtividadeEscuro: {
    backgroundColor: "#1E1E1E",
  },
  containerIconeAtividade: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conteudoAtividade: {
    flex: 1,
  },
  tituloAtividade: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  valorAtividade: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  containerBotaoAdicionar: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  botaoAdicionar: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradienteBotaoAdicionar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  textoBotaoAdicionar: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  rodape: {
    marginTop: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  conteudoRodape: {
    alignItems: "center",
  },
  tituloRodape: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
    marginBottom: 6,
  },
  subtituloRodape: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 20,
  },
  divisorRodape: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 15,
  },
  versaoRodape: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
  },
  copyrightRodape: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
  carregandoAtividades: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  textoCarregando: {
    marginTop: 12,
    fontSize: 14,
  },
  semAtividades: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  textoSemAtividades: {
    fontSize: 14,
    marginBottom: 12,
  },
  textoAdicionarPrimeira: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  claro: {
    container: { backgroundColor: "#F5F5F5" },
    texto: { color: "#333" },
    subTexto: { color: "#666" },
  },
  escuro: {
    container: { backgroundColor: "#121212" },
    texto: { color: "#FFF" },
    subTexto: { color: "#CCC" },
  },
  textoEscuro: {
    color: "#FFF",
  },
});
