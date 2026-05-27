import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./context/AppProvider";
import HomeScreen from "./src/telas/TelaHome";
import NovaPropriedadeScreen from "./src/telas/TelaHome";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TelaHome">
          <Stack.Screen name="TelaHome" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="NovaPropriedade" component={NovaPropriedadeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
