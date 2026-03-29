import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, FlatList, 
  ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';

const PollsScreen = () => {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingOn, setVotingOn] = useState(null); // Tracks which poll is processing a vote

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data } = await API.get('/polls');
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls', error);
      Alert.alert('Error', 'Could not load polls at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    setVotingOn(pollId);
    try {
      await API.post(`/polls/${pollId}/vote`, { optionId });
      Alert.alert('Success', 'Your vote has been securely cast!');
      
      // Refresh the polls so the UI instantly swaps from buttons to progress bars
      fetchPolls();
    } catch (error) {
      console.error(error);
      Alert.alert('Oops!', error.response?.data?.message || 'Failed to cast vote.');
    } finally {
      setVotingOn(null);
    }
  };

  const renderPoll = ({ item }) => {
    // THE MAGIC LOGIC: Check if the current user's flat has already voted
    const hasVoted = item.voted_flats.includes(user?.flat_id);
    const totalVotes = item.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
      <View style={styles.pollCard}>
        <View style={styles.headerRow}>
          <Text style={styles.question}>{item.question}</Text>
          <View style={[styles.badge, item.target_scope.type === 'Society' ? styles.badgeGlobal : styles.badgeLocal]}>
            <Text style={[styles.badgeText, item.target_scope.type === 'Society' ? styles.badgeTextGlobal : styles.badgeTextLocal]}>
              {item.target_scope.type === 'Society' ? 'Global' : `Block ${item.target_scope.target_value}`}
            </Text>
          </View>
        </View>

        {hasVoted ? (
          // RESULTS VIEW: Show progress bars if their flat already voted
          <View style={styles.optionsContainer}>
            {item.options.map((opt) => {
              const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
              return (
                <View key={opt._id} style={styles.resultRow}>
                  <View style={styles.resultLabels}>
                    <Text style={styles.optionTextResult}>{opt.text}</Text>
                    <Text style={styles.percentageText}>{opt.votes} votes ({percentage}%)</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              );
            })}
            <View style={styles.footerRow}>
              <Text style={styles.thankYouText}>✓ Your flat has voted</Text>
              <Text style={styles.totalVotes}>Total Votes: {totalVotes}</Text>
            </View>
          </View>
        ) : (
          // VOTING VIEW: Show buttons if they haven't voted yet
          <View style={styles.optionsContainer}>
            {item.options.map((opt) => (
              <TouchableOpacity 
                key={opt._id} 
                style={styles.voteButton}
                onPress={() => handleVote(item._id, opt._id)}
                disabled={votingOn === item._id}
              >
                <Text style={styles.voteButtonText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
            {votingOn === item._id && <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 10 }} />}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Community Polls 🗳️</Text>
        <Text style={styles.subtitle}>Have your say in society matters. One vote per flat.</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
        ) : (
          <FlatList 
            data={polls}
            keyExtractor={(item) => item._id}
            renderItem={renderPoll}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No active polls at the moment.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f6', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  listContainer: { paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 40 },
  
  // Card Styles
  pollCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  question: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1, paddingRight: 10, lineHeight: 22 },
  
  // Badges
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGlobal: { backgroundColor: '#e0cffc' },
  badgeLocal: { backgroundColor: '#ffe5d0' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextGlobal: { color: '#5a189a' },
  badgeTextLocal: { color: '#fd7e14' },

  optionsContainer: { marginTop: 5 },
  
  // Voting Buttons View
  voteButton: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 10 },
  voteButtonText: { color: '#333', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  
  // Results View
  resultRow: { marginBottom: 12 },
  resultLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  optionTextResult: { fontSize: 14, fontWeight: '600', color: '#333' },
  percentageText: { fontSize: 12, color: '#666', fontWeight: '500' },
  progressBarBg: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0d6efd', borderRadius: 4 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  thankYouText: { fontSize: 13, color: '#198754', fontWeight: '700' },
  totalVotes: { fontSize: 12, color: '#aaa', fontWeight: '600' }
});

export default PollsScreen;