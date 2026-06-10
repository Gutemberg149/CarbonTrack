// import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList, SafeAreaView } from "react-native";
// import { useAuth } from "../../context/AuthContext.js";
// import { AppContext } from "../../context/AppProvider";
// import { LinearGradient } from "expo-linear-gradient";
// import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
// import MapView, { Polygon, Marker } from "react-native-maps";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "../config.js";

// const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// let ultimaRequisicao = 0;

// export default function TelaNovaPropriedade({ navigation }) {
//   const { isDarkMode } = useContext(AppContext); 
//   const { logout } = useAuth();

//   const [userNome, setUserNome] = useState("");
//   const [userId, setUserId] = useState(null);
//   const [token, setToken] = useState(null);

//   const [carregando, setCarregando] = useState(false);
//   const [calculando, setCalculando] = useState(false);
//   const [buscandoEndereco, setBuscandoEndereco] = useState(false);
//   const mapRef = useRef(null);

//   const [nomePropriedade, setNomePropriedade] = useState("");
//   const [endereco, setEndereco] = useState("");
//   const [enderecoCompleto, setEnderecoCompleto] = useState("");
//   const [buscaManual, setBuscaManual] = useState("");
//   const [sugestoesEndereco, setSugestoesEndereco] = useState([]);
//   const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
//   const [pontos, setPontos] = useState([]);
//   const [areaCalculada, setAreaCalculada] = useState(null);
//   const [carbonoEstimado, setCarbonoEstimado] = useState(null);
//   const [desenhando, setDesenhando] = useState(true);

//   const [anoAquisicao, setAnoAquisicao] = useState(null);
//   const [mesAquisicao, setMesAquisicao] = useState(null);

//   const [coordenadaAtual, setCoordenadaAtual] = useState({
//     latitude: -23.5505,
//     longitude: -46.6333,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   //  Estilos baseados no tema
//   const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

//   // Carregar dados do usuário do AsyncStorage
//   useEffect(() => {
//     const carregarDadosUsuario = async () => {
//       try {
//         let storedToken = await AsyncStorage.getItem("auth_token");
//         let storedUserId = await AsyncStorage.getItem("usuario_id");
//         let storedNome = await AsyncStorage.getItem("usuario_nome");

//         if (!storedToken) {
//           storedToken = await AsyncStorage.getItem("@auth_token");
//           storedUserId = await AsyncStorage.getItem("@usuario_id");
//           storedNome = await AsyncStorage.getItem("@usuario_nome");
//         }

//         console.log("📦 Token encontrado:", !!storedToken);
//         console.log("📦 UserId:", storedUserId);
//         console.log("📦 Nome:", storedNome);

//         if (storedToken && storedUserId) {
//           setToken(storedToken);
//           setUserId(storedUserId);
//           setUserNome(storedNome || "");
//           console.log("✅ Dados do usuário carregados:", { userId: storedUserId, nome: storedNome });
//         } else {
//           console.log("⚠️ Nenhum token encontrado, redirecionando para login");
//           Alert.alert("Sessão expirada", "Por favor, faça login novamente.");
//           navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
//         }
//       } catch (error) {
//         console.error("Erro ao carregar usuário:", error);
//         navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
//       }
//     };
//     carregarDadosUsuario();
//   }, [navigation]);

//   const buscarEnderecoNominatim = useCallback(async (texto) => {
//     try {
//       const agora = Date.now();
//       const tempoDecorrido = agora - ultimaRequisicao;
//       if (tempoDecorrido < 1000) {
//         await new Promise((resolve) => setTimeout(resolve, 1000 - tempoDecorrido));
//       }

//       const response = await axios.get(NOMINATIM_URL, {
//         params: {
//           q: texto,
//           format: "json",
//           addressdetails: 1,
//           limit: 10,
//           countrycodes: "br",
//           "accept-language": "pt-BR",
//         },
//         headers: { "User-Agent": "CarbonTrackApp/1.0" },
//         timeout: 10000,
//       });

//       ultimaRequisicao = Date.now();
//       return response.data;
//     } catch (error) {
//       if (error.response?.status === 429) {
//         Alert.alert("Aviso", "Muitas buscas. Aguarde alguns segundos.");
//       }
//       return [];
//     }
//   }, []);

//   const handleBuscarEndereco = useCallback(async () => {
//     if (buscaManual.length < 3) {
//       Alert.alert("Aviso", "Digite pelo menos 3 caracteres para buscar");
//       return;
//     }

//     setBuscandoEndereco(true);
//     setMostrarSugestoes(true);

//     try {
//       const resultados = await buscarEnderecoNominatim(buscaManual);
//       if (resultados.length === 0) {
//         Alert.alert("Aviso", `Nenhum local encontrado para "${buscaManual}"`);
//         setMostrarSugestoes(false);
//       } else {
//         setSugestoesEndereco(resultados);
//       }
//     } catch (error) {
//       Alert.alert("Erro", "Não foi possível buscar o local.");
//     } finally {
//       setBuscandoEndereco(false);
//     }
//   }, [buscaManual, buscarEnderecoNominatim]);

//   const selecionarEndereco = useCallback((item) => {
//     const latitude = parseFloat(item.lat);
//     const longitude = parseFloat(item.lon);
//     const nomeLocal = item.display_name.split(",")[0];
//     const enderecoFormatado = item.display_name;

//     setEndereco(nomeLocal);
//     setEnderecoCompleto(enderecoFormatado);
//     setBuscaManual("");
//     setSugestoesEndereco([]);
//     setMostrarSugestoes(false);

//     const novaRegiao = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
//     setCoordenadaAtual(novaRegiao);
//     mapRef.current?.animateToRegion(novaRegiao, 1000);
//   }, []);

//   const handleAdicionarPonto = useCallback(
//     (event) => {
//       if (!desenhando) return;
//       const { coordinate } = event.nativeEvent;
//       setPontos((prev) => [...prev, coordinate]);
//     },
//     [desenhando]
//   );

//   const pontosParaWKT = useCallback(() => {
//     if (pontos.length < 3) return null;
//     const pontosFechados = [...pontos, pontos[0]];
//     const coordenadasStr = pontosFechados.map((p) => `${p.longitude} ${p.latitude}`).join(", ");
//     return `POLYGON((${coordenadasStr}))`;
//   }, [pontos]);

