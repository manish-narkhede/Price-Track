import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {useRouter} from "expo-router";
import {useAuth} from "../src/context/AuthContext";
import {getTrackedProducts, removeTrackedProduct} from "../src/lib/api";

interface Product {
  productId: string;
  title: string;
  image: string;
  platform: string;
  currentPrice: number;
}

export default function DashboardScreen() {
  const {user, loading: authLoading} = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getTrackedProducts()
      .then(setProducts)
      .catch(() => Alert.alert("Error", "Failed to load tracked products"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleRemove(productId: string) {
    Alert.alert("Untrack Product", "Stop tracking this product?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Untrack",
        style: "destructive",
        onPress: async () => {
          try {
            await removeTrackedProduct(productId);
            setProducts((prev) => prev.filter((p) => p.productId !== productId));
          } catch {
            Alert.alert("Error", "Failed to remove product");
          }
        },
      },
    ]);
  }

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>No tracked products yet.</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/")}>
          <Text style={styles.addBtnText}>Track a Product</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.productId}
      contentContainerStyle={styles.list}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/product/${item.productId}`)}
          activeOpacity={0.8}
        >
          {item.image ? (
            <Image source={{uri: item.image}} style={styles.cardImage} resizeMode="contain" />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.platform}>{item.platform.toUpperCase()}</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.price}>
              ₹{item.currentPrice?.toLocaleString("en-IN")}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item.productId)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb"},
  emptyIcon: {fontSize: 52, marginBottom: 12},
  emptyText: {fontSize: 16, color: "#6b7280", marginBottom: 20},
  addBtn: {backgroundColor: "#2563eb", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  addBtnText: {color: "#fff", fontWeight: "700", fontSize: 15},
  list: {padding: 16, gap: 12},
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    gap: 12,
  },
  cardImage: {width: 72, height: 72, borderRadius: 10},
  imagePlaceholder: {backgroundColor: "#f3f4f6"},
  cardInfo: {flex: 1},
  platform: {fontSize: 10, fontWeight: "700", color: "#2563eb", marginBottom: 3},
  cardTitle: {fontSize: 13, fontWeight: "500", color: "#111827", marginBottom: 6},
  price: {fontSize: 18, fontWeight: "800", color: "#111827"},
  removeBtn: {padding: 6},
  removeBtnText: {fontSize: 16, color: "#9ca3af"},
});
