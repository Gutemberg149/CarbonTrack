// import { StatusBar } from "expo-status-bar";
// import { StyleSheet } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { NavigationContainer } from "@react-navigation/native";
// import Routes from "./src/routes/stack_route";

// import { AppProvider } from "./context/AppProvider";

// export default function App() {
//   return (
//     <AppProvider>
//       <SafeAreaProvider style={styles.appGlobal}>
//         <StatusBar style="auto" />
//         <NavigationContainer>
//           <Routes />
//         </NavigationContainer>
//       </SafeAreaProvider>
//     </AppProvider>
//   );
// }

// const styles = StyleSheet.create({
//   appGlobal: {
//     flex: 1,
//   },
// });
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import Routes from "./src/routes/stack_route";

import { AppProvider } from "./context/AppProvider";
import { AuthProvider } from "./context/AuthContext.js"; // Adicione esta linha

export default function App() {
  return (
    <AuthProvider>
      {" "}
      {/* Envolva com AuthProvider */}
      <AppProvider>
        <SafeAreaProvider style={styles.appGlobal}>
          <StatusBar style="auto" />
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appGlobal: {
    flex: 1,
  },
});