//   const calcularAreaAproximada = (pontosLista) => {
//     if (pontosLista.length < 3) return 0;

//     let area = 0;
//     for (let i = 0; i < pontosLista.length; i++) {
//       const j = (i + 1) % pontosLista.length;
//       area += pontosLista[i].latitude * pontosLista[j].longitude;
//       area -= pontosLista[j].latitude * pontosLista[i].longitude;
//     }
//     area = Math.abs(area) / 2;

//     const areaKm2 = area * 111 * 111;
//     const areaHectares = areaKm2 * 100;

//     return Math.min(areaHectares, 10000);
//   };

//   const validarAnoMes = useCallback(() => {
//     const anoAtual = new Date().getFullYear();

//     if (!anoAquisicao) {
//       Alert.alert("Erro", "Informe o ano de aquisição da propriedade");
//       return false;
//     }

//     if (!mesAquisicao) {
//       Alert.alert("Erro", "Informe o mês de aquisição da propriedade");
//       return false;
//     }

//     if (anoAquisicao < 1900 || anoAquisicao > anoAtual) {
//       Alert.alert("Erro", `Ano inválido. Use um valor entre 1900 e ${anoAtual}`);
//       return false;
//     }

//     if (mesAquisicao < 1 || mesAquisicao > 12) {
//       Alert.alert("Erro", "Mês inválido. Use um valor entre 1 e 12");
//       return false;
//     }

//     return true;
//   }, [anoAquisicao, mesAquisicao]);

//   const handleCalcular = useCallback(() => {
//     if (pontos.length < 3) {
//       Alert.alert("Erro", "Desenhe pelo menos 3 pontos para formar um polígono");
//       return;
//     }

//     if (!nomePropriedade.trim()) {
//       Alert.alert("Erro", "Informe o nome da propriedade antes de calcular");
//       return;
//     }

//     if (!endereco.trim()) {
//       Alert.alert("Erro", "Selecione um endereço antes de calcular");
//       return;
//     }

//     if (!validarAnoMes()) {
//       return;
//     }

//     setCalculando(true);

//     try {
//       const area = calcularAreaAproximada(pontos);
//       const anoAtual = new Date().getFullYear();
//       const mesAtual = new Date().getMonth() + 1;

//       let anosPosse = anoAtual - anoAquisicao;
//       let mesesPosse = mesAtual - mesAquisicao;

//       if (mesesPosse < 0) {
//         anosPosse--;
//         mesesPosse += 12;
//       }

//       const totalMeses = anosPosse * 12 + mesesPosse;
//       const sequestroMensal = 0.5;
//       const carbono = area * sequestroMensal * Math.max(totalMeses, 1);

//       setAreaCalculada(area.toFixed(2));
//       setCarbonoEstimado(carbono.toFixed(2));

//       Alert.alert(
//         "✅ Cálculo realizado!",
//         `📐 Área estimada: ${area.toFixed(2)} hectares\n` +
//           `📅 Tempo de posse: ${totalMeses} meses (${anosPosse} anos)\n` +
//           `🌿 Carbono estimado: ${carbono.toFixed(2)} tCO₂\n\n` +
//           `Clique em "Salvar Propriedade" para concluir o cadastro.`,
//         [{ text: "OK" }]
//       );
//     } catch (error) {
//       Alert.alert("Erro", "Não foi possível calcular a área.");
//     } finally {
//       setCalculando(false);
//     }
//   }, [pontos, nomePropriedade, endereco, anoAquisicao, mesAquisicao, validarAnoMes]);

//   const handleLimparPontos = useCallback(() => {
//     Alert.alert("Limpar Polígono", "Deseja limpar todos os pontos?", [
//       { text: "Cancelar", style: "cancel" },
//       {
//         text: "Limpar",
//         style: "destructive",
//         onPress: () => {
//           setPontos([]);
//           setAreaCalculada(null);
//           setCarbonoEstimado(null);
//           setDesenhando(true);
//         },
//       },
//     ]);
//   }, []);

//   const handleDesfazerPonto = useCallback(() => {
//     setPontos((prev) => prev.slice(0, -1));
//   }, []);

//   const centralizarBrasil = useCallback(() => {
//     const novaRegiao = {
//       latitude: -15.7801,
//       longitude: -47.9292,
//       latitudeDelta: 25,
//       longitudeDelta: 25,
//     };
//     setCoordenadaAtual(novaRegiao);
//     mapRef.current?.animateToRegion(novaRegiao, 1000);
//   }, []);

//   const handleSalvarPropriedade = useCallback(async () => {
//     if (!nomePropriedade.trim()) {
//       Alert.alert("Erro", "Informe o nome da propriedade");
//       return;
//     }
//     if (!endereco.trim()) {
//       Alert.alert("Erro", "Selecione um endereço");
//       return;
//     }
//     if (pontos.length < 3) {
//       Alert.alert("Erro", "Desenhe o polígono da propriedade");
//       return;
//     }
//     if (!validarAnoMes()) {
//       return;
//     }
//     if (!token || !userId) {
//       Alert.alert("Erro de Autenticação", "Faça login novamente.");
//       return;
//     }

//     setCarregando(true);

//     const geometriaWkt = pontosParaWKT();

//     const enderecoParts = (enderecoCompleto || endereco || "").split(",");
//     const cidadeNome = enderecoParts[1]?.trim() || "Região";
//     const estadoSigla = enderecoParts[2]?.trim()?.slice(0, 2).toUpperCase() || "BA";

//     const payload = {
//       nome: nomePropriedade.trim(),
//       endereco: (enderecoCompleto || endereco || "").substring(0, 255),
//       cidade: cidadeNome.substring(0, 50),
//       estado: estadoSigla,
//       cep: "00000000",
//       usuarioId: userId,
//       geometriaWkt: geometriaWkt,
//       anoAquisicao: anoAquisicao,
//       mesAquisicao: mesAquisicao,
//     };

//     console.log("📤 Salvando propriedade...");
//     console.log("📤 Payload:", JSON.stringify(payload, null, 2));

