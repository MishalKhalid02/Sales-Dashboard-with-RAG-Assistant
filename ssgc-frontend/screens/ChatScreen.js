import { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import { sendChatMessage, transcribeAudio } from '../api/chat';
import { colors } from '../constants/colors';
import Markdown from '@ronradtke/react-native-markdown-display';


export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! Ask me anything about your billing data — e.g. "What were total gas charges for August 2026?"' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const listRef = useRef(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const historyForRequest = messages.map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const { reply } = await sendChatMessage(trimmed, historyForRequest);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
      console.log('Chat error:', error.response?.data || error.message);
      setMessages((prev) => [...prev, { role: 'model', text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleVoiceInput = async () => {
    if (recording) {
      setTranscribing(true);
      await recorder.stop();
      setRecording(false);

      try {
        if (!recorder.uri) throw new Error('No recording was created.');
        const audioBuffer = await new File(recorder.uri).arrayBuffer();
        const bytes = new Uint8Array(audioBuffer);
        let binary = '';
        bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
        const transcript = await transcribeAudio(btoa(binary), 'audio/m4a');
        setInput(transcript);
      } catch (error) {
        console.log('Transcription error:', error.response?.data || error.message);
        Alert.alert('Voice input failed', 'The recording could not be transcribed. Please try again.');
      } finally {
        setTranscribing(false);
      }
      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow microphone access to use voice input.');
      return;
    }

    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.dusk} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>AI Assistant</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.modelBubble]}>
           {item.role === 'user' ? (
  <Text style={styles.userText}>{item.text}</Text>
) : (
  <Markdown style={markdownStyles}>
    {item.text}
  </Markdown>
)}
          </View>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.navyDeep} />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your billing data..."
          placeholderTextColor={colors.muted}
          multiline
        />
        <TouchableOpacity
          style={[styles.voiceButton, recording && styles.voiceButtonActive]}
          onPress={handleVoiceInput}
          disabled={sending || transcribing}
          accessibilityLabel={recording ? 'Stop recording' : transcribing ? 'Transcribing recording' : 'Start recording'}
          accessibilityRole="button"
        >
          <Ionicons name={recording ? 'stop' : 'mic-outline'} size={20} color={colors.arctic} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
          <Ionicons name="send" size={18} color={colors.arctic} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mist },
  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: colors.navyDeep,
  },
  backButton: { padding: 4 },
  appBarTitle: { fontSize: 16, fontWeight: '700', color: colors.arctic },
  messageList: { padding: 16, gap: 10 },
  bubble: { maxWidth: '95%', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 4 },
  userBubble: { backgroundColor: colors.navyDeep, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  modelBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 2 },
  userText: { color: colors.arctic, fontSize: 14 },
  modelText: { color: colors.text, fontSize: 14 },
  markdownStrong: { fontWeight: '700' },
  markdownEmphasis: { fontStyle: 'italic' },
  markdownCode: { backgroundColor: colors.surfaceMuted, color: colors.navyDeep },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  typingText: { color: colors.muted, fontSize: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: colors.text, maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.ocean, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  voiceButton: {
    backgroundColor: colors.navyMid, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  voiceButtonActive: { backgroundColor: colors.bad },

});
const markdownStyles = {
  body: {
    color: colors.text,
    fontSize: 14,
  },

  heading1: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },

  heading2: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },

  heading3: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },

  strong: {
    fontWeight: '700',
  },

  em: {
    fontStyle: 'italic',
  },

  code_inline: {
    backgroundColor: colors.surfaceMuted,
    color: colors.navyDeep,
  },

  fence: {
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: 8,
  },

  table: {
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },

  thead: {
    backgroundColor: colors.navyDeep,
  },

  th: {
    color: colors.arctic,
    fontWeight: '700',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  td: {
    color: colors.text,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
};
// Removed markdownStyles as it is no longer needed