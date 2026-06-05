import React, { useContext, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config.js";

const CardPropriedade = ({ propriedade, isDarkMode, onRemover, onEditar }) => {
  const formatarNumero = (num) => {
    return num?.toLocaleString("pt-BR") || "0";
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
            <MaterialCommunityIcons name="pine-tree" size={24} color="#4CAF50" />
          </View>
          <View style={styles.infoCabecalhoPropriedade}>
            <Text style={[styles.nomePropriedade, isDarkMode && styles.textoClaro]}>{propriedade.nome}</Text>
            <View style={styles.containerLocalizacao}>
              <Feather name="map-pin" size={12} color="#999" />
              <Text style={styles.localizacaoPropriedade}>{propriedade.cidade || propriedade.endereco || "Localização não informada"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.containerEstatisticas}>
          <View style={styles.itemEstatistica}>
            <MaterialCommunityIcons name="leaf" size={18} color="#4CAF50" />
            <Text style={[styles.valorEstatistica, isDarkMode && styles.textoClaro]}>{formatarNumero(propriedade.carbonoEstimado)} t</Text>
            <Text style={styles.rotuloEstatistica}>CO₂ estimado</Text>
          </View>

          <View style={styles.divisorEstatistica} />

          <View style={styles.itemEstatistica}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#FF9800" />
            <Text style={[styles.valorEstatistica, isDarkMode && styles.textoClaro]}>{propriedade.areaHectares?.toFixed(2) || 0} ha</Text>
            <Text style={styles.rotuloEstatistica}>Área</Text>
          </View>
        </View>

        <View style={styles.botoesAcaoCard}>
          <TouchableOpacity onPress={() => onEditar(propriedade)} style={styles.botaoEditar}>
            <Feather name="edit-2" size={18} color="#FFF" />
            <Text style={styles.textoBotaoAcao}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRemover(propriedade.id)} style={styles.botaoRemover}>
            <Feather name="trash-2" size={18} color="#FFF" />
            <Text style={styles.textoBotaoAcao}>Remover</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function TelaListaPropriedades({ navigation }) {
  const { isDarkMode, toggleTheme } = useContext(AppContext);
  const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

  const [propriedades, setPropriedades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [propriedadeEditando, setPropriedadeEditando] = useState(null);
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const [anoEditado, setAnoEditado] = useState("");
  const [mesEditado, setMesEditado] = useState("");

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      try {
        let storedToken = await AsyncStorage.getItem("auth_token");
        let storedUserId = await AsyncStorage.getItem("usuario_id");

        if (!storedToken) {
          storedToken = await AsyncStorage.getItem("@auth_token");
          storedUserId = await AsyncStorage.getItem("@usuario_id");
        }

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
          console.log("✅ Token e userId carregados:", { userId: storedUserId });
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

  const carregarPropriedades = useCallback(async () => {
    if (!token || !userId) return;

    setCarregando(true);
    try {
      console.log("📤 Buscando propriedades...");
      console.log("📤 Usuário logado ID:", userId);

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

      setPropriedades(propriedadesDoUsuario);
    } catch (error) {
      console.error("❌ Erro ao buscar propriedades:", error.response?.status);

      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert("Erro de Autenticação", "Sua sessão expirou. Faça login novamente.");
        navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
      } else {
        Alert.alert("Erro", "Não foi possível carregar suas propriedades.");
        setPropriedades([]);
      }
    } finally {
      setCarregando(false);
    }
  }, [token, userId, navigation]);

  // ✅ Buscar propriedade completa por ID
  const buscarPropriedadeCompleta = useCallback(
    async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/propriedades/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error) {
        console.error("❌ Erro ao buscar propriedade completa:", error);
        return null;
      }
    },
    [token]
  );

  useEffect(() => {
    if (token && userId) {
      carregarPropriedades();
    }
  }, [token, userId, carregarPropriedades]);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 TelaListaPropriedades recebeu foco - recarregando...");
      if (token && userId) {
        carregarPropriedades();
      }
    }, [token, userId, carregarPropriedades])
  );

  const handleNavegarVoltar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNavegarNovaPropriedade = useCallback(() => {
    navigation.navigate("TelaNovaPropriedade");
  }, [navigation]);

  const handleRemoverPropriedade = useCallback(
    async (id) => {
      Alert.alert("Remover", "Tem certeza que deseja remover esta propriedade?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/propriedades/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setPropriedades((prev) => prev.filter((prop) => prop.id !== id));
              Alert.alert("Sucesso", "Propriedade removida com sucesso!");
            } catch (error) {
              console.error("Erro ao remover:", error);
              Alert.alert("Erro", "Não foi possível remover a propriedade.");
            }
          },
        },
      ]);
    },
    [token]
  );

  const handleAbrirEdicao = useCallback((propriedade) => {
    setPropriedadeEditando(propriedade);
    setNomeEditado(propriedade.nome);
    setAnoEditado(propriedade.anoAquisicao?.toString() || "");
    setMesEditado(propriedade.mesAquisicao?.toString() || "");
    setModalVisible(true);
  }, []);

  // Busca a propriedade completa e envia todos os campos
  const handleSalvarEdicao = useCallback(async () => {
    if (!nomeEditado.trim()) {
      Alert.alert("Erro", "O nome da propriedade é obrigatório");
      return;
    }

    setEditando(true);

    try {
      // Buscar a propriedade completa do backend
      const propriedadeCompleta = await buscarPropriedadeCompleta(propriedadeEditando.id);

      if (!propriedadeCompleta) {
        Alert.alert("Erro", "Não foi possível carregar os dados da propriedade.");
        setEditando(false);
        return;
      }

      // Construir o payload com TODOS os campos obrigatórios
      const payload = {
        nome: nomeEditado.trim(),
        endereco: propriedadeCompleta.endereco || "",
        cidade: propriedadeCompleta.cidade || "",
        estado: propriedadeCompleta.estado || "",
        cep: propriedadeCompleta.cep || "00000000",
        usuarioId: userId,
        geometriaWkt: propriedadeCompleta.geometriaWkt || "",
        anoAquisicao: anoEditado ? parseInt(anoEditado) : propriedadeCompleta.anoAquisicao,
        mesAquisicao: mesEditado ? parseInt(mesEditado) : propriedadeCompleta.mesAquisicao,
      };

      console.log("📤 Payload da edição (completo):", JSON.stringify(payload, null, 2));

      const response = await axios.put(`${API_BASE_URL}/propriedades/${propriedadeEditando.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        // Atualizar a propriedade na lista local
        setPropriedades((prev) =>
          prev.map((prop) =>
            prop.id === propriedadeEditando.id
              ? {
                  ...prop,
                  nome: nomeEditado.trim(),
                  anoAquisicao: payload.anoAquisicao,
                  mesAquisicao: payload.mesAquisicao,
                }
              : prop
          )
        );

        setModalVisible(false);
        Alert.alert("Sucesso", "Propriedade atualizada com sucesso!");
      }
    } catch (error) {
      console.error("❌ Erro ao editar:", error.response?.data);

      if (error.response?.status === 400) {
        Alert.alert("Erro", "Dados inválidos. Verifique os campos preenchidos.");
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert("Erro de Autenticação", "Sua sessão expirou. Faça login novamente.");
        navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a propriedade.");
      }
    } finally {
      setEditando(false);
    }
  }, [nomeEditado, anoEditado, mesEditado, token, userId, propriedadeEditando, navigation, buscarPropriedadeCompleta]);

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
        {carregando ? (
          <View style={styles.centralizarCarregamento}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={[styles.textoCarregando, temaEstilos.texto]}>Carregando suas propriedades...</Text>
          </View>
        ) : propriedades.length > 0 ? (
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
              <CardPropriedade
                key={propriedade.id}
                propriedade={propriedade}
                isDarkMode={isDarkMode}
                onRemover={handleRemoverPropriedade}
                onEditar={handleAbrirEdicao}
              />
            ))}
          </>
        ) : (
          <View style={styles.estadoVazio}>
            <MaterialCommunityIcons name="pine-tree" size={80} color="#CCC" />
            <Text style={[styles.tituloEstadoVazio, temaEstilos.texto]}>Nenhuma propriedade encontrada</Text>
            <Text style={[styles.textoEstadoVazio, temaEstilos.subTexto]}>Você ainda não possui propriedades cadastradas</Text>
            <TouchableOpacity style={styles.botaoEstadoVazio} onPress={handleNavegarNovaPropriedade}>
              <LinearGradient colors={["#4CAF50", "#2D5A27"]} style={styles.gradienteEstadoVazio} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="plus" size={20} color="#FFF" />
                <Text style={styles.textoBotaoEstadoVazio}>Adicionar Propriedade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode && styles.modalContainerEscuro]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitulo, isDarkMode && styles.textoClaro]}>Editar Propriedade</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, isDarkMode && styles.textoClaro]}>Nome da Propriedade *</Text>
              <TextInput
                style={[styles.modalInput, isDarkMode && styles.modalInputEscuro]}
                value={nomeEditado}
                onChangeText={setNomeEditado}
                placeholder="Digite o nome da propriedade"
                placeholderTextColor="#999"
              />

              <Text style={[styles.modalLabel, isDarkMode && styles.textoClaro]}>Ano de Aquisição (opcional)</Text>
              <TextInput
                style={[styles.modalInput, isDarkMode && styles.modalInputEscuro]}
                value={anoEditado}
                onChangeText={setAnoEditado}
                placeholder="Ex: 2020"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={[styles.modalLabel, isDarkMode && styles.textoClaro]}>Mês de Aquisição (opcional)</Text>
              <TextInput
                style={[styles.modalInput, isDarkMode && styles.modalInputEscuro]}
                value={mesEditado}
                onChangeText={setMesEditado}
                placeholder="Ex: 5"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBotaoCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBotaoSalvar} onPress={handleSalvarEdicao} disabled={editando}>
                {editando ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.modalBotaoSalvarTexto}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    alignItems: "center",
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
  infoCabecalhoPropriedade: {
    flex: 1,
  },
  nomePropriedade: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  containerLocalizacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  localizacaoPropriedade: {
    fontSize: 12,
    color: "#999",
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
  itemEstatistica: {
    alignItems: "center",
    flex: 1,
  },
  valorEstatistica: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  rotuloEstatistica: {
    fontSize: 10,
    color: "#999",
  },
  divisorEstatistica: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  botoesAcaoCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  botaoEditar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  botaoRemover: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5252",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  textoBotaoAcao: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  estadoVazio: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  tituloEstadoVazio: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  textoEstadoVazio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  botaoEstadoVazio: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradienteEstadoVazio: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  textoBotaoEstadoVazio: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  centralizarCarregamento: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  textoCarregando: {
    marginTop: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContainerEscuro: {
    backgroundColor: "#1E1E1E",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalInputEscuro: {
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    borderColor: "#444",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  modalBotaoCancelarTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalBotaoSalvar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  modalBotaoSalvarTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
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
  textoClaro: { color: "#FFF" },
});
