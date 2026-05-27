// import React, { useContext, useState, useCallback, useRef } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { AppContext } from "../../context/AppProvider";
// import { LinearGradient } from "expo-linear-gradient";
// import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
// import MapView, { Polygon, Marker } from "react-native-maps";
// import axios from "axios";

// // API Nominatim (OpenStreetMap)
// const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// let timeoutId;
// let ultimaRequisicao = 0;

// export default function TelaNovaPropriedade({ navigation }) {
//   const { user, isDarkMode } = useContext(AppContext);
//   const [carregando, setCarregando] = useState(false);
//   const [calculando, setCalculando] = useState(false);
//   const [buscandoEndereco, setBuscandoEndereco] = useState(false);
//   const mapRef = useRef(null);

//   // Estados do formulário
//   const [nomePropriedade, setNomePropriedade] = useState("");
//   const [endereco, setEndereco] = useState("");
//   const [enderecoCompleto, setEnderecoCompleto] = useState("");
//   const [buscaManual, setBuscaManual] = useState("");
//   const [sugestoesEndereco, setSugestoesEndereco] = useState([]);
//   const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
//   const [pontos, setPontos] = useState([]);
//   const [areaCalculada, setAreaCalculada] = useState(null);
//   const [carbonoSequestrado, setCarbonoSequestrado] = useState(null);
//   const [desenhando, setDesenhando] = useState(true);
//   const [coordenadaSelecionada, setCoordenadaSelecionada] = useState(null);
//   const [coordenadaAtual, setCoordenadaAtual] = useState({
//     latitude: -23.5505,
//     longitude: -46.6333,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

//   // Buscar endereço usando Nominatim
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
//         headers: {
//           "User-Agent": "CarbonTrackApp/1.0",
//         },
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

//   // Buscar endereço
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

//   // Selecionar endereço
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

//     const novaRegiao = {
//       latitude,
//       longitude,
//       latitudeDelta: 0.02,
//       longitudeDelta: 0.02,
//     };

//     setCoordenadaAtual(novaRegiao);

//     if (mapRef.current) {
//       mapRef.current.animateToRegion(novaRegiao, 1000);
//     }

//     Alert.alert("Localização Encontrada", `Mapa navegou para: ${nomeLocal}`);
//   }, []);

//   // Adicionar ponto ao polígono
//   const handleAdicionarPonto = useCallback(
//     (event) => {
//       if (!desenhando) return;
//       const { coordinate } = event.nativeEvent;
//       setPontos((prev) => [...prev, coordinate]);
//       setCoordenadaSelecionada(coordinate);
//     },
//     [desenhando]
//   );

//   // Finalizar desenho do polígono
//   const handleFinalizarDesenho = useCallback(() => {
//     if (pontos.length < 3) {
//       Alert.alert("Erro", "Desenhe pelo menos 3 pontos para formar um polígono");
//       return;
//     }

//     setCalculando(true);

//     // Calcular área aproximada
//     const pontosFechados = [...pontos, pontos[0]];
//     let area = 0;
//     for (let i = 0; i < pontosFechados.length - 1; i++) {
//       area += pontosFechados[i].longitude * pontosFechados[i + 1].latitude;
//       area -= pontosFechados[i].latitude * pontosFechados[i + 1].longitude;
//     }
//     area = Math.abs(area) / 2;
//     const areaHectares = area * 10000;

//     setAreaCalculada(areaHectares.toFixed(2));
//     setCarbonoSequestrado((areaHectares * 0.5).toFixed(2));
//     setDesenhando(false);
//     setCalculando(false);

//     Alert.alert("Polígono Finalizado", `Área: ${areaHectares.toFixed(2)} hectares\nCarbono estimado: ${(areaHectares * 0.5).toFixed(2)} tCO₂/ano`, [
//       { text: "OK" },
//     ]);
//   }, [pontos]);

//   // Limpar todos os pontos
//   const handleLimparPontos = useCallback(() => {
//     Alert.alert("Limpar Polígono", "Tem certeza que deseja limpar todos os pontos?", [
//       { text: "Cancelar", style: "cancel" },
//       {
//         text: "Limpar",
//         style: "destructive",
//         onPress: () => {
//           setPontos([]);
//           setAreaCalculada(null);
//           setCarbonoSequestrado(null);
//           setDesenhando(true);
//         },
//       },
//     ]);
//   }, []);