//     try {
//       const response = await axios.post(`${API_BASE_URL}/propriedades`, payload, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       Alert.alert(
//         "✅ Sucesso!",
//         `Propriedade "${payload.nome}" cadastrada com sucesso!\n\n` +
//           `📐 Área: ${(response.data?.areaHectares || areaCalculada || 0).toFixed(2)} hectares\n` +
//           `🌿 Carbono: ${(response.data?.carbonoEstimado || carbonoEstimado || 0).toFixed(2)} tCO₂`,
//         [{ text: "OK", onPress: () => navigation.goBack() }]
//       );
//     } catch (error) {
//       console.error("❌ Erro ao salvar:", error.response?.data);

//       if (error.response?.status === 401 || error.response?.status === 403) {
//         Alert.alert("Erro de Autenticação", "Sua sessão expirou. Faça login novamente.");
//         await AsyncStorage.removeItem("@auth_token");
//         navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
//       } else if (error.response?.status === 400) {
//         Alert.alert("Erro", "Dados inválidos. Verifique os campos preenchidos.");
//       } else {
//         Alert.alert("Erro", "Não foi possível cadastrar a propriedade.");
//       }
//     } finally {
//       setCarregando(false);
//     }
//   }, [
//     nomePropriedade,
//     endereco,
//     enderecoCompleto,
//     pontos,
//     userId,
//     token,
//     anoAquisicao,
//     mesAquisicao,
//     navigation,
//     pontosParaWKT,
//     areaCalculada,
//     carbonoEstimado,
//     validarAnoMes,
//   ]);

//   const renderSugestao = ({ item }) => (
//     <TouchableOpacity style={[styles.itemSugestao, isDarkMode && styles.itemSugestaoEscuro]} onPress={() => selecionarEndereco(item)}>
//       <Feather name="map-pin" size={16} color="#4CAF50" />
//       <View style={styles.textoSugestaoContainer}>
//         <Text style={[styles.tituloSugestao, temaEstilos.texto]} numberOfLines={1}>
//           {item.display_name.split(",")[0]}
//         </Text>
//         <Text style={[styles.subtituloSugestao, temaEstilos.subTexto]} numberOfLines={1}>
//           {item.display_name.split(",").slice(1, 4).join(",")}
//         </Text>
//       </View>
//       <Feather name="chevron-right" size={16} color="#999" />
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={[styles.container, temaEstilos.container]}>
//       <LinearGradient
//         colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
//         style={styles.cabecalho}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.topoCabecalho}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
//             <Feather name="arrow-left" size={24} color="#FFF" />
//           </TouchableOpacity>
//           <Text style={styles.tituloCabecalho}>Nova Propriedade</Text>
//           <View style={styles.placeholder} />
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.conteudo} keyboardShouldPersistTaps="handled">
//         <View style={styles.formulario}>
//           <View style={styles.campo}>
//             <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Nome da Propriedade *</Text>
//             <TextInput
//               style={[styles.input, isDarkMode && styles.inputEscuro]}
//               placeholder="Ex: Fazenda Boa Vista"
//               placeholderTextColor="#999"
//               value={nomePropriedade}
//               onChangeText={setNomePropriedade}
//             />
//           </View>

//           <View style={styles.campo}>
//             <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Buscar Endereço *</Text>
//             <View style={styles.containerBusca}>
//               <TextInput
//                 style={[styles.inputBusca, isDarkMode && styles.inputEscuro]}
//                 placeholder="Digite cidade, estado, rua..."
//                 placeholderTextColor="#999"
//                 value={buscaManual}
//                 onChangeText={setBuscaManual}
//                 onSubmitEditing={handleBuscarEndereco}
//               />
//               <TouchableOpacity style={styles.botaoBuscar} onPress={handleBuscarEndereco} disabled={buscandoEndereco}>
//                 {buscandoEndereco ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="search" size={22} color="#FFF" />}
//               </TouchableOpacity>
//             </View>
//             {endereco !== "" && (
//               <View style={styles.enderecoSelecionado}>
//                 <Feather name="check-circle" size={16} color="#4CAF50" />
//                 <Text style={[styles.textoEnderecoSelecionado, temaEstilos.subTexto]}>{enderecoCompleto || endereco}</Text>
//               </View>
//             )}
//           </View>

//           <View style={styles.linhaCampos}>
//             <View style={[styles.campo, styles.campoMetade]}>
//               <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Ano de Aquisição *</Text>
//               <TextInput
//                 style={[styles.input, isDarkMode && styles.inputEscuro]}
//                 placeholder="Ex: 2020"
//                 placeholderTextColor="#999"
//                 keyboardType="numeric"
//                 value={anoAquisicao?.toString() || ""}
//                 onChangeText={(text) => setAnoAquisicao(text ? parseInt(text) : null)}
//               />
//             </View>

//             <View style={[styles.campo, styles.campoMetade]}>
//               <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Mês de Aquisição *</Text>
//               <TextInput
//                 style={[styles.input, isDarkMode && styles.inputEscuro]}
//                 placeholder="Ex: 5"
//                 placeholderTextColor="#999"
//                 keyboardType="numeric"
//                 value={mesAquisicao?.toString() || ""}
//                 onChangeText={(text) => {
//                   const val = text ? parseInt(text) : null;
//                   setMesAquisicao(val ? Math.min(12, Math.max(1, val)) : null);
//                 }}
//               />
//             </View>
//           </View>

//           <View style={styles.botoesNavegacao}>
//             <TouchableOpacity style={styles.botaoNavegacao} onPress={centralizarBrasil}>
//               <Feather name="map" size={18} color="#4CAF50" />
//               <Text style={styles.textoBotaoNavegacao}>Centralizar Brasil</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.secaoMapa}>
//           <Text style={[styles.tituloSecao, temaEstilos.texto]}>Desenhe o Polígono</Text>
//           <Text style={[styles.subtituloSecao, temaEstilos.subTexto]}>
//             {desenhando && pontos.length === 0 && "📍 Toque no mapa para adicionar vértices"}
//             {desenhando && pontos.length > 0 && `✏️ ${pontos.length} ponto(s) adicionados`}
//             {!desenhando && "✅ Polígono finalizado!"}
//           </Text>

