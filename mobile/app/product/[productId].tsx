import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {getProduct, getPriceHistory, trackProduct} from "../../src/lib/api";
import {useAuth} from "../../src/context/AuthContext";
import {LineChart} from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;
const RANGES = [7, 30, 90, "all"] as const;
type Range = (typeof RANGES)[number];

interface ProductDetails {
  productId: string;
  title: string;
  image: string;
  platform: string;
  currentPrice: number;
  url: string;
}

interface PricePoint {
  price: number;
  timestamp: string;
}

export default function ProductScreen() {
  const {productId} = useLocalSearchParams<{productId: string}>();
  const {user} = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [highestPrice, setHighestPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [range, setRange] = useState<Range>(30);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([getProduct(productId), getPriceHistory(productId, range)])
      .then(([pd, hist]) => {
        setProduct(pd.product);
        setLowestPrice(pd.lowestPrice);
        setHighestPrice(pd.highestPrice);
        setHistory(hist);
      })
      .catch(() => Alert.alert("Error", "Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId, range]);

  async function handleTrack() {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      await trackProduct(product!.url);
      setTracked(true);
      Alert.alert("Tracked!", "You will be notified when price drops.");
    } catch {
      Alert.alert("Error", "Failed to track product.");
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  const chartData =
    history.length >= 2
      ? {
          labels: history
            .filter((_, i) => i % Math.max(1, Math.floor(history.length / 5)) === 0)
            .map((h) =>
              new Date(h.timestamp).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })
            ),
          datasets: [{data: history.map((h) => h.price)}],
        }
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Product Card */}
      {product.image ? (
        <Image source={{uri: product.image}} style={styles.image} resizeMode="contain" />
      ) : null}

      <View style={styles.card}>
        <Text style={styles.platformBadge}>{product.platform.toUpperCase()}</Text>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.statsRow}>
          <Stat label="Current" value={`₹${product.currentPrice?.toLocaleString("en-IN")}`} blue />
          {lowestPrice !== null && (
            <Stat label="Lowest" value={`₹${lowestPrice.toLocaleString("en-IN")}`} green />
          )}
          {highestPrice !== null && (
            <Stat label="Highest" value={`₹${highestPrice.toLocaleString("en-IN")}`} />
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => Linking.openURL(product.url)}
          >
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
          {user && !tracked && (
            <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
              <Text style={styles.trackBtnText}>Track Price</Text>
            </TouchableOpacity>
          )}
          {tracked && (
            <View style={styles.trackedBadge}>
              <Text style={styles.trackedBadgeText}>✓ Tracked</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Price History</Text>

        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={String(r)}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
                {r === "all" ? "All" : `${r}d`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData ? (
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 64}
            height={200}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#2563eb",
              labelColor: () => "#6b7280",
              propsForDots: {r: "3", strokeWidth: "1", stroke: "#2563eb"},
            }}
            bezier
            style={{borderRadius: 10, marginTop: 8}}
            withInnerLines={false}
            formatYLabel={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
          />
        ) : (
          <Text style={styles.noHistory}>Not enough price history yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  blue,
  green,
}: {
  label: string;
  value: string;
  blue?: boolean;
  green?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          blue && {color: "#2563eb"},
          green && {color: "#16a34a"},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f9fafb"},
  scroll: {padding: 16, gap: 14},
  centered: {flex: 1, alignItems: "center", justifyContent: "center"},
  errorText: {color: "#ef4444", fontSize: 16},
  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  platformBadge: {fontSize: 11, fontWeight: "700", color: "#2563eb", marginBottom: 6},
  title: {fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 16, lineHeight: 22},
  statsRow: {flexDirection: "row", gap: 20, marginBottom: 20},
  stat: {},
  statLabel: {fontSize: 11, color: "#6b7280", marginBottom: 2},
  statValue: {fontSize: 20, fontWeight: "800", color: "#374151"},
  actions: {flexDirection: "row", gap: 12},
  buyBtn: {flex: 1, backgroundColor: "#ea580c", borderRadius: 12, paddingVertical: 12, alignItems: "center"},
  buyBtnText: {color: "#fff", fontWeight: "700", fontSize: 15},
  trackBtn: {flex: 1, borderWidth: 1.5, borderColor: "#2563eb", borderRadius: 12, paddingVertical: 12, alignItems: "center"},
  trackBtnText: {color: "#2563eb", fontWeight: "700", fontSize: 15},
  trackedBadge: {flex: 1, borderWidth: 1.5, borderColor: "#16a34a", borderRadius: 12, paddingVertical: 12, alignItems: "center"},
  trackedBadgeText: {color: "#16a34a", fontWeight: "700", fontSize: 15},
  sectionTitle: {fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 10},
  rangeRow: {flexDirection: "row", gap: 8, marginBottom: 8},
  rangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  rangeBtnActive: {backgroundColor: "#2563eb"},
  rangeBtnText: {fontSize: 12, fontWeight: "600", color: "#6b7280"},
  rangeBtnTextActive: {color: "#fff"},
  noHistory: {color: "#9ca3af", textAlign: "center", paddingVertical: 24},
});