//   // Desfazer último ponto
//   const handleDesfazerPonto = useCallback(() => {
//     setPontos((prev) => prev.slice(0, -1));
//   }, []);

//   // Centralizar Brasil
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

//   // Salvar propriedade - Preparar JSON no formato correto
//   const handleSalvarPropriedade = useCallback(async () => {
//     // Validações
//     if (!nomePropriedade.trim()) {
//       Alert.alert("Erro", "Informe o nome da propriedade");
//       return;
//     }
//     if (!endereco.trim()) {
//       Alert.alert("Erro", "Selecione um endereço");
//       return;
//     }
//     if (pontos.length < 3) {
//       Alert.alert("Erro", "Desenhe o polígono da propriedade no mapa");
//       return;
//     }

//     setCarregando(true);

//     // Preparar geometria no formato correto: [longitude, latitude]
//     const pontosFechados = [...pontos, pontos[0]];
//     const coordenadas = pontosFechados.map((ponto) => [ponto.longitude, ponto.latitude]);

//     // Criar payload no formato exato solicitado
//     const payload = {
//       nomePropriedade: nomePropriedade.trim(),
//       endereco: enderecoCompleto || endereco.trim(),
//       usuarioId: user?.id || 1,
//       geometria: {
//         type: "Polygon",
//         coordinates: [coordenadas],
//       },
//     };

//     console.log("📦 Payload sendo enviado:", JSON.stringify(payload, null, 2));

//     try {
//       // Descomente para enviar para API real
//       // const response = await axios.post("http://localhost:8080/api/propriedades", payload);

//       // Simulação de envio
//       await new Promise((resolve) => setTimeout(resolve, 1500));

//       Alert.alert(
//         "✅ Sucesso!",
//         `Propriedade "${nomePropriedade}" cadastrada com sucesso!\n\n` +
//           `📍 Endereço: ${endereco}\n` +
//           `🌳 Área: ${areaCalculada} hectares\n` +
//           `🌿 Carbono anual: ${carbonoSequestrado} tCO₂\n\n` +
//           `Dados enviados para o servidor.`,
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               // Limpar formulário e voltar
//               navigation.goBack();
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Erro ao salvar:", error);
//       Alert.alert("Erro", "Não foi possível cadastrar a propriedade. Tente novamente.");
//     } finally {
//       setCarregando(false);
//     }
//   }, [nomePropriedade, endereco, enderecoCompleto, pontos, user, areaCalculada, carbonoSequestrado, navigation]);

//   // Renderizar sugestão
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
//       <LinearGradient colors={isDarkMode ? ["#1a472a", "#0d2818"] : ["#2D5A27", "#4CAF50"]} style={styles.cabecalho}>
//         <View style={styles.topoCabecalho}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
//             <Feather name="arrow-left" size={24} color="#FFF" />
//           </TouchableOpacity>
//           <Text style={styles.tituloCabecalho}>Nova Propriedade</Text>
//           <View style={{ width: 40 }} />
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.conteudo} keyboardShouldPersistTaps="handled">
//         {/* Formulário */}
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

//           <View style={styles.botoesNavegacao}>
//             <TouchableOpacity style={styles.botaoNavegacao} onPress={centralizarBrasil}>
//               <Feather name="map" size={18} color="#4CAF50" />
//               <Text style={styles.textoBotaoNavegacao}>Centralizar Brasil</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Área do Mapa */}
//         <View style={styles.secaoMapa}>
//           <Text style={[styles.tituloSecao, temaEstilos.texto]}>Desenhe o Polígono da Propriedade</Text>
//           <Text style={[styles.subtituloSecao, temaEstilos.subTexto]}>
//             {desenhando && pontos.length === 0 && "📍 Toque no mapa para adicionar os vértices"}
//             {desenhando && pontos.length > 0 && `✏️ ${pontos.length} ponto(s) adicionados`}
//             {!desenhando && "✅ Polígono finalizado!"}
//           </Text>

