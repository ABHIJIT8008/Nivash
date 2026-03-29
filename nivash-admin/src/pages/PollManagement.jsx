import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const PollManagement = () => {
  const [polls, setPolls] = useState([]);
  const [blocks, setBlocks] = useState([]);
  
  // Form State
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [scopeType, setScopeType] = useState('Society');
  const [scopeValue, setScopeValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPolls();
    fetchBlocks();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data } = await API.get('/polls');
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const fetchBlocks = async () => {
    try {
      // 1. Fetch flats instead, since that is where the block data lives!
      const { data } = await API.get('/flats');
      
      // 2. Extract the 'block' property from every flat, and use Set() to remove duplicates
      const uniqueBlocks = [...new Set(data.map(flat => flat.block))].filter(Boolean); 
      
      setBlocks(uniqueBlocks);
      
      // 3. Set the default dropdown value to the first block we found
      if (uniqueBlocks.length > 0) setScopeValue(uniqueBlocks[0]);
    } catch (error) {
      console.error('Error extracting blocks from flats:', error);
    }
  };

  // Dynamic Options Handlers
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);
  
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (!question || validOptions.length < 2) {
      alert('Please enter a question and at least two valid options.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        question,
        options: validOptions,
        target_scope: {
          type: scopeType,
          target_value: scopeType === 'Block' ? scopeValue : null
        }
      };

      await API.post('/polls', payload);
      
      // Reset Form
      setQuestion('');
      setOptions(['', '']);
      setScopeType('Society');
      fetchPolls();
      alert('Poll published successfully!');
    } catch (error) {
      alert('Failed to create poll.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h1 style={styles.greeting}>Community Polls 🗳️</h1>
        <p style={styles.subtitle}>Create and manage voting polls for the society.</p>
      </div>

      {/* CREATE POLL CARD */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Create New Poll</h3>
        <form onSubmit={handleCreatePoll}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Question</label>
            <input 
              type="text" 
              style={styles.input}
              placeholder="E.g., Should we upgrade the gym equipment?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div style={styles.formGrid}>
            {/* Options Section */}
            <div>
              <label style={styles.label}>Options</label>
              {options.map((option, index) => (
                <div key={index} style={styles.optionRow}>
                  <input 
                    type="text" 
                    style={{ ...styles.input, ...styles.optionInput }}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => removeOption(index)}
                      style={styles.btnRemove}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} style={styles.btnText}>
                + Add Another Option
              </button>
            </div>

            {/* Target Scope Section */}
            <div>
                <label style={styles.label}>Target Audience</label>
                <select 
                  style={{ ...styles.input, marginBottom: '16px' }}
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value)}
                >
                  <option value="Society">Entire Society (Global)</option>
                  <option value="Block">Specific Block (Local)</option>
                </select>

              {scopeType === 'Block' && (
                  <select 
                    style={{ ...styles.input, height: '46px' }}
                    value={scopeValue}
                    onChange={(e) => setScopeValue(e.target.value)}
                  >
                    <option value="" disabled>-- Select a Block --</option>
                    
                    {blocks.length === 0 ? (
                      <option value="" disabled>No blocks found in system</option>
                    ) : (
                      // Loop through our clean array of strings!
                      blocks.map((blockName, index) => (
                        <option key={index} value={blockName}>
                          Block {blockName}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ ...styles.btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Poll'}
          </button>
        </form>
      </div>

      {/* ACTIVE POLLS FEED */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>Active Polls & Results</h3>
        
        {polls.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ color: '#888', margin: 0 }}>No polls have been created yet.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

              return (
                <div key={poll._id} style={styles.pollCard}>
                  <div style={styles.pollHeader}>
                    <h4 style={styles.pollQuestion}>{poll.question}</h4>
                    <span style={poll.target_scope.type === 'Society' ? styles.badgeGlobal : styles.badgeLocal}>
                      {poll.target_scope.type === 'Society' ? 'Global' : `Block ${poll.target_scope.target_value}`}
                    </span>
                  </div>
                  
                  <div style={styles.pollOptionsContainer}>
                    {poll.options.map(opt => {
                      const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                      return (
                        <div key={opt._id} style={styles.optionResultWrapper}>
                          <div style={styles.optionLabels}>
                            <span style={styles.optionText}>{opt.text}</span>
                            <span style={styles.optionStats}>{opt.votes} votes ({percentage}%)</span>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p style={styles.totalVotesText}>Total Votes: {totalVotes}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  // Base Layout (Matching Dashboard)
  container: { fontFamily: '"Inter", sans-serif', animation: 'fadeIn 0.5s ease-in', paddingBottom: '2rem' },
  headerArea: { marginBottom: '2rem' },
  greeting: { fontSize: '28px', color: '#1a1a1a', margin: '0 0 8px 0', fontWeight: '800' },
  subtitle: { fontSize: '15px', color: '#666', margin: 0 },
  
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', marginBottom: '2rem' },
  sectionTitle: { fontSize: '18px', color: '#333', marginBottom: '20px', fontWeight: '700' },
  recentSection: { marginTop: '2rem' },
  emptyBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #ccc' },

  // Form Elements
  formGroup: { marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' },
  label: { display: 'block', fontSize: '14px', color: '#666', fontWeight: '600', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #dcdcdc', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  
  optionRow: { display: 'flex', marginBottom: '12px' },
  optionInput: { borderTopRightRadius: '0', borderBottomRightRadius: '0', borderRight: 'none' },
  
  // Buttons
  btnRemove: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0 16px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnText: { background: 'none', border: 'none', color: '#0d6efd', fontWeight: '600', cursor: 'pointer', padding: '8px 0', fontSize: '14px' },
  btnPrimary: { backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'inline-block' },

  // Poll Feed Grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' },
  pollCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' },
  pollHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  pollQuestion: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a', flex: 1, paddingRight: '12px', lineHeight: '1.4' },
  
  // Badges
  badgeGlobal: { backgroundColor: '#e0cffc', color: '#5a189a', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  badgeLocal: { backgroundColor: '#ffe5d0', color: '#fd7e14', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },

  // Progress Bars
  pollOptionsContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  optionResultWrapper: { width: '100%' },
  optionLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' },
  optionText: { color: '#333', fontWeight: '500' },
  optionStats: { color: '#888', fontSize: '13px' },
  progressBarBg: { backgroundColor: '#f0f0f0', height: '8px', borderRadius: '10px', width: '100%', overflow: 'hidden' },
  progressBarFill: { backgroundColor: '#0d6efd', height: '100%', borderRadius: '10px', transition: 'width 0.4s ease' },
  
  totalVotesText: { textAlign: 'right', margin: '16px 0 0 0', fontSize: '12px', color: '#aaa', fontWeight: '600' }
};

export default PollManagement;