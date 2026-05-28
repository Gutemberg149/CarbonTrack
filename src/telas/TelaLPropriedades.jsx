import React, { useContext, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from "react-native";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const CardPropriedade = ({ propriedade, isDarkMode, onRemover }) => {
  const formatarNumero = (num) => {
    return num.toLocaleString("pt-BR");
  };

  const handleRemover = () => {
    Alert.alert("Remover Propriedade", `Tem certeza que deseja remover ${propriedade.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => onRemover(propriedade.id),
      },
    ]);
  };

  return (
    <View style={[styles.cardPropriedade, isDarkMode && styles.cardPropriedadeEscuro]}>
      <LinearGradient
        colors={isDarkMode ? ["#1E1E1E", "#2A2A2A"] : ["#FFFFFF", "#F8F9FA"]}
        style={styles.gradienteCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cabecalhoCard}>
          <View style={styles.containerIconePropriedade}>
            <MaterialCommunityIcons name="island" size={24} color="#4CAF50" />
          </View>
          <View style={styles.infoCabecalhoPropriedade}>
            <Text style={[styles.nomePropriedade, isDarkMode && styles.textoClaro]}>{propriedade.nome}</Text>
            <View style={styles.containerLocalizacao}>
              <Feather name="map-pin" size={12} color="#999" />
              <Text style={styles.localizacaoPropriedade}>{propriedade.localizacao}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemover} style={styles.botaoRemover}>
            <Feather name="trash-2" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>

        <View style={styles.containerEstatisticas}>
          <View style={styles.itemEstatistica}>
            <MaterialCommunityIcons name="leaf" size={18} color="#4CAF50" />
            <Text style={[styles.valorEstatistica, isDarkMode && styles.textoClaro]}>{formatarNumero(propriedade.co2Sequestrado)} t</Text>
            <Text style={styles.rotuloEstatistica}>CO₂ sequestrado</Text>
          </View>

          <View style={styles.divisorEstatistica} />

          <View style={styles.itemEstatistica}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#FF9800" />
            <Text style={[styles.valorEstatistica, isDarkMode && styles.textoClaro]}>{propriedade.area} ha</Text>
            <Text style={styles.rotuloEstatistica}>Área</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};


export default function TelaListaPropriedades({ navigation }) {
  const { isDarkMode, toggleTheme } = useContext(AppContext);
  const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

  const [propriedades, setPropriedades] = useState([
    {
      id: 1,
      nome: "Fazenda Boa Vista",
      localizacao: "São Paulo, SP",
      area: 245.5,
      co2Sequestrado: 450,
    },
    {
      id: 2,
      nome: "Sítio São João",
      localizacao: "Minas Gerais, MG",
      area: 120.8,
      co2Sequestrado: 280,
    },
    {
      id: 3,
      nome: "Fazenda Rio Verde",
      localizacao: "Paraná, PR",
      area: 380.2,
      co2Sequestrado: 520,
    },
    {
      id: 4,
      nome: "Reflorestamento Serra Azul",
      localizacao: "Santa Catarina, SC",
      area: 95.3,
      co2Sequestrado: 0,
    },
  ]);

  const handleNavegarVoltar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNavegarNovaPropriedade = useCallback(() => {
    navigation.navigate("NovaPropriedade");
  }, [navigation]);

  const handleRemoverPropriedade = useCallback((id) => {
    setPropriedades((prev) => prev.filter((prop) => prop.id !== id));
  }, []);

  return (
    <SafeAreaView style={[styles.container, temaEstilos.container]}>
      <LinearGradient
        colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
        style={styles.cabecalho}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.topoCabecalho}>
          <TouchableOpacity onPress={handleNavegarVoltar} style={styles.botaoVoltar}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.tituloCabecalho}>Minhas Propriedades</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.botaoTema}>
            <Feather name={isDarkMode ? "sun" : "moon"} size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudoScroll}>
        {propriedades.length > 0 ? (
          <>
            <View style={styles.cabecalhoResultados}>
              <Text style={[styles.textoQuantidade, temaEstilos.subTexto]}>
                {propriedades.length} propriedade
                {propriedades.length !== 1 ? "s" : ""} cadastrada(s)
              </Text>
              <TouchableOpacity style={styles.botaoAdicionar} onPress={handleNavegarNovaPropriedade}>
                <Feather name="plus" size={16} color="#4CAF50" />
                <Text style={styles.textoBotaoAdicionar}>Nova Propriedade</Text>
              </TouchableOpacity>
            </View>

            {propriedades.map((propriedade) => (
              <CardPropriedade key={propriedade.id} propriedade={propriedade} isDarkMode={isDarkMode} onRemover={handleRemoverPropriedade} />
            ))}
          </>
        ) : (
          <View style={styles.estadoVazio}>
            <MaterialCommunityIcons name="farm" size={80} color="#CCC" />
            <Text style={[styles.tituloEstadoVazio, temaEstilos.texto]}>Nenhuma propriedade encontrada</Text>
            <Text style={[styles.textoEstadoVazio, temaEstilos.subTexto]}>Adicione sua primeira propriedade para começar o monitoramento</Text>
            <TouchableOpacity style={styles.botaoEstadoVazio} onPress={handleNavegarNovaPropriedade}>
              <LinearGradient colors={["#4CAF50", "#2D5A27"]} style={styles.gradienteEstadoVazio} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="plus" size={20} color="#FFF" />
                <Text style={styles.textoBotaoEstadoVazio}>Adicionar Propriedade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Cabeçalho
  cabecalho: {
    paddingTop: 35,
    paddingBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tituloCabecalho: {
    fontSize: 20,
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

  // Conteúdo
  conteudo: { flex: 1 },
  conteudoScroll: { padding: 20 },
  cabecalhoResultados: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  textoQuantidade: { fontSize: 14, color: "#666" },
  botaoAdicionar: { flexDirection: "row", alignItems: "center", gap: 6 },
  textoBotaoAdicionar: { fontSize: 14, color: "#4CAF50", fontWeight: "600" },

  // Card Propriedade
  cardPropriedade: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPropriedadeEscuro: { backgroundColor: "#1E1E1E" },
  gradienteCard: { padding: 15, borderRadius: 15 },
  cabecalhoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  containerIconePropriedade: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#4CAF5020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoCabecalhoPropriedade: { flex: 1 },
  nomePropriedade: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  containerLocalizacao: { flexDirection: "row", alignItems: "center", gap: 4 },
  localizacaoPropriedade: { fontSize: 12, color: "#999" },
  botaoRemover: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#FF525220",
    justifyContent: "center",
    alignItems: "center",
  },
  containerEstatisticas: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  itemEstatistica: { alignItems: "center", flex: 1 },
  valorEstatistica: { fontSize: 14, fontWeight: "bold", marginTop: 4, marginBottom: 2 },
  rotuloEstatistica: { fontSize: 10, color: "#999" },
  divisorEstatistica: { width: 1, backgroundColor: "#E0E0E0" },


 

  // Estado Vazio
  estadoVazio: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  tituloEstadoVazio: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  textoEstadoVazio: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 30 },
  botaoEstadoVazio: { borderRadius: 12, overflow: "hidden" },
  gradienteEstadoVazio: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  textoBotaoEstadoVazio: { color: "#FFF", fontSize: 14, fontWeight: "600" },

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
  textoClaro: { color: "#FFF" },
});
