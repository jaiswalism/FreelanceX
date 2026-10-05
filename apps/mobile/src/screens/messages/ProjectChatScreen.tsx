import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { ApiClient } from '../../services/api/apiClient';
import { WalletService } from '../../services/wallet/walletService';

interface ProjectChatScreenProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectChatScreen: React.FC<ProjectChatScreenProps> = ({
  projectId,
  onBack,
}) => {
  const { colors } = defaultTheme;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const walletState = WalletService.getState();

  const fetchMessages = async () => {
    try {
      const res = await ApiClient.getProjectMessages(projectId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 4000);
    return () => clearInterval(timer);
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const res = await ApiClient.sendMessage(projectId, inputText);
      if (res.success) {
        setInputText('');
        fetchMessages();
      }
    } catch {
      // Error handling
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    if (item.isSystemNotification) {
      return (
        <View style={[styles.systemNoticeBox, { borderColor: 'rgba(255, 106, 0, 0.3)' }]}>
          <Text style={[styles.systemNoticeText, { color: colors.brand.primary }]}>
            🔔 {item.content}
          </Text>
        </View>
      );
    }

    const isMe = item.sender?.address?.toLowerCase() === walletState.address?.toLowerCase();
    const senderName = item.sender?.freelancerProfile?.displayName || item.sender?.clientProfile?.displayName || 'User';

    return (
      <View style={[styles.messageBubble, isMe ? { backgroundColor: colors.brand.primary } : styles.theirBubble]}>
        <Text style={[styles.senderText, { color: isMe ? '#090909' : colors.text.tertiary }]}>
          {isMe ? 'You' : senderName}
        </Text>
        <Text style={[styles.messageText, { color: isMe ? '#090909' : colors.text.primary }]}>
          {item.content}
        </Text>
        <Text style={[styles.timeText, { color: isMe ? '#222222' : colors.text.tertiary }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.app }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: colors.brand.primary, fontWeight: '700' }}>← Back</Text>
      </TouchableOpacity>

      <Header title="Project Comms & Chat" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Chat Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background.secondary, borderTopColor: colors.border.default }]}>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border.default, color: colors.text.primary }]}
            placeholder="Type your message or update..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.brand.primary }, !inputText.trim() && styles.disabledSend]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  keyboardView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  systemNoticeBox: {
    backgroundColor: 'rgba(255, 106, 0, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  systemNoticeText: {
    fontSize: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C1C',
  },
  senderText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSend: {
    opacity: 0.4,
  },
  sendIcon: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