//           <View style={styles.containerMapa}>
//             <MapView
//               ref={mapRef}
//               style={styles.mapa}
//               region={coordenadaAtual}
//               onPress={handleAdicionarPonto}
//               zoomControlEnabled={true}
//               zoomEnabled={true}
//               scrollEnabled={true}
//             >
//               {/* Renderizar pontos */}
//               {pontos.map((ponto, index) => (
//                 <Marker
//                   key={index}
//                   coordinate={ponto}
//                   title={`Ponto ${index + 1}`}
//                   description={`Lat: ${ponto.latitude.toFixed(6)}, Lon: ${ponto.longitude.toFixed(6)}`}
//                   pinColor="#4CAF50"
//                 />
//               ))}

//               {/* Renderizar polígono */}
//               {pontos.length >= 3 && <Polygon coordinates={pontos} fillColor="rgba(76, 175, 80, 0.3)" strokeColor="#4CAF50" strokeWidth={2} />}
//             </MapView>
//           </View>

//           {/* Controles do Mapa */}
//           <View style={styles.controlesMapa}>
//             {desenhando && pontos.length > 0 && (
//               <TouchableOpacity style={styles.botaoControle} onPress={handleDesfazerPonto}>
//                 <Feather name="corner-up-left" size={18} color="#FFF" />
//                 <Text style={styles.textoBotaoControle}>Desfazer</Text>
//               </TouchableOpacity>
//             )}

//             {desenhando && pontos.length >= 3 && (
//               <TouchableOpacity style={[styles.botaoControle, styles.botaoFinalizar]} onPress={handleFinalizarDesenho}>
//                 {calculando ? (
//                   <ActivityIndicator size="small" color="#FFF" />
//                 ) : (
//                   <>
//                     <Feather name="check" size={18} color="#FFF" />
//                     <Text style={styles.textoBotaoControle}>Finalizar</Text>
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

//         {/* Informações da Área */}
//         {(areaCalculada || carbonoSequestrado) && (
//           <View style={styles.secaoInfo}>
//             <Text style={[styles.tituloSecao, temaEstilos.texto]}>🌱 Informações Ambientais</Text>
//             <View style={styles.cardInfo}>
//               <View style={styles.itemInfo}>
//                 <MaterialCommunityIcons name="map-marker-radius" size={24} color="#4CAF50" />
//                 <Text style={[styles.valorInfo, temaEstilos.texto]}>{areaCalculada} ha</Text>
//                 <Text style={styles.rotuloInfo}>Área Total</Text>
//               </View>
//               <View style={styles.divisorInfo} />
//               <View style={styles.itemInfo}>
//                 <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
//                 <Text style={[styles.valorInfo, temaEstilos.texto]}>{carbonoSequestrado} tCO₂</Text>
//                 <Text style={styles.rotuloInfo}>Sequestro anual</Text>
//               </View>
//             </View>
//           </View>
//         )}

//         {/* Botão Salvar */}
//         <View style={styles.botoesAcao}>
//           <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
//             <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.botaoSalvar}
//             onPress={handleSalvarPropriedade}
//             disabled={carregando || pontos.length < 3 || !nomePropriedade || !endereco}
//           >
//             <LinearGradient
//               colors={carregando ? ["#999", "#666"] : ["#4CAF50", "#2D5A27"]}
//               style={styles.gradienteSalvar}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//             >
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