//           <View style={styles.containerMapa}>
//             <MapView ref={mapRef} style={styles.mapa} region={coordenadaAtual} onPress={handleAdicionarPonto} zoomControlEnabled={true}>
//               {pontos.map((ponto, index) => (
//                 <Marker key={index} coordinate={ponto} title={`Ponto ${index + 1}`} pinColor="#4CAF50" />
//               ))}
//               {pontos.length >= 3 && <Polygon coordinates={pontos} fillColor="rgba(76, 175, 80, 0.3)" strokeColor="#4CAF50" strokeWidth={2} />}
//             </MapView>
//           </View>

//           <View style={styles.controlesMapa}>
//             {desenhando && pontos.length > 0 && (
//               <TouchableOpacity style={styles.botaoControle} onPress={handleDesfazerPonto}>
//                 <Feather name="corner-up-left" size={18} color="#FFF" />
//                 <Text style={styles.textoBotaoControle}>Desfazer</Text>
//               </TouchableOpacity>
//             )}
//             {desenhando && pontos.length >= 3 && (
//               <TouchableOpacity style={[styles.botaoControle, styles.botaoCalcular]} onPress={handleCalcular} disabled={!anoAquisicao || !mesAquisicao}>
//                 {calculando ? (
//                   <ActivityIndicator size="small" color="#FFF" />
//                 ) : (
//                   <>
//                     <Feather name="activity" size={18} color="#FFF" />
//                     <Text style={styles.textoBotaoControle}>Calcular</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             )}
//             {!desenhando && (
//               <TouchableOpacity style={[styles.botaoControle, styles.botaoRedesenhar]} onPress={handleLimparPontos}>
//                 <Feather name="refresh-cw" size={18} color="#FFF" />
//                 <Text style={styles.textoBotaoControle}>Redesenhar</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity style={[styles.botaoControle, styles.botaoLimpar]} onPress={handleLimparPontos}>
//               <Feather name="trash-2" size={18} color="#FFF" />
//               <Text style={styles.textoBotaoControle}>Limpar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {(areaCalculada || carbonoEstimado) && (
//           <View style={styles.secaoInfo}>
//             <Text style={[styles.tituloSecao, temaEstilos.texto]}>🌱 Informações Calculadas</Text>
//             <View style={styles.cardInfo}>
//               <View style={styles.itemInfo}>
//                 <MaterialCommunityIcons name="map-marker-radius" size={24} color="#4CAF50" />
//                 <Text style={[styles.valorInfo, temaEstilos.texto]}>{areaCalculada} ha</Text>
//                 <Text style={styles.rotuloInfo}>Área Estimada</Text>
//               </View>
//               <View style={styles.divisorInfo} />
//               <View style={styles.itemInfo}>
//                 <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
//                 <Text style={[styles.valorInfo, temaEstilos.texto]}>{carbonoEstimado} tCO₂</Text>
//                 <Text style={styles.rotuloInfo}>Carbono Estimado</Text>
//               </View>
//             </View>
//           </View>
//         )}

