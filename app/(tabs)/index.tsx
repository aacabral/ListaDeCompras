import React, { useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface BuysProps {
  id: number;
  name: string;
  complete: boolean;
}

export default function App() {
  const [filter, setFilter] = useState<"all" | "complete" | "pending">(
    "pending"
  );
  const [buys, setBuys] = useState<BuysProps[]>([]);
  const [item, setItem] = useState("");

  // Carrega os itens salvos no AsyncStorage ao iniciar o app
  useEffect(() => {
    loadBuys();
  }, []);

  async function loadBuys() {
    const storedBuys = await AsyncStorage.getItem("@shopping_list");
    if (storedBuys) {
      setBuys(JSON.parse(storedBuys));
    }
  }

  // Salva um novo item na lista e persiste no AsyncStorage
  async function saveItem() {
    if (item.trim()) {
      const newItem = { id: Date.now(), name: item.trim(), complete: false };
      const updatedBuys = [...buys, newItem];
      setBuys(updatedBuys);
      await AsyncStorage.setItem("@shopping_list", JSON.stringify(updatedBuys));
      setItem("");
    }
  }

  // Alterna o status de completo de um item e salva no AsyncStorage
  async function toggleComplete(id: number) {
    const updatedBuys = buys.map((buy) =>
      buy.id === id ? { ...buy, complete: !buy.complete } : buy
    );
    setBuys(updatedBuys);
    await AsyncStorage.setItem("@shopping_list", JSON.stringify(updatedBuys));
  }

  // Exclui um item da lista com confirmação e atualiza o AsyncStorage
  async function deleteItem(id: number) {
    Alert.alert("Excluir", "Tem certeza que deseja excluir este item?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          const updatedBuys = buys.filter((buy) => buy.id !== id);
          setBuys(updatedBuys);
          await AsyncStorage.setItem(
            "@shopping_list",
            JSON.stringify(updatedBuys)
          );
        },
        style: "destructive",
      },
    ]);
  }

  const filteredBuys = buys.filter((item) => {
    if (filter === "complete") return item.complete;
    if (filter === "pending") return !item.complete;
    return true;
  });

  const renderItem = ({ item }: { item: BuysProps }) => (
    <Animated.View style={item.complete ? styles.completedCard : styles.card}>
      <View style={styles.infoCard}>
        <Pressable onPress={() => toggleComplete(item.id)}>
          {item.complete ? (
            <MaterialIcons name="check-box" size={24} color="#10B981" />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              size={24}
              color="#9CA3AF"
            />
          )}
        </Pressable>
        <Text style={styles.textItem}>{item.name}</Text>
      </View>
      <Pressable onPress={() => deleteItem(item.id)}>
        <AntDesign name="delete" size={24} color="#EF4444" />
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Compras</Text>
      <TextInput
        style={styles.input}
        placeholder="Adicione um novo item"
        placeholderTextColor="#9CA3AF"
        onChangeText={setItem}
        value={item}
      />
      <TouchableOpacity onPress={saveItem} style={styles.button}>
        <Text style={styles.textButton}>Adicionar</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => setFilter("pending")}
          style={styles.filterButton}
        >
          <Text
            style={
              filter === "pending" ? styles.activeFilter : styles.filterText
            }
          >
            Pendentes
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter("complete")}
          style={styles.filterButton}
        >
          <Text
            style={
              filter === "complete" ? styles.activeFilter : styles.filterText
            }
          >
            Concluídos
          </Text>
        </Pressable>
        <Pressable onPress={() => setFilter("all")} style={styles.filterButton}>
          <Text
            style={filter === "all" ? styles.activeFilter : styles.filterText}
          >
            Todos
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={filteredBuys}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.cardContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F4F5FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#3E4C59",
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3B82F6",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  textButton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  filterText: {
    color: "#6B7280",
  },
  activeFilter: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  cardContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    elevation: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  completedCard: {
    backgroundColor: "#D1FAE5",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textItem: {
    fontSize: 16,
    color: "#1F2937",
  },
});
