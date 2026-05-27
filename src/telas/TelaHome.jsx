import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function TelaHome({ navigation }) {
  const { user, isDarkMode, toggleTheme } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalSequestrado: 1250,
    propriedades: 3,
  });

  const themeStyles = isDarkMode ? styles.escuro : styles.claro;

  // Mock de atividades recentes
  const recentActivities = [
    { id: 1, type: "property", title: "Fazenda Boa Vista", amount: "+150 tCO2", icon: "tree" },
    { id: 4, type: "property", title: "Sítio São João", amount: "+75 tCO2", icon: "tree" },
  ];

  const MetricaCard = ({ icon, title, value, color, trend }) => (
    <LinearGradient
      colors={isDarkMode ? ["#1E1E1E", "#2A2A2A"] : ["#FFFFFF", "#F8F9FA"]}
      style={styles.MetricaCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.iconeContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.metricaTitulo, themeStyles.subTexto]}>{title}</Text>
      <Text style={[styles.valorMetrica, themeStyles.texto]}>{value}</Text>
    </LinearGradient>
  );

  const ItemAtividade = ({ activity }) => (
    <View style={[styles.ItemAtividade, isDarkMode && styles.ItemAtividadeEscuro]}>
      <View style={styles.iconeAtividade}>
        <MaterialCommunityIcons style={styles.IconeAtividadeRecente} name={activity.icon} />
      </View>
      <View style={styles.conteudoAtividade}>
        <Text style={[styles.tituloAtividade, themeStyles.texto]}>{activity.title}</Text>
      </View>
      <Text style={styles.valorAtividade}>{activity.amount}</Text>
    </View>
  );

  const getIconColor = (type) => {
    switch (type) {
      case "property":
        return "#4CAF50";
    }
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
        {/* Header Sofisticado */}
        <LinearGradient
          colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
          style={styles.cabecalho}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cabecalhoTopo}>
            <View>
              <Text style={styles.boasvindas}>Bem-vindo,</Text>
              <Text style={styles.nomeUsuario}>{user.name}</Text>
            </View>
            <View style={styles.acoesCabecalho}>
              <TouchableOpacity onPress={toggleTheme} style={styles.botaoIconeCabecalho}>
                <Feather name={isDarkMode ? "sun" : "moon"} size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Métricas Grid */}
        <View style={styles.gradesMetricas}>
          <MetricaCard icon="droplet" title="CO2 Sequestrado" value={`${stats.totalSequestrado} t`} color="#4CAF50" trend="+12%" />
          <MetricaCard icon="home" title="Propriedades" value={stats.propriedades} color="#2196F3" />
        </View>

        {/* Atividades Recentes */}
        <View style={styles.atividadesRecentes}>
          <View style={styles.cabecalhoSecao}>
            <Text style={[styles.tituloSecao, themeStyles.texto]}>Atividades Recentes</Text>
            <TouchableOpacity>
              <Text style={styles.textoVerTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {recentActivities.map((activity) => (
            <ItemAtividade key={activity.id} activity={activity} />
          ))}
        </View>

        {/* Botão Nova Propriedade Destacado */}
        <View style={styles.containerAdicionarPropriedade}>
          <TouchableOpacity style={styles.botaoAdicionarPropriedade} onPress={() => navigation.navigate("NovaPropriedade")}>
            <LinearGradient colors={["#4CAF50", "#2D5A27"]} style={styles.gradienteAdicionarPropriedade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="plus" size={24} color="#FFF" />
              <Text style={styles.textoAdicionarPropriedade}>Nova Propriedade</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <LinearGradient colors={isDarkMode ? ["#1E272E", "#0D1117"] : ["#2D5A27", "#1B3A1A"]} style={styles.rodape} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.conteudoRodape}>
            <FontAwesome5 name="leaf" size={24} color="#4CAF50" />
            <Text style={styles.tituloRodape}>CarbonTrack</Text>
            <Text style={styles.textoRodape}>Monitoramento Inteligente de Carbono</Text>
            <View style={styles.divisorRodape} />
            <View style={styles.estatisticasRodape}>
              <View style={styles.estatisticaRodape}>
                <Text style={styles.valorEstatisticaRodape}>1.250+</Text>
                <Text style={styles.rotuloEstatisticaRodape}>tCO2 sequestrados</Text>
              </View>
              <View style={styles.divisorEstatisticaRodape} />
              <View style={styles.estatisticaRodape}>
                <Text style={styles.valorEstatisticaRodape}>2</Text>
                <Text style={styles.rotuloEstatisticaRodape}>propriedades ativas</Text>
              </View>
            </View>
            <Text style={styles.versaoRodape}>Versão 1.0.0</Text>
            <Text style={styles.copyrightRodape}>© 2024 CarbonTrack. Todos os direitos reservados.</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { paddingBottom: 0 },

  // Header
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  cabecalhoTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  boasvindas: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  nomeUsuario: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  acoesCabecalho: {
    flexDirection: "row",
    gap: 12,
  },
  botaoIconeCabecalho: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // Métricas
  gradesMetricas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
    gap: 15,
    justifyContent: "center",
  },
  MetricaCard: {
    width: "80%",
    padding: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
  },
  iconeContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  valorMetrica: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricaTitulo: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 9,
    color: "#4CAF50",
    marginLeft: 2,
  },

  // Botão Nova Propriedade
  containerAdicionarPropriedade: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  botaoAdicionarPropriedade: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradienteAdicionarPropriedade: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  textoAdicionarPropriedade: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Atividades
  atividadesRecentes: {
    marginTop: 0,
    paddingHorizontal: 20,
    marginBottom: 20,
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
    marginBottom: 0,
  },
  textoVerTodos: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  ItemAtividade: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  ItemAtividadeEscuro: {
    backgroundColor: "#1E1E1E",
  },
  iconeAtividade: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#d0f0d1",
  },
  IconeAtividadeRecente: {
    fontSize: 20,
    color: "#4CAF50",
  },
  conteudoAtividade: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tituloAtividade: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  valorAtividade: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
    marginBottom: 8,
  },
  textoRodape: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 20,
  },
  divisorRodape: {
    width: 50,
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
    card: { backgroundColor: "#FFF" },
  },
  escuro: {
    container: { backgroundColor: "#121212" },
    texto: { color: "#FFF" },
    subTexto: { color: "#CCC" },
    card: { backgroundColor: "#1E1E1E" },
  },
});
