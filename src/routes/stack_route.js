import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaHome from "../telas/TelaHome";
import TelaListaPropriedades from "../telas/TelaListaPropriedades";
import TelaNovaPropriedade from "../telas/TelaNovaPropriedade";
import TelaLogin from "../telas/TelaLogin";
import TelaSignup from "../telas/TelaSignUp";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator initialRouteName="TelaLogin" screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="TelaLogin" component={TelaLogin} />
      <Stack.Screen name="TelaSignup" component={TelaSignup} />
      <Stack.Screen name="TelaHome" component={TelaHome} />
      <Stack.Screen name="TelaListaPropriedades" component={TelaListaPropriedades} />
      <Stack.Screen name="TelaNovaPropriedade" component={TelaNovaPropriedade} />
    </Stack.Navigator>
  );
}
