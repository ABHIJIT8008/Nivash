import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import API from "../api/axiosConfig";

const SecurityParcelScreen = () => {
  const [parcels, setParcels] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals State
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFlatPicker, setShowFlatPicker] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Form State
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [deliveryCompany, setDeliveryCompany] = useState("");

  // OTP State
  const [activeParcel, setActiveParcel] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchData = async () => {
    try {
      const [parcelsRes, flatsRes] = await Promise.all([
        API.get("/parcels"),
        API.get("/flats"),
      ]);
      setParcels(parcelsRes.data);
      setFlats(flatsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
      Alert.alert("Error", "Failed to load gate data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // --- LOG NEW PACKAGE ---
  const handleLogPackage = async () => {
    if (!selectedFlat || !deliveryCompany) {
      Alert.alert(
        "Incomplete",
        "Please select a flat and enter the company name.",
      );
      return;
    }

    try {
      await API.post("/parcels", {
        flat_id: selectedFlat._id,
        delivery_company: deliveryCompany,
      });

      Alert.alert(
        "Success",
        "Package logged! Resident has been sent their OTP.",
      );
      setShowLogModal(false);
      setSelectedFlat(null);
      setDeliveryCompany("");
      fetchData(); // Refresh list
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to log package",
      );
    }
  };

  // --- VERIFY OTP ---
  const handleVerifyOTP = async () => {
    if (otpInput.length !== 4) {
      Alert.alert("Invalid", "OTP must be 4 digits.");
      return;
    }
    setVerifying(true);
    try {
      await API.put(`/parcels/${activeParcel._id}/verify`, { otp: otpInput });
      Alert.alert("✅ Verified", "OTP is correct. Hand over the package!");
      setShowOtpModal(false);
      setOtpInput("");
      setActiveParcel(null);
      fetchData(); // Refresh list
    } catch (error) {
      Alert.alert(
        "❌ Failed",
        error.response?.data?.message || "Invalid OTP. Do not hand over.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const renderParcel = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.flatText}>
          Flat {item.flat_id?.block}-{item.flat_id?.number}
        </Text>
        <Text
          style={[
            styles.badge,
            item.status === "Collected"
              ? styles.badgeGreen
              : styles.badgeOrange,
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.companyText}>📦 {item.delivery_company}</Text>
      <Text style={styles.dateText}>
        {new Date(item.createdAt).toLocaleString("en-IN")}
      </Text>

      {item.status === "Pending" && (
        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={() => {
            setActiveParcel(item);
            setShowOtpModal(true);
          }}
        >
          <Text style={styles.verifyBtnText}>Enter Resident OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gate Parcels</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowLogModal(true)}
        >
          <Text style={styles.addBtnText}>+ Log Package</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0d6efd"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={(item) => item._id}
          renderItem={renderParcel}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No packages at the gate.</Text>
          }
        />
      )}

      {/* --- MODAL: LOG NEW PACKAGE --- */}
      <Modal visible={showLogModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Arrival</Text>

            <Text style={styles.label}>Select Destination Flat:</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowFlatPicker(true)}
            >
              <Text style={{ color: selectedFlat ? "#000" : "#888" }}>
                {selectedFlat
                  ? `Block ${selectedFlat.block} - ${selectedFlat.number}`
                  : "Tap to choose flat..."}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Delivery Company:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Amazon, Swiggy"
              value={deliveryCompany}
              onChangeText={setDeliveryCompany}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleLogPackage}
              >
                <Text style={styles.submitText}>Notify Resident</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: FLAT PICKER (Custom built to avoid npm install errors!) --- */}
      <Modal visible={showFlatPicker} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            <Text style={styles.modalTitle}>Select Flat</Text>
            <FlatList
              data={flats}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.flatListItem}
                  onPress={() => {
                    setSelectedFlat(item);
                    setShowFlatPicker(false);
                  }}
                >
                  <Text style={styles.flatListText}>
                    Block {item.block} - Flat {item.number}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowFlatPicker(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: OTP VERIFICATION --- */}
      <Modal visible={showOtpModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Gate Pass</Text>
            {activeParcel && (
              <Text style={styles.subtitle}>
                Flat {activeParcel.flat_id?.block}-
                {activeParcel.flat_id?.number}
              </Text>
            )}

            <TextInput
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0000"
              value={otpInput}
              onChangeText={setOtpInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtpInput("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleVerifyOTP}
                disabled={verifying}
              >
                <Text style={styles.submitText}>
                  {verifying ? "Checking..." : "Verify Code"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  flatText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  companyText: { fontSize: 16, color: "#555", marginBottom: 5 },
  dateText: { fontSize: 12, color: "#888", marginBottom: 15 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
    overflow: "hidden",
  },
  badgeOrange: { backgroundColor: "#fff3cd", color: "#856404" },
  badgeGreen: { backgroundColor: "#d1e7dd", color: "#0f5132" },

  verifyBtn: {
    backgroundColor: "#198754",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 20 },

  label: { fontWeight: "bold", marginTop: 10, marginBottom: 5, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  pickerBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },

  otpInput: {
    borderWidth: 2,
    borderColor: "#0d6efd",
    borderRadius: 12,
    fontSize: 36,
    textAlign: "center",
    letterSpacing: 10,
    padding: 15,
    marginBottom: 20,
  },

  flatListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  flatListText: { fontSize: 16 },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#e9ecef",
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: { color: "#333", fontWeight: "bold" },
  submitBtn: {
    flex: 1,
    backgroundColor: "#0d6efd",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});

export default SecurityParcelScreen;