//       {/* Modal de Sugestões */}
//       {mostrarSugestoes && sugestoesEndereco.length > 0 && (
//         <View style={styles.sugestoesOverlay}>
//           <View style={styles.sugestoesContainer}>
//             <View style={styles.sugestoesHeader}>
//               <Text style={[styles.sugestoesTitulo, temaEstilos.texto]}>📍 Locais encontrados ({sugestoesEndereco.length})</Text>
//               <TouchableOpacity onPress={() => setMostrarSugestoes(false)}>
//                 <Feather name="x" size={20} color="#999" />
//               </TouchableOpacity>
//             </View>
//             <FlatList
//               data={sugestoesEndereco}
//               keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
//               renderItem={renderSugestao}
//               showsVerticalScrollIndicator={true}
//             />
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   cabecalho: {
//     paddingTop: 20,
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
//   tituloCabecalho: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
//   conteudo: { flex: 1 },
//   formulario: { padding: 20 },
//   campo: { marginBottom: 20 },
//   rotuloCampo: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
//   input: {
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     padding: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   inputEscuro: { backgroundColor: "#1E1E1E", color: "#FFF", borderColor: "#333" },
//   containerBusca: { flexDirection: "row", gap: 10 },
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
//   textoEnderecoSelecionado: { flex: 1, fontSize: 12 },
//   botoesNavegacao: { flexDirection: "row", gap: 10, marginTop: 5 },
//   botaoNavegacao: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#E8F5E9",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     gap: 5,
//   },
//   textoBotaoNavegacao: { fontSize: 12, color: "#4CAF50", fontWeight: "500" },
//   secaoMapa: { paddingHorizontal: 20, marginBottom: 20 },
//   tituloSecao: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
//   subtituloSecao: { fontSize: 12, marginBottom: 15 },
//   containerMapa: {
//     height: 400,
//     borderRadius: 15,
//     overflow: "hidden",
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   mapa: { flex: 1 },
//   controlesMapa: { flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
//   botaoControle: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 25,
//     gap: 8,
//   },
//   botaoFinalizar: { backgroundColor: "#2196F3" },
//   botaoRedesenhar: { backgroundColor: "#FF9800" },
//   botaoLimpar: { backgroundColor: "#FF5252" },
//   textoBotaoControle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
//   secaoInfo: { paddingHorizontal: 20, marginBottom: 20 },
//   cardInfo: {
//     flexDirection: "row",
//     backgroundColor: "#FFF",
//     borderRadius: 15,
//     padding: 20,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   itemInfo: { flex: 1, alignItems: "center", gap: 8 },
//   valorInfo: { fontSize: 20, fontWeight: "bold" },
//   rotuloInfo: { fontSize: 12, color: "#666", textAlign: "center" },
//   divisorInfo: { width: 1, backgroundColor: "#E0E0E0" },
//   botoesAcao: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//     gap: 12,
//     marginBottom: 20,
//   },
//   botaoCancelar: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: "#E0E0E0",
//     alignItems: "center",
//   },
//   textoBotaoCancelar: { fontSize: 16, fontWeight: "600", color: "#666" },
//   botaoSalvar: { flex: 2, borderRadius: 12, overflow: "hidden" },
//   gradienteSalvar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     gap: 8,
//   },
//   textoBotaoSalvar: { color: "#FFF", fontSize: 16, fontWeight: "600" },

//   // Modal de sugestões
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
//   sugestoesContainerEscuro: { backgroundColor: "#1E1E1E" },
//   sugestoesHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   sugestoesTitulo: { fontSize: 18, fontWeight: "bold" },
//   itemSugestao: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//     gap: 12,
//   },
//   itemSugestaoEscuro: { borderBottomColor: "#333", backgroundColor: "#1E1E1E" },
//   textoSugestaoContainer: { flex: 1 },
//   tituloSugestao: { fontSize: 16, fontWeight: "500" },
//   subtituloSugestao: { fontSize: 12, marginTop: 2 },

//   claro: { container: { backgroundColor: "#F5F5F5" }, texto: { color: "#333" }, subTexto: { color: "#666" } },
//   escuro: { container: { backgroundColor: "#121212" }, texto: { color: "#FFF" }, subTexto: { color: "#CCC" } },
// });
// TelaNovaPropriedade.js - Com salvamento no AsyncStorage
import React, { useContext, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../context/AppProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Polygon, Marker } from "react-native-maps";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Nominatim (OpenStreetMap)
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

let ultimaRequisicao = 0;

export default function TelaNovaPropriedade({ navigation }) {
  const { user, isDarkMode } = useContext(AppContext);
  const [carregando, setCarregando] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const mapRef = useRef(null);

  // Estados do formulário
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [buscaManual, setBuscaManual] = useState("");
  const [sugestoesEndereco, setSugestoesEndereco] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [pontos, setPontos] = useState([]);
  const [areaCalculada, setAreaCalculada] = useState(null);
  const [carbonoSequestrado, setCarbonoSequestrado] = useState(null);
  const [desenhando, setDesenhando] = useState(true);
  const [coordenadaAtual, setCoordenadaAtual] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const temaEstilos = isDarkMode ? styles.escuro : styles.claro;

  // Buscar endereço usando Nominatim
  const buscarEnderecoNominatim = useCallback(async (texto) => {
    try {
      const agora = Date.now();
      const tempoDecorrido = agora - ultimaRequisicao;
      if (tempoDecorrido < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - tempoDecorrido));
      }
      
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
          "User-Agent": "CarbonTrackApp/1.0",
        },
        timeout: 10000,
      });
      
      ultimaRequisicao = Date.now();
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        Alert.alert("Aviso", "Muitas buscas. Aguarde alguns segundos.");
      }
      return [];
    }
  }, []);

  // Buscar endereço
  const handleBuscarEndereco = useCallback(async () => {
    if (buscaManual.length < 3) {
      Alert.alert("Aviso", "Digite pelo menos 3 caracteres para buscar");
      return;
    }

    setBuscandoEndereco(true);
    setMostrarSugestoes(true);
    
    try {
      const resultados = await buscarEnderecoNominatim(buscaManual);
      
      if (resultados.length === 0) {
        Alert.alert("Aviso", `Nenhum local encontrado para "${buscaManual}"`);
        setMostrarSugestoes(false);
      } else {
        setSugestoesEndereco(resultados);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível buscar o local.");
    } finally {
      setBuscandoEndereco(false);
    }
  }, [buscaManual, buscarEnderecoNominatim]);

  // Selecionar endereço
  const selecionarEndereco = useCallback((item) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    const nomeLocal = item.display_name.split(',')[0];
    const enderecoFormatado = item.display_name;
    
    setEndereco(nomeLocal);
    setEnderecoCompleto(enderecoFormatado);
    setBuscaManual("");
    setSugestoesEndereco([]);
    setMostrarSugestoes(false);
    
    const novaRegiao = {
      latitude,
      longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    
    setCoordenadaAtual(novaRegiao);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(novaRegiao, 1000);
    }
    
    Alert.alert("Localização Encontrada", `Mapa navegou para: ${nomeLocal}`);
  }, []);

  // Adicionar ponto ao polígono
  const handleAdicionarPonto = useCallback((event) => {
    if (!desenhando) return;
    const { coordinate } = event.nativeEvent;
    setPontos((prev) => [...prev, coordinate]);
  }, [desenhando]);

  // Finalizar desenho do polígono
  const handleFinalizarDesenho = useCallback(() => {
    if (pontos.length < 3) {
      Alert.alert("Erro", "Desenhe pelo menos 3 pontos para formar um polígono");
      return;
    }

    setCalculando(true);
    
    const pontosFechados = [...pontos, pontos[0]];
    let area = 0;
    for (let i = 0; i < pontosFechados.length - 1; i++) {
      area += pontosFechados[i].longitude * pontosFechados[i + 1].latitude;
      area -= pontosFechados[i].latitude * pontosFechados[i + 1].longitude;
    }
    area = Math.abs(area) / 2;
    const areaHectares = area * 10000;
    
    setAreaCalculada(areaHectares.toFixed(2));
    setCarbonoSequestrado((areaHectares * 0.5).toFixed(2));
    setDesenhando(false);
    setCalculando(false);
    
    Alert.alert(
      "Polígono Finalizado",
      `Área: ${areaHectares.toFixed(2)} hectares\nCarbono estimado: ${(areaHectares * 0.5).toFixed(2)} tCO₂/ano`,
      [{ text: "OK" }]
    );
  }, [pontos]);

  // Limpar todos os pontos
  const handleLimparPontos = useCallback(() => {
    Alert.alert(
      "Limpar Polígono",
      "Tem certeza que deseja limpar todos os pontos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            setPontos([]);
            setAreaCalculada(null);
            setCarbonoSequestrado(null);
            setDesenhando(true);
          },
        },
      ]
    );
  }, []);

  // Desfazer último ponto
  const handleDesfazerPonto = useCallback(() => {
    setPontos((prev) => prev.slice(0, -1));
  }, []);

  // Centralizar Brasil
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

  // Salvar no AsyncStorage
  const salvarNoStorage = async (propriedade) => {
    try {
      // Recuperar propriedades existentes
      const propriedadesExistentesJson = await AsyncStorage.getItem("@CarbonTrack:propriedades");
      let propriedades = [];
      
      if (propriedadesExistentesJson) {
        propriedades = JSON.parse(propriedadesExistentesJson);
      }
      
      // Adicionar nova propriedade com ID e timestamp
      const novaPropriedade = {
        id: Date.now(),
        ...propriedade,
        dataCriacao: new Date().toISOString(),
      };
      
      propriedades.push(novaPropriedade);
      
      // Salvar de volta no storage
      await AsyncStorage.setItem("@CarbonTrack:propriedades", JSON.stringify(propriedades));
      
      console.log("\n📀 ========== PROPRIEDADE SALVA NO STORAGE ==========");
      console.log("📌 ID:", novaPropriedade.id);
      console.log("📌 Nome:", novaPropriedade.nomePropriedade);
      console.log("📌 Endereço:", novaPropriedade.endereco);
      console.log("📌 Usuário ID:", novaPropriedade.usuarioId);
      console.log("📌 Área:", novaPropriedade.areaCalculada, "hectares");
      console.log("📌 Carbono:", novaPropriedade.carbonoSequestrado, "tCO₂/ano");
      console.log("📌 Data:", novaPropriedade.dataCriacao);
      console.log("📌 Geometria:", JSON.stringify(novaPropriedade.geometria, null, 2));
      console.log("📌 Total de propriedades salvas:", propriedades.length);
      console.log("==================================================\n");
      
      return propriedades;
    } catch (error) {
      console.error("❌ Erro ao salvar no storage:", error);
      throw error;
    }
  };

  // Salvar propriedade
  const handleSalvarPropriedade = useCallback(async () => {
    // Validações
    if (!nomePropriedade.trim()) {
      Alert.alert("Erro", "Informe o nome da propriedade");
      return;
    }
    if (!endereco.trim()) {
      Alert.alert("Erro", "Selecione um endereço");
      return;
    }
    if (pontos.length < 3) {
      Alert.alert("Erro", "Desenhe o polígono da propriedade no mapa");
      return;
    }

    setCarregando(true);

    // Preparar geometria no formato correto: [longitude, latitude]
    const pontosFechados = [...pontos, pontos[0]];
    const coordenadas = pontosFechados.map(ponto => [ponto.longitude, ponto.latitude]);

    // Criar payload no formato exato solicitado
    const payload = {
      nomePropriedade: nomePropriedade.trim(),
      endereco: enderecoCompleto || endereco.trim(),
      usuarioId: user?.id || 1,
      areaCalculada: areaCalculada,
      carbonoSequestrado: carbonoSequestrado,
      geometria: {
        type: "Polygon",
        coordinates: [coordenadas],
      },
    };

    console.log("\n📦 ========== PREPARANDO ENVIO ==========");
    console.log("📤 Payload sendo enviado:", JSON.stringify(payload, null, 2));
    console.log("========================================\n");

    try {
      // 1. Salvar no AsyncStorage
      const propriedadesAtualizadas = await salvarNoStorage(payload);
      
      // 2. Simular envio para API (descomente quando tiver backend)
      // const response = await axios.post("http://localhost:8080/api/propriedades", payload);
      
      // Mostrar resumo no terminal
      console.log("\n✅ ========== RESUMO DA OPERAÇÃO ==========");
      console.log(`✅ Propriedade "${payload.nomePropriedade}" salva com sucesso!`);
      console.log(`📍 Endereço: ${payload.endereco}`);
      console.log(`🌳 Área: ${payload.areaCalculada} hectares`);
      console.log(`🌿 Carbono anual: ${payload.carbonoSequestrado} tCO₂`);
      console.log(`🔢 Total de propriedades no storage: ${propriedadesAtualizadas.length}`);
      console.log("==========================================\n");
      
      Alert.alert(
        "✅ Sucesso!",
        `Propriedade "${payload.nomePropriedade}" cadastrada com sucesso!\n\n` +
        `📍 Endereço: ${endereco}\n` +
        `🌳 Área: ${areaCalculada} hectares\n` +
        `🌿 Carbono anual: ${carbonoSequestrado} tCO₂\n\n` +
        `✅ Dados salvos localmente!\n` +
        `📦 Verifique o terminal para mais detalhes.`,
        [
          { 
            text: "OK", 
            onPress: () => {
              navigation.goBack();
            } 
          }
        ]
      );
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível cadastrar a propriedade. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [nomePropriedade, endereco, enderecoCompleto, pontos, user, areaCalculada, carbonoSequestrado, navigation]);

  // Função para listar todas as propriedades salvas (debug)
  const listarPropriedadesSalvas = async () => {
    try {
      const propriedadesJson = await AsyncStorage.getItem("@CarbonTrack:propriedades");
      const propriedades = propriedadesJson ? JSON.parse(propriedadesJson) : [];
      
      console.log("\n📋 ========== PROPRIEDADES SALVAS ==========");
      console.log(`📊 Total: ${propriedades.length} propriedade(s)`);
      propriedades.forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.nomePropriedade}`);
        console.log(`   ID: ${prop.id}`);
        console.log(`   Endereço: ${prop.endereco}`);
        console.log(`   Área: ${prop.areaCalculada} ha`);
        console.log(`   Carbono: ${prop.carbonoSequestrado} tCO₂`);
        console.log(`   Data: ${prop.dataCriacao}`);
      });
      console.log("==========================================\n");
      
      return propriedades;
    } catch (error) {
      console.error("Erro ao listar:", error);
      return [];
    }
  };

  // Renderizar sugestão
  const renderSugestao = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemSugestao, isDarkMode && styles.itemSugestaoEscuro]}
      onPress={() => selecionarEndereco(item)}
    >
      <Feather name="map-pin" size={16} color="#4CAF50" />
      <View style={styles.textoSugestaoContainer}>
        <Text style={[styles.tituloSugestao, temaEstilos.texto]} numberOfLines={1}>
          {item.display_name.split(',')[0]}
        </Text>
        <Text style={[styles.subtituloSugestao, temaEstilos.subTexto]} numberOfLines={1}>
          {item.display_name.split(',').slice(1, 4).join(',')}
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
      >
        <View style={styles.topoCabecalho}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.tituloCabecalho}>Nova Propriedade</Text>
          <TouchableOpacity onPress={listarPropriedadesSalvas} style={styles.botaoListar}>
            <Feather name="list" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.conteudo}
        keyboardShouldPersistTaps="handled"
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
                {buscandoEndereco ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather name="search" size={22} color="#FFF" />
                )}
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

          <View style={styles.botoesNavegacao}>
            <TouchableOpacity style={styles.botaoNavegacao} onPress={centralizarBrasil}>
              <Feather name="map" size={18} color="#4CAF50" />
              <Text style={styles.textoBotaoNavegacao}>Centralizar Brasil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.secaoMapa}>
          <Text style={[styles.tituloSecao, temaEstilos.texto]}>
            Desenhe o Polígono da Propriedade
          </Text>
          <Text style={[styles.subtituloSecao, temaEstilos.subTexto]}>
            {desenhando && pontos.length === 0 && "📍 Toque no mapa para adicionar os vértices"}
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
              zoomEnabled={true}
              scrollEnabled={true}
            >
              {pontos.map((ponto, index) => (
                <Marker
                  key={index}
                  coordinate={ponto}
                  title={`Ponto ${index + 1}`}
                  description={`Lat: ${ponto.latitude.toFixed(6)}, Lon: ${ponto.longitude.toFixed(6)}`}
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
              <TouchableOpacity style={[styles.botaoControle, styles.botaoFinalizar]} onPress={handleFinalizarDesenho}>
                {calculando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#FFF" />
                    <Text style={styles.textoBotaoControle}>Finalizar</Text>
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

        {(areaCalculada || carbonoSequestrado) && (
          <View style={styles.secaoInfo}>
            <Text style={[styles.tituloSecao, temaEstilos.texto]}>🌱 Informações Ambientais</Text>
            <View style={styles.cardInfo}>
              <View style={styles.itemInfo}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#4CAF50" />
                <Text style={[styles.valorInfo, temaEstilos.texto]}>{areaCalculada} ha</Text>
                <Text style={styles.rotuloInfo}>Área Total</Text>
              </View>
              <View style={styles.divisorInfo} />
              <View style={styles.itemInfo}>
                <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
                <Text style={[styles.valorInfo, temaEstilos.texto]}>{carbonoSequestrado} tCO₂</Text>
                <Text style={styles.rotuloInfo}>Sequestro anual</Text>
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
            disabled={carregando || pontos.length < 3 || !nomePropriedade || !endereco}
          >
            <LinearGradient
              colors={carregando ? ["#999", "#666"] : ["#4CAF50", "#2D5A27"]}
              style={styles.gradienteSalvar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
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
          <View style={styles.sugestoesContainer}>
            <View style={styles.sugestoesHeader}>
              <Text style={[styles.sugestoesTitulo, temaEstilos.texto]}>
                📍 Locais encontrados ({sugestoesEndereco.length})
              </Text>
              <TouchableOpacity onPress={() => setMostrarSugestoes(false)}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sugestoesEndereco}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              renderItem={renderSugestao}
              showsVerticalScrollIndicator={true}
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
    paddingTop: 20,
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
  tituloCabecalho: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  botaoListar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  conteudo: { flex: 1 },
  formulario: { padding: 20 },
  campo: { marginBottom: 20 },
  rotuloCampo: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputEscuro: { backgroundColor: "#1E1E1E", color: "#FFF", borderColor: "#333" },
  containerBusca: { flexDirection: "row", gap: 10 },
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
  textoEnderecoSelecionado: { flex: 1, fontSize: 12 },
  botoesNavegacao: { flexDirection: "row", gap: 10, marginTop: 5 },
  botaoNavegacao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  textoBotaoNavegacao: { fontSize: 12, color: "#4CAF50", fontWeight: "500" },
  secaoMapa: { paddingHorizontal: 20, marginBottom: 20 },
  tituloSecao: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtituloSecao: { fontSize: 12, marginBottom: 15 },
  containerMapa: {
    height: 400,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  mapa: { flex: 1 },
  controlesMapa: { flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  botaoControle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  botaoFinalizar: { backgroundColor: "#2196F3" },
  botaoRedesenhar: { backgroundColor: "#FF9800" },
  botaoLimpar: { backgroundColor: "#FF5252" },
  textoBotaoControle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  secaoInfo: { paddingHorizontal: 20, marginBottom: 20 },
  cardInfo: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  itemInfo: { flex: 1, alignItems: "center", gap: 8 },
  valorInfo: { fontSize: 20, fontWeight: "bold" },
  rotuloInfo: { fontSize: 12, color: "#666", textAlign: "center" },
  divisorInfo: { width: 1, backgroundColor: "#E0E0E0" },
  botoesAcao: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
    marginBottom: 20,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
  },
  textoBotaoCancelar: { fontSize: 16, fontWeight: "600", color: "#666" },
  botaoSalvar: { flex: 2, borderRadius: 12, overflow: "hidden" },
  gradienteSalvar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  textoBotaoSalvar: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  
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
  sugestoesContainerEscuro: { backgroundColor: "#1E1E1E" },
  sugestoesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sugestoesTitulo: { fontSize: 18, fontWeight: "bold" },
  itemSugestao: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  itemSugestaoEscuro: { borderBottomColor: "#333", backgroundColor: "#1E1E1E" },
  textoSugestaoContainer: { flex: 1 },
  tituloSugestao: { fontSize: 16, fontWeight: "500" },
  subtituloSugestao: { fontSize: 12, marginTop: 2 },
  
  claro: { container: { backgroundColor: "#F5F5F5" }, texto: { color: "#333" }, subTexto: { color: "#666" } },
  escuro: { container: { backgroundColor: "#121212" }, texto: { color: "#FFF" }, subTexto: { color: "#CCC" } },
});