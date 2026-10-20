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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
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
      if (res.success && res.messages) {
        setMessages(res.messages);
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
      const res = await ApiClient.sendMessage(projectId, inputText.trim());
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
        <View style={styles.systemNoticeBox}>
          <Icon name="bell" size={14} color="#5B4DFF" />
          <Text style={styles.systemNoticeText}>
            {item.content}
          </Text>
        </View>
      );
    }

    const isMe =
      item.sender?.address?.toLowerCase() === walletState.address?.toLowerCase();
    const senderName =
      item.sender?.freelancerProfile?.displayName ||
      item.sender?.clientProfile?.displayName ||
      'User';

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          {!isMe && (
            <Text style={styles.senderName}>{senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isMe ? '#FFFFFF' : '#1A1D2E' },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timeText,
              { color: isMe ? 'rgba(255, 255, 255, 0.75)' : '#9CA3AF' },
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F6F7FB' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Project Workspace"
        subtitle="Escrow Protected Chat"
        onBack={onBack}
      />

      {/* Escrow Guarantee Pill */}
      <View style={styles.chatHeaderBanner}>
        <Icon name="shield" size={14} color="#5B4DFF" />
        <Text style={styles.chatHeaderText}>
          Chat logs are encrypted and timestamped for dispute arbitration
        </Text>
      </View>

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
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Friendly Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message or milestone update..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.disabledSend,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DEFF',
  },
  chatHeaderText: {
    fontSize: 11,
    color: '#5B4DFF',
    fontWeight: '600',
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  systemNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEFF',
    borderWidth: 1,
    borderColor: '#E2DEFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginVertical: 4,
    gap: 6,
  },
  systemNoticeText: {
    fontSize: 12,
    color: '#5B4DFF',
    fontWeight: '600',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  theirBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#5B4DFF',
    borderBottomRightRadius: 4,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEF0F8',
    shadowColor: '#1A1D2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4DFF',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F8',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E3E7F4',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1D2E',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5B4DFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledSend: {
    opacity: 0.4,
  },
});
