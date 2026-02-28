import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/axiosConfig";

const HelpdeskScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyTickets = async () => {
    try {
      const response = await API.get("/tickets/my-tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyTickets();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert(
        "Missing Details",
        "Please fill in both the issue title and description.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/tickets", { title, description });
      setTitle("");
      setDescription("");
      fetchMyTickets();
      Alert.alert(
        "Ticket Raised",
        "Management has been notified of your issue.",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTicketItem = ({ item }) => {
    // Premium color coding for the status badges
    const statusConfig = {
      Resolved: { bg: "#e6f4ea", text: "#1e8e3e", icon: "checkmark-circle" },
      "In Progress": { bg: "#fef7e0", text: "#f29900", icon: "time" },
      Open: { bg: "#fce8e6", text: "#d93025", icon: "alert-circle" },
    };

    const config = statusConfig[item.status] || statusConfig["Open"];

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons
              name={config.icon}
              size={14}
              color={config.text}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: config.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.ticketDesc}>{item.description}</Text>
        <View style={styles.ticketFooter}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.ticketDate}>
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* --- RAISE TICKET FORM --- */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="construct" size={20} color="#17a2b8" />
              <Text style={styles.formTitle}>Report an Issue</Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="text-outline"
                size={20}
                color="#aaa"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Issue Title (e.g., Leaking Pipe)"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#aaa"
                style={[styles.inputIcon, { marginTop: 12 }]}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Submit Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* --- TICKETS HISTORY SECTION --- */}
          <View style={styles.sectionHeader}>
            <Ionicons name="file-tray-full-outline" size={20} color="#555" />
            <Text style={styles.sectionTitle}>My Ticket History</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#17a2b8"
              style={{ marginTop: 30 }}
            />
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => item._id}
              renderItem={renderTicketItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#17a2b8"]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={48}
                    color="#ccc"
                  />
                  <Text style={styles.emptyCardText}>No issues reported.</Text>
                  <Text style={styles.emptyCardSubText}>
                    Your flat is running smoothly!
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1, padding: 20 },

  // Form Styles
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  formHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  formTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginLeft: 8 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#333" },

  textAreaContainer: { alignItems: "flex-start" },
  textArea: { height: 90, textAlignVertical: "top", paddingTop: 14 },

  submitButton: {
    flexDirection: "row",
    backgroundColor: "#17a2b8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // History Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    marginLeft: 8,
  },

  // Ticket Cards
  ticketCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },

  ticketDesc: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 12 },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
    paddingTop: 10,
  },
  ticketDate: { fontSize: 12, color: "#888", marginLeft: 6, fontWeight: "500" },

  // Empty State
  emptyCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  emptyCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCardSubText: { fontSize: 14, color: "#888" },
});

export default HelpdeskScreen;
