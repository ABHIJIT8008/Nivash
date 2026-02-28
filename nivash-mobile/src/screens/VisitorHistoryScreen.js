import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert, // <-- Added Alert
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/axiosConfig";

const VisitorHistoryScreen = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVisitors = async () => {
    try {
      const response = await API.get("/visitors/my-visitors");
      setVisitors(response.data);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisitors();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Optimistically update the UI instantly
      setVisitors(
        visitors.map((v) => (v._id === id ? { ...v, status: newStatus } : v)),
      );
      // Tell the backend
      await API.put(`/visitors/${id}/status`, { status: newStatus });
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
      fetchVisitors(); // Revert back if API fails
    }
  };

  const renderVisitorCard = ({ item }) => {
    // Premium color coding for the status badges
    const statusConfig = {
      Approved: { bg: "#e6f4ea", text: "#1e8e3e", icon: "checkmark-circle" },
      Denied: { bg: "#fce8e6", text: "#d93025", icon: "close-circle" },
      Pending: { bg: "#fef7e0", text: "#f29900", icon: "time" },
    };

    // Default to pending if somehow undefined
    const config = statusConfig[item.status] || statusConfig["Pending"];

    return (
      <View style={styles.card}>
        <View style={styles.photoContainer}>
          {item.photo_url ? (
            <Image source={{ uri: item.photo_url }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.placeholderPhoto]}>
              <Ionicons name="person" size={30} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.visitor_name}
          </Text>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#888"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 5,
            }}
          >
            <View style={[styles.badge, { backgroundColor: config.bg }]}>
              <Ionicons
                name={config.icon}
                size={14}
                color={config.text}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.badgeText, { color: config.text }]}>
                {item.status}
              </Text>
            </View>

            {/* QUICK ACTIONS TO UNDO MISTAKES */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {item.status !== "Approved" && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item._id, "Approved")}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={26}
                    color="#28a745"
                  />
                </TouchableOpacity>
              )}
              {item.status !== "Denied" && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item._id, "Denied")}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={26}
                    color="#dc3545"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="shield-checkmark" size={28} color="#007bff" />
            <Text style={styles.headerTitle}>Visitor Log</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Monitor who arrives at your flat
          </Text>
        </View>

        {/* --- LIST --- */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={visitors}
            keyExtractor={(item) => item._id}
            renderItem={renderVisitorCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007bff"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No visitors recorded yet.</Text>
                <Text style={styles.emptySubText}>
                  Your guest history will appear here.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header
  header: { marginBottom: 20, paddingVertical: 10 },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  headerSubtitle: { fontSize: 15, color: "#666", marginLeft: 4 },

  // Visitor Card
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: "center",
  },

  photoContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  placeholderPhoto: {
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContainer: { flex: 1, marginLeft: 16, justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 6 },

  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  date: { fontSize: 13, color: "#666", fontWeight: "500" },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },

  // Empty State
  emptyCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: { fontSize: 14, color: "#888" },
});

export default VisitorHistoryScreen;
