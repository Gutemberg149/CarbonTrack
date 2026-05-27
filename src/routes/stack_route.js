// src/routes/index.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Importação das telas
import TelaHome from "../telas/TelaHome";
import TelaListaPropriedades from "../telas/TelaLPropriedades";
// import TelaNovaPropriedade from "../telas/TelaNovaPropriedade";
// import TelaMonitoramento from "../telas/TelaMonitoramento";
// import TelaRelatorios from "../telas/TelaRelatorios";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="TelaHome"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="TelaHome" component={TelaHome} />
      <Stack.Screen name="TelaListaPropriedades" component={TelaListaPropriedades} />
      {/* <Stack.Screen name="TelaNovaPropriedade" component={TelaNovaPropriedade} /> */}
      {/* <Stack.Screen name="TelaMonitoramento" component={TelaMonitoramento} />
      <Stack.Screen name="TelaRelatorios" component={TelaRelatorios} /> */}
    </Stack.Navigator>
  );
}