//         <View style={styles.botoesAcao}>
//           <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
//             <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.botaoSalvar}
//             onPress={handleSalvarPropriedade}
//             disabled={carregando || pontos.length < 3 || !nomePropriedade || !endereco || !token || !userId || !anoAquisicao || !mesAquisicao}
//           >
//             <LinearGradient colors={carregando || !anoAquisicao || !mesAquisicao ? ["#999", "#666"] : ["#4CAF50", "#2D5A27"]} style={styles.gradienteSalvar}>
//               {carregando ? (
//                 <ActivityIndicator size="small" color="#FFF" />
//               ) : (
//                 <>
//                   <Feather name="save" size={20} color="#FFF" />
//                   <Text style={styles.textoBotaoSalvar}>Salvar Propriedade</Text>
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {mostrarSugestoes && sugestoesEndereco.length > 0 && (
//         <View style={styles.sugestoesOverlay}>
//           <View style={[styles.sugestoesContainer, isDarkMode && styles.sugestoesContainerEscuro]}>
//             <View style={styles.sugestoesHeader}>
//               <Text style={[styles.sugestoesTitulo, temaEstilos.texto]}>📍 Locais ({sugestoesEndereco.length})</Text>
//               <TouchableOpacity onPress={() => setMostrarSugestoes(false)}>
//                 <Feather name="x" size={20} color="#999" />
//               </TouchableOpacity>
//             </View>
//             <FlatList data={sugestoesEndereco} keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`} renderItem={renderSugestao} />
//           </View>
//         </View>
//       )}
      
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   cabecalho: {
//     paddingTop: 35,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   topoCabecalho: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   botaoVoltar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   placeholder: {
//     width: 40,
//   },
//   tituloCabecalho: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#FFF",
//   },
//   conteudo: {
//     flex: 1,
//   },
//   formulario: {
//     padding: 20,
//   },
//   campo: {
//     marginBottom: 20,
//   },
//   rotuloCampo: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     padding: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   inputEscuro: {
//     backgroundColor: "#1E1E1E",
//     color: "#FFF",
//     borderColor: "#333",
//   },
//   containerBusca: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   inputBusca: {
//     flex: 1,
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     padding: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   botaoBuscar: {
//     width: 50,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: "#4CAF50",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   enderecoSelecionado: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     gap: 8,
//     padding: 8,
//     backgroundColor: "#E8F5E9",
//     borderRadius: 8,
//   },
//   textoEnderecoSelecionado: {
//     flex: 1,
//     fontSize: 12,
//   },
//   linhaCampos: {
//     flexDirection: "row",
//     gap: 15,
//   },
//   campoMetade: {
//     flex: 1,
//   },
//   botoesNavegacao: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 5,
//   },
//   botaoNavegacao: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#E8F5E9",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     gap: 5,
//   },
//   textoBotaoNavegacao: {
//     fontSize: 12,
//     color: "#4CAF50",
//     fontWeight: "500",
//   },
//   secaoMapa: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   tituloSecao: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   subtituloSecao: {
//     fontSize: 12,
//     marginBottom: 15,
//   },
//   containerMapa: {
//     height: 400,
//     borderRadius: 15,
//     overflow: "hidden",
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   mapa: {
//     flex: 1,
//   },
//   controlesMapa: {
//     flexDirection: "row",
//     gap: 10,
//     justifyContent: "center",
//     flexWrap: "wrap",
//   },
//   botaoControle: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 25,
//     gap: 8,
//   },
//   botaoCalcular: {
//     backgroundColor: "#2196F3",
//   },
//   botaoRedesenhar: {
//     backgroundColor: "#FF9800",
//   },
//   botaoLimpar: {
//     backgroundColor: "#FF5252",
//   },
//   textoBotaoControle: {
//     color: "#FFF",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   secaoInfo: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   cardInfo: {
//     flexDirection: "row",
//     backgroundColor: "#FFF",
//     borderRadius: 15,
//     padding: 20,
//     elevation: 3,
//   },
//   itemInfo: {
//     flex: 1,
//     alignItems: "center",
//     gap: 8,
//   },
//   valorInfo: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   rotuloInfo: {
//     fontSize: 12,
//     color: "#666",
//     textAlign: "center",
//   },
//   divisorInfo: {
//     width: 1,
//     backgroundColor: "#E0E0E0",
//   },
//   botoesAcao: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//     gap: 12,
//   },
//   botaoCancelar: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: "#E0E0E0",
//     alignItems: "center",
//   },
//   textoBotaoCancelar: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#666",
//   },
//   botaoSalvar: {
//     flex: 2,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   gradienteSalvar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     gap: 8,
//   },
//   textoBotaoSalvar: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   sugestoesOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   sugestoesContainer: {
//     backgroundColor: "#FFF",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "60%",
//     paddingTop: 16,
//   },
//   sugestoesContainerEscuro: {
//     backgroundColor: "#1E1E1E",
//   },
//   sugestoesHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   sugestoesTitulo: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   itemSugestao: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//     gap: 12,
//   },
//   itemSugestaoEscuro: {
//     borderBottomColor: "#333",
//     backgroundColor: "#1E1E1E",
//   },
//   textoSugestaoContainer: {
//     flex: 1,
//   },
//   tituloSugestao: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   subtituloSugestao: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   claro: {
//     container: { backgroundColor: "#F5F5F5" },
//     texto: { color: "#333" },
//     subTexto: { color: "#666" },
//   },
//   escuro: {
//     container: { backgroundColor: "#121212" },
//     texto: { color: "#FFF" },
//     subTexto: { color: "#CCC" },
//   },
// });

import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, ActivityIndicator, FlatList, SafeAreaView,
  Platform 
} from "react-native";
import { useAuth } from "../../context/AuthContext.js";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Polygon, Marker } from "react-native-maps";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const PHOTON_URL = "https://photon.komoot.io/api/";
let ultimaRequisicao = 0;

export default function TelaNovaPropriedade({ navigation }) {
  const { isDarkMode } = useContext(AppContext); 
  const { logout } = useAuth();

  const [userNome, setUserNome] = useState("");
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const mapRef = useRef(null);

  const [nomePropriedade, setNomePropriedade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [buscaManual, setBuscaManual] = useState("");
  const [sugestoesEndereco, setSugestoesEndereco] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [pontos, setPontos] = useState([]);
  const [areaCalculada, setAreaCalculada] = useState(null);
  const [carbonoEstimado, setCarbonoEstimado] = useState(null);
  const [desenhando, setDesenhando] = useState(true);

  const [anoAquisicao, setAnoAquisicao] = useState(null);
  const [mesAquisicao, setMesAquisicao] = useState(null);

  const [coordenadaAtual, setCoordenadaAtual] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

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

        console.log("📦 Token encontrado:", !!storedToken);
        console.log("📦 UserId:", storedUserId);
        console.log("📦 Nome:", storedNome);

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
          setUserNome(storedNome || "");
          console.log("✅ Dados do usuário carregados:", { userId: storedUserId, nome: storedNome });
        } else {
          console.log("⚠️ Nenhum token encontrado, redirecionando para login");
          Alert.alert("Sessão expirada", "Por favor, faça login novamente.");
          navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
      }
    };
    carregarDadosUsuario();
  }, [navigation]);

  // Buscar endereço usando Nominatim (compatível com Windows)
  const buscarEnderecoNominatim = useCallback(async (texto) => {
    try {
      const agora = Date.now();
      const tempoDecorrido = agora - ultimaRequisicao;
      
      // Delay maior para Windows (mais restritivo)
      const delay = Platform.OS === 'windows' || Platform.OS === 'web' ? 2000 : 1000;
      if (tempoDecorrido < delay) {
        await new Promise((resolve) => setTimeout(resolve, delay - tempoDecorrido));
      }

      // User-Agent mais completo para evitar bloqueio
      const userAgent = `CarbonTrackApp/1.0 (React Native; ${Platform.OS === 'web' ? 'Web' : 'Mobile'}) contato@carbontrack.com`;

      const response = await axios.get(NOMINATIM_URL, {
        params: {
          q: texto,
          format: "json",
          addressdetails: 1,
          limit: 10,
          countrycodes: "br",
          "accept-language": "pt-BR",
        },
        headers: { 
          "User-Agent": userAgent,
          "Accept": "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9"
        },
        timeout: 15000,
      });

      ultimaRequisicao = Date.now();
      
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      return [];
      
    } catch (error) {
      console.error("Erro Nominatim:", error.message);
      return null; // Retorna null para tentar fallback
    }
  }, []);

  // Buscar endereço usando Photon (fallback para Windows)
  const buscarEnderecoPhoton = useCallback(async (texto) => {
    try {
      const response = await axios.get(PHOTON_URL, {
        params: {
          q: texto,
          limit: 10,
          lang: "pt",
          country: "BR"
        },
        timeout: 10000,
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        // Converter formato Photon para formato Nominatim
        return response.data.features.map(feature => ({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          display_name: feature.properties.name || feature.properties.street || texto,
          name: feature.properties.name,
          city: feature.properties.city || feature.properties.state,
          state: feature.properties.state
        }));
      }
      return [];
      
    } catch (error) {
      console.error("Erro Photon:", error.message);
      return [];
    }
  }, []);

  // Buscar endereço principal (tenta Nominatim, depois fallback)
  const buscarEndereco = useCallback(async (texto) => {
    // Primeira tentativa: Nominatim
    let resultados = await buscarEnderecoNominatim(texto);
    
    // Se falhar ou não tiver resultados, tenta Photon (fallback)
    if (!resultados || resultados.length === 0) {
      console.log("Nominatim falhou, tentando Photon como fallback...");
      resultados = await buscarEnderecoPhoton(texto);
    }
    
    return resultados;
  }, [buscarEnderecoNominatim, buscarEnderecoPhoton]);

  const handleBuscarEndereco = useCallback(async () => {
    if (buscaManual.length < 3) {
      Alert.alert("Aviso", "Digite pelo menos 3 caracteres para buscar");
      return;
    }

    setBuscandoEndereco(true);
    setMostrarSugestoes(true);

    try {
      const resultados = await buscarEndereco(buscaManual);
      if (resultados.length === 0) {
        Alert.alert("Aviso", `Nenhum local encontrado para "${buscaManual}". Tente um termo mais específico.`);
        setMostrarSugestoes(false);
      } else {
        setSugestoesEndereco(resultados);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      Alert.alert("Erro", "Não foi possível buscar o local. Verifique sua conexão com a internet.");
      setMostrarSugestoes(false);
    } finally {
      setBuscandoEndereco(false);
    }
  }, [buscaManual, buscarEndereco]);

  const selecionarEndereco = useCallback((item) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    const nomeLocal = item.display_name?.split(",")[0] || item.name || buscaManual;
    const enderecoFormatado = item.display_name || `${item.city || ''}, ${item.state || ''}`;

    setEndereco(nomeLocal);
    setEnderecoCompleto(enderecoFormatado);
    setBuscaManual("");
    setSugestoesEndereco([]);
    setMostrarSugestoes(false);

    const novaRegiao = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setCoordenadaAtual(novaRegiao);
    mapRef.current?.animateToRegion(novaRegiao, 1000);
  }, [buscaManual]);

  const handleAdicionarPonto = useCallback(
    (event) => {
      if (!desenhando) return;
      const { coordinate } = event.nativeEvent;
      setPontos((prev) => [...prev, coordinate]);
    },
    [desenhando]
  );

  const pontosParaWKT = useCallback(() => {
    if (pontos.length < 3) return null;
    const pontosFechados = [...pontos, pontos[0]];
    const coordenadasStr = pontosFechados.map((p) => `${p.longitude} ${p.latitude}`).join(", ");
    return `POLYGON((${coordenadasStr}))`;
  }, [pontos]);

  const calcularAreaAproximada = (pontosLista) => {
    if (pontosLista.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < pontosLista.length; i++) {
      const j = (i + 1) % pontosLista.length;
      area += pontosLista[i].latitude * pontosLista[j].longitude;
      area -= pontosLista[j].latitude * pontosLista[i].longitude;
    }
    area = Math.abs(area) / 2;

    const areaKm2 = area * 111 * 111;
    const areaHectares = areaKm2 * 100;

    return Math.min(areaHectares, 10000);
  };

  const validarAnoMes = useCallback(() => {
    const anoAtual = new Date().getFullYear();

    if (!anoAquisicao) {
      Alert.alert("Erro", "Informe o ano de aquisição da propriedade");
      return false;
    }

    if (!mesAquisicao) {
      Alert.alert("Erro", "Informe o mês de aquisição da propriedade");
      return false;
    }

    if (anoAquisicao < 1900 || anoAquisicao > anoAtual) {
      Alert.alert("Erro", `Ano inválido. Use um valor entre 1900 e ${anoAtual}`);
      return false;
    }

    if (mesAquisicao < 1 || mesAquisicao > 12) {
      Alert.alert("Erro", "Mês inválido. Use um valor entre 1 e 12");
      return false;
    }

    return true;
  }, [anoAquisicao, mesAquisicao]);

  const handleCalcular = useCallback(() => {
    if (pontos.length < 3) {
      Alert.alert("Erro", "Desenhe pelo menos 3 pontos para formar um polígono");
      return;
    }

    if (!nomePropriedade.trim()) {
      Alert.alert("Erro", "Informe o nome da propriedade antes de calcular");
      return;
    }

    if (!endereco.trim()) {
      Alert.alert("Erro", "Selecione um endereço antes de calcular");
      return;
    }

    if (!validarAnoMes()) {
      return;
    }

    setCalculando(true);

    try {
      const area = calcularAreaAproximada(pontos);
      const anoAtual = new Date().getFullYear();
      const mesAtual = new Date().getMonth() + 1;

      let anosPosse = anoAtual - anoAquisicao;
      let mesesPosse = mesAtual - mesAquisicao;

      if (mesesPosse < 0) {
        anosPosse--;
        mesesPosse += 12;
      }

      const totalMeses = anosPosse * 12 + mesesPosse;
      const sequestroMensal = 0.5;
      const carbono = area * sequestroMensal * Math.max(totalMeses, 1);

      setAreaCalculada(area.toFixed(2));
      setCarbonoEstimado(carbono.toFixed(2));

      Alert.alert(
        "✅ Cálculo realizado!",
        `📐 Área estimada: ${area.toFixed(2)} hectares\n` +
          `📅 Tempo de posse: ${totalMeses} meses (${anosPosse} anos)\n` +
          `🌿 Carbono estimado: ${carbono.toFixed(2)} tCO₂\n\n` +
          `Clique em "Salvar Propriedade" para concluir o cadastro.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erro no cálculo:", error);
      Alert.alert("Erro", "Não foi possível calcular a área.");
    } finally {
      setCalculando(false);
    }
  }, [pontos, nomePropriedade, endereco, anoAquisicao, mesAquisicao, validarAnoMes]);

  const handleLimparPontos = useCallback(() => {
    Alert.alert("Limpar Polígono", "Deseja limpar todos os pontos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpar",
        style: "destructive",
        onPress: () => {
          setPontos([]);
          setAreaCalculada(null);
          setCarbonoEstimado(null);
          setDesenhando(true);
        },
      },
    ]);
  }, []);

  const handleDesfazerPonto = useCallback(() => {
    setPontos((prev) => prev.slice(0, -1));
  }, []);

  const centralizarBrasil = useCallback(() => {
    const novaRegiao = {
      latitude: -15.7801,
      longitude: -47.9292,
      latitudeDelta: 25,
      longitudeDelta: 25,
    };
    setCoordenadaAtual(novaRegiao);
    mapRef.current?.animateToRegion(novaRegiao, 1000);
  }, []);

  const handleSalvarPropriedade = useCallback(async () => {
    if (!nomePropriedade.trim()) {
      Alert.alert("Erro", "Informe o nome da propriedade");
      return;
    }
    if (!endereco.trim()) {
      Alert.alert("Erro", "Selecione um endereço");
      return;
    }
    if (pontos.length < 3) {
      Alert.alert("Erro", "Desenhe o polígono da propriedade");
      return;
    }
    if (!validarAnoMes()) {
      return;
    }
    if (!token || !userId) {
      Alert.alert("Erro de Autenticação", "Faça login novamente.");
      return;
    }

    setCarregando(true);

    const geometriaWkt = pontosParaWKT();

    const enderecoParts = (enderecoCompleto || endereco || "").split(",");
    const cidadeNome = enderecoParts[1]?.trim() || "Região";
    const estadoSigla = enderecoParts[2]?.trim()?.slice(0, 2).toUpperCase() || "BA";

    const payload = {
      nome: nomePropriedade.trim(),
      endereco: (enderecoCompleto || endereco || "").substring(0, 255),
      cidade: cidadeNome.substring(0, 50),
      estado: estadoSigla,
      cep: "00000000",
      usuarioId: userId,
      geometriaWkt: geometriaWkt,
      anoAquisicao: anoAquisicao,
      mesAquisicao: mesAquisicao,
    };

    console.log("📤 Salvando propriedade...");
    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`${API_BASE_URL}/propriedades`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      Alert.alert(
        "✅ Sucesso!",
        `Propriedade "${payload.nome}" cadastrada com sucesso!\n\n` +
          `📐 Área: ${(response.data?.areaHectares || areaCalculada || 0).toFixed(2)} hectares\n` +
          `🌿 Carbono: ${(response.data?.carbonoEstimado || carbonoEstimado || 0).toFixed(2)} tCO₂`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("❌ Erro ao salvar:", error.response?.data || error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert("Erro de Autenticação", "Sua sessão expirou. Faça login novamente.");
        await AsyncStorage.removeItem("@auth_token");
        navigation.reset({ index: 0, routes: [{ name: "TelaLogin" }] });
      } else if (error.response?.status === 400) {
        Alert.alert("Erro", "Dados inválidos. Verifique os campos preenchidos.");
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert("Erro", "Tempo limite excedido. Verifique sua conexão com a internet.");
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a propriedade. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }, [
    nomePropriedade,
    endereco,
    enderecoCompleto,
    pontos,
    userId,
    token,
    anoAquisicao,
    mesAquisicao,
    navigation,
    pontosParaWKT,
    areaCalculada,
    carbonoEstimado,
    validarAnoMes,
  ]);

  const renderSugestao = ({ item }) => (
    <TouchableOpacity 
      style={[styles.itemSugestao, isDarkMode && styles.itemSugestaoEscuro]} 
      onPress={() => selecionarEndereco(item)}
      activeOpacity={0.7}
    >
      <Feather name="map-pin" size={16} color="#4CAF50" />
      <View style={styles.textoSugestaoContainer}>
        <Text style={[styles.tituloSugestao, temaEstilos.texto]} numberOfLines={1}>
          {item.display_name?.split(",")[0] || item.name || "Local"}
        </Text>
        <Text style={[styles.subtituloSugestao, temaEstilos.subTexto]} numberOfLines={1}>
          {item.display_name?.split(",").slice(1, 4).join(",") || item.city || item.state || ""}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, temaEstilos.container]}>
      <LinearGradient
        colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]}
        style={styles.cabecalho}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.topoCabecalho}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.tituloCabecalho}>Nova Propriedade</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.conteudo} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Nome da Propriedade *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputEscuro]}
              placeholder="Ex: Fazenda Boa Vista"
              placeholderTextColor="#999"
              value={nomePropriedade}
              onChangeText={setNomePropriedade}
            />
          </View>

          <View style={styles.campo}>
            <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Buscar Endereço *</Text>
            <View style={styles.containerBusca}>
              <TextInput
                style={[styles.inputBusca, isDarkMode && styles.inputEscuro]}
                placeholder="Digite cidade, estado, rua..."
                placeholderTextColor="#999"
                value={buscaManual}
                onChangeText={setBuscaManual}
                onSubmitEditing={handleBuscarEndereco}
              />
              <TouchableOpacity 
                style={styles.botaoBuscar} 
                onPress={handleBuscarEndereco} 
                disabled={buscandoEndereco}
              >
                {buscandoEndereco ? 
                  <ActivityIndicator size="small" color="#FFF" /> : 
                  <Feather name="search" size={22} color="#FFF" />
                }
              </TouchableOpacity>
            </View>
            {endereco !== "" && (
              <View style={styles.enderecoSelecionado}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <Text style={[styles.textoEnderecoSelecionado, temaEstilos.subTexto]}>
                  {enderecoCompleto || endereco}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.linhaCampos}>
            <View style={[styles.campo, styles.campoMetade]}>
              <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Ano de Aquisição *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputEscuro]}
                placeholder="Ex: 2020"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={anoAquisicao?.toString() || ""}
                onChangeText={(text) => setAnoAquisicao(text ? parseInt(text) : null)}
              />
            </View>

            <View style={[styles.campo, styles.campoMetade]}>
              <Text style={[styles.rotuloCampo, temaEstilos.texto]}>Mês de Aquisição *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputEscuro]}
                placeholder="Ex: 5"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={mesAquisicao?.toString() || ""}
                onChangeText={(text) => {
                  const val = text ? parseInt(text) : null;
                  setMesAquisicao(val ? Math.min(12, Math.max(1, val)) : null);
                }}
              />
            </View>
          </View>

          <View style={styles.botoesNavegacao}>
            <TouchableOpacity style={styles.botaoNavegacao} onPress={centralizarBrasil}>
              <Feather name="map" size={18} color="#4CAF50" />
              <Text style={styles.textoBotaoNavegacao}>Centralizar Brasil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.secaoMapa}>
          <Text style={[styles.tituloSecao, temaEstilos.texto]}>Desenhe o Polígono</Text>
          <Text style={[styles.subtituloSecao, temaEstilos.subTexto]}>
            {desenhando && pontos.length === 0 && "📍 Toque no mapa para adicionar vértices"}
            {desenhando && pontos.length > 0 && `✏️ ${pontos.length} ponto(s) adicionados`}
            {!desenhando && "✅ Polígono finalizado!"}
          </Text>

          <View style={styles.containerMapa}>
            <MapView 
              ref={mapRef} 
              style={styles.mapa} 
              region={coordenadaAtual} 
              onPress={handleAdicionarPonto} 
              zoomControlEnabled={true}
            >
              {pontos.map((ponto, index) => (
                <Marker 
                  key={index} 
                  coordinate={ponto} 
                  title={`Ponto ${index + 1}`} 
                  pinColor="#4CAF50" 
                />
              ))}
              {pontos.length >= 3 && (
                <Polygon 
                  coordinates={pontos} 
                  fillColor="rgba(76, 175, 80, 0.3)" 
                  strokeColor="#4CAF50" 
                  strokeWidth={2} 
                />
              )}
            </MapView>
          </View>

          <View style={styles.controlesMapa}>
            {desenhando && pontos.length > 0 && (
              <TouchableOpacity style={styles.botaoControle} onPress={handleDesfazerPonto}>
                <Feather name="corner-up-left" size={18} color="#FFF" />
                <Text style={styles.textoBotaoControle}>Desfazer</Text>
              </TouchableOpacity>
            )}
            {desenhando && pontos.length >= 3 && (
              <TouchableOpacity 
                style={[styles.botaoControle, styles.botaoCalcular]} 
                onPress={handleCalcular} 
                disabled={!anoAquisicao || !mesAquisicao}
              >
                {calculando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="activity" size={18} color="#FFF" />
                    <Text style={styles.textoBotaoControle}>Calcular</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {!desenhando && (
              <TouchableOpacity style={[styles.botaoControle, styles.botaoRedesenhar]} onPress={handleLimparPontos}>
                <Feather name="refresh-cw" size={18} color="#FFF" />
                <Text style={styles.textoBotaoControle}>Redesenhar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.botaoControle, styles.botaoLimpar]} onPress={handleLimparPontos}>
              <Feather name="trash-2" size={18} color="#FFF" />
              <Text style={styles.textoBotaoControle}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(areaCalculada || carbonoEstimado) && (
          <View style={styles.secaoInfo}>
            <Text style={[styles.tituloSecao, temaEstilos.texto]}>🌱 Informações Calculadas</Text>
            <View style={styles.cardInfo}>
              <View style={styles.itemInfo}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#4CAF50" />
                <Text style={[styles.valorInfo, temaEstilos.texto]}>{areaCalculada} ha</Text>
                <Text style={styles.rotuloInfo}>Área Estimada</Text>
              </View>
              <View style={styles.divisorInfo} />
              <View style={styles.itemInfo}>
                <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
                <Text style={[styles.valorInfo, temaEstilos.texto]}>{carbonoEstimado} tCO₂</Text>
                <Text style={styles.rotuloInfo}>Carbono Estimado</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.botoesAcao}>
          <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={handleSalvarPropriedade}
            disabled={carregando || pontos.length < 3 || !nomePropriedade || !endereco || !token || !userId || !anoAquisicao || !mesAquisicao}
          >
            <LinearGradient 
              colors={carregando || !anoAquisicao || !mesAquisicao ? ["#999", "#666"] : ["#4CAF50", "#2D5A27"]} 
              style={styles.gradienteSalvar}
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="save" size={20} color="#FFF" />
                  <Text style={styles.textoBotaoSalvar}>Salvar Propriedade</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {mostrarSugestoes && sugestoesEndereco.length > 0 && (
        <View style={styles.sugestoesOverlay}>
          <View style={[styles.sugestoesContainer, isDarkMode && styles.sugestoesContainerEscuro]}>
            <View style={styles.sugestoesHeader}>
              <Text style={[styles.sugestoesTitulo, temaEstilos.texto]}>📍 Locais ({sugestoesEndereco.length})</Text>
              <TouchableOpacity onPress={() => setMostrarSugestoes(false)}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <FlatList 
              data={sugestoesEndereco} 
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`} 
              renderItem={renderSugestao}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cabecalho: {
    paddingTop: 35,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  tituloCabecalho: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  conteudo: {
    flex: 1,
  },
  formulario: {
    padding: 20,
  },
  campo: {
    marginBottom: 20,
  },
  rotuloCampo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputEscuro: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderColor: "#333",
  },
  containerBusca: {
    flexDirection: "row",
    gap: 10,
  },
  inputBusca: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  botaoBuscar: {
    width: 50,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  enderecoSelecionado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
    padding: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  textoEnderecoSelecionado: {
    flex: 1,
    fontSize: 12,
  },
  linhaCampos: {
    flexDirection: "row",
    gap: 15,
  },
  campoMetade: {
    flex: 1,
  },
  botoesNavegacao: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  botaoNavegacao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  textoBotaoNavegacao: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  secaoMapa: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtituloSecao: {
    fontSize: 12,
    marginBottom: 15,
  },
  containerMapa: {
    height: 400,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  mapa: {
    flex: 1,
  },
  controlesMapa: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  botaoControle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  botaoCalcular: {
    backgroundColor: "#2196F3",
  },
  botaoRedesenhar: {
    backgroundColor: "#FF9800",
  },
  botaoLimpar: {
    backgroundColor: "#FF5252",
  },
  textoBotaoControle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secaoInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardInfo: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  valorInfo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rotuloInfo: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  divisorInfo: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  botoesAcao: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  textoBotaoCancelar: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  botaoSalvar: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradienteSalvar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sugestoesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sugestoesContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingTop: 16,
  },
  sugestoesContainerEscuro: {
    backgroundColor: "#1E1E1E",
  },
  sugestoesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sugestoesTitulo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemSugestao: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  itemSugestaoEscuro: {
    borderBottomColor: "#333",
    backgroundColor: "#1E1E1E",
  },
  textoSugestaoContainer: {
    flex: 1,
  },
  tituloSugestao: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtituloSugestao: {
    fontSize: 12,
    marginTop: 2,
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
});