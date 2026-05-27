import React, { useContext, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const MetricCard = ({ icon, title, value, color, isDarkMode }) => (
  <LinearGradient colors={isDarkMode ? ["#1E1E1E", "#2A2A2A"] : ["#FFFFFF", "#F8F9FA"]} style={styles.cardMetrica} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={[styles.containerIcone, { backgroundColor: color + "20" }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <View style={styles.containerTextoMetrica}>
      <Text style={[styles.tituloMetrica, isDarkMode && styles.textoEscuro]}>{title}</Text>
      <Text style={[styles.valorMetrica, isDarkMode && styles.textoEscuro]}>{value}</Text>
    </View>
  </LinearGradient>
);

const ActivityItem = ({ activity, isDarkMode, onPress }) => (
  <TouchableOpacity style={[styles.itemAtividade, isDarkMode && styles.itemAtividadeEscuro]} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.containerIconeAtividade}>
      <MaterialCommunityIcons name={activity.icon} size={20} color="#4CAF50" style={styles.iconeAtividade} />
    </View>
    <View style={styles.conteudoAtividade}>
      <Text style={[styles.tituloAtividade, isDarkMode && styles.textoEscuro]}>{activity.title}</Text>
    </View>
    <Text style={styles.valorAtividade}>{activity.amount}</Text>
  </TouchableOpacity>
);

const Footer = ({ isDarkMode }) => (
  <LinearGradient colors={isDarkMode ? ["#1E272E", "#0D1117"] : ["#2D5A27", "#1B3A1A"]} style={styles.rodape} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={styles.conteudoRodape}>
      <FontAwesome5 name="leaf" size={28} color="#4CAF50" />
      <Text style={styles.tituloRodape}>CarbonTrack</Text>
      <Text style={styles.subtituloRodape}>Monitoramento Inteligente de Carbono</Text>

      <View style={styles.divisorRodape} />

      <View style={styles.estatisticasRodape}>
        <View style={styles.estatisticaRodape}>
          <Text style={styles.valorEstatisticaRodape}>1.250+</Text>
          <Text style={styles.rotuloEstatisticaRodape}>tCO2 sequestrados</Text>
        </View>
        <View style={styles.divisorEstatisticaRodape} />
        <View style={styles.estatisticaRodape}>
          <Text style={styles.valorEstatisticaRodape}>3</Text>
          <Text style={styles.rotuloEstatisticaRodape}>propriedades ativas</Text>
        </View>
      </View>

      <Text style={styles.versaoRodape}>Versão 1.0.0</Text>
      <Text style={styles.copyrightRodape}>© 2024 CarbonTrack. Todos os direitos reservados.</Text>
    </View>
  </LinearGradient>
);

// Componente Principal
export default function TelaHome({ navigation }) {
  const { user, isDarkMode, toggleTheme } = useContext(AppContext);
  const themeStyles = isDarkMode ? styles.escuro : styles.claro;

  // Estados
  const [stats] = useState({
    totalSequestrado: 1250,
    propriedades: 3,
  });

  // Dados mockados
  const recentActivities = [
    {
      id: 1,
      type: "property",
      title: "Fazenda Boa Vista",
      amount: "+150 tCO2",
      icon: "tree",
      route: "Propriedades",
    },
    {
      id: 2,
      type: "property",
      title: "Sítio São João",
      amount: "+75 tCO2",
      icon: "tree",
      route: "Propriedades",
    },
  ];

  // Handlers
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

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudoScroll}>
        {/* Header */}
        <LinearGradient
          colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
          style={styles.cabecalho}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.topoCabecalho}>
            <View>
              <Text style={styles.textoBoasVindas}>Bem-vindo,</Text>
              <Text style={styles.nomeUsuario}>{user.name}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.botaoTema} activeOpacity={0.7}>
              <Feather name={isDarkMode ? "sun" : "moon"} size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Métricas */}
        <View style={styles.containerMetricas}>
          <TouchableOpacity onPress={handleNavigateToProperties} activeOpacity={0.7} style={styles.botaoMetrica}>
            <MetricCard icon="droplet" title="CO2 Sequestrado" value={`${stats.totalSequestrado} t`} color="#4CAF50" isDarkMode={isDarkMode} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToProperties} activeOpacity={0.7} style={styles.botaoMetrica}>
            <MetricCard icon="home" title="Propriedades" value={stats.propriedades} color="#2196F3" isDarkMode={isDarkMode} />
          </TouchableOpacity>
        </View>

        {/* Atividades Recentes */}
        <View style={styles.containerAtividades}>
          <View style={styles.cabecalhoSecao}>
            <Text style={[styles.tituloSecao, themeStyles.texto]}>Atividades Recentes</Text>
            <TouchableOpacity onPress={handleNavigateToProperties}>
              <Text style={styles.textoVerTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} isDarkMode={isDarkMode} onPress={() => handleActivityPress(activity)} />
          ))}
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

        {/* Footer */}
        <Footer isDarkMode={isDarkMode} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  conteudoScroll: {
    paddingBottom: 0,
  },

  // Cabeçalho
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textoBoasVindas: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  nomeUsuario: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  botaoTema: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Métricas
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

  // Atividades
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
  textoVerTodos: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
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
  iconeAtividade: {
    fontSize: 22,
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

  // Botão Adicionar
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

  // Rodapé
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
  estatisticasRodape: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  estatisticaRodape: {
    alignItems: "center",
  },
  valorEstatisticaRodape: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  rotuloEstatisticaRodape: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  divisorEstatisticaRodape: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 20,
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

  // Temas
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
