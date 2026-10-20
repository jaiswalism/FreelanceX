import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { ApiClient } from '../../services/api/apiClient';
import { MobileEscrowService } from '../../services/blockchain/escrowService';

interface DisputeResolutionScreenProps {
  projectId: string;
  milestoneIndex?: number;
  onBack: () => void;
}

export const DisputeResolutionScreen: React.FC<DisputeResolutionScreenProps> = ({
  projectId,
  milestoneIndex = 0,
  onBack,
}) => {
  const { spacing } = defaultTheme;
  const [reason, setReason] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchDisputes = async () => {
    try {
      const res = await ApiClient.getProjectDisputes(projectId);
      if (res.success && res.disputes) {
        setDisputes(res.disputes);
      }
    } catch {
      // Quiet fallback
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [projectId]);

  const handleRaiseOnChainDispute = async () => {
    if (!reason.trim()) {
      Alert.alert('Required Field', 'Please provide a clear reason for initiating this dispute.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = MobileEscrowService.encodeRaiseDispute(projectId, milestoneIndex, reason);

      await ApiClient.createDispute({
        projectId,
        milestoneIndex,
        reason,
        evidenceUris: evidenceUrl ? [evidenceUrl] : [],
      });

      Alert.alert(
        'Dispute Initiated ⚖️',
        `Dispute submitted to 2-of-3 Multisig Arbitrators. Encoded Tx Target: ${payload.to.substring(0, 10)}...`
      );

      setReason('');
      setEvidenceUrl('');
      fetchDisputes();
    } catch (error) {
      Alert.alert('Dispute Submission Failed', error instanceof Error ? error.message : 'Error submitting dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F6F7FB' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Dispute Arbitration"
        subtitle="2-of-3 Multisig Protection"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.layout.screenHorizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIconCircle}>
            <Icon name="scale" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.introTitle}>2-of-3 Multisig Arbitration</Text>
            <Text style={styles.introDesc}>
              Disputes freeze milestone funds on-chain. Independent signers review submitted evidence to reach consensus (Pay Freelancer, Refund Client, or Split Funds).
            </Text>
          </View>
        </View>

        {/* Raise New Dispute Form */}
        <Card style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Initiate Milestone Dispute</Text>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>Milestone #{milestoneIndex + 1}</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Reason / Incident Details</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe breach of milestone terms, incomplete deliverable, or specification dispute..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />

          <Text style={styles.inputLabel}>Evidence Link (GitHub PR, IPFS, Chat Log)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://github.com/... or ipfs://..."
            placeholderTextColor="#9CA3AF"
            value={evidenceUrl}
            onChangeText={setEvidenceUrl}
          />

          <Button
            title={submitting ? 'Submitting Dispute...' : 'Initiate Dispute'}
            onPress={handleRaiseOnChainDispute}
            loading={submitting}
            variant="primary"
            style={{ marginTop: 18 }}
          />
        </Card>

        {/* Active & Resolved Disputes */}
        <Text style={styles.sectionHeader}>Project Dispute History</Text>
        {disputes.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <Icon name="checkCircle" size={32} color="#10B981" />
            <Text style={{ color: '#1A1D2E', fontWeight: '700', fontSize: 15, marginTop: 10 }}>
              No Active Disputes
            </Text>
            <Text style={{ color: '#697089', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Project is progressing smoothly with healthy milestone escrow.
            </Text>
          </Card>
        ) : (
          disputes.map((d, idx) => (
            <Card key={d.id || idx} style={styles.disputeCard}>
              <View style={styles.disputeHeader}>
                <Text style={styles.disputeTitle}>Dispute #{idx + 1}</Text>
                <Badge
                  label={d.isResolved ? 'RESOLVED' : 'PENDING MULTISIG'}
                  variant={d.isResolved ? 'success' : 'warning'}
                />
              </View>

              <Text style={styles.disputeReason}>{d.reason}</Text>

              {d.isResolved ? (
                <View style={styles.resolvedBox}>
                  <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '600' }}>
                    Multisig Decision:
                  </Text>
                  <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '700', marginTop: 2 }}>
                    {d.outcome}
                  </Text>
                  <Text style={{ color: '#697089', fontSize: 10, marginTop: 2, fontFamily: 'monospace' }}>
                    Tx: {d.resolvedTxHash}
                  </Text>
                </View>
              ) : (
                <View style={styles.pendingBox}>
                  <Icon name="clock" size={14} color="#D97706" />
                  <Text style={styles.pendingText}>
                    Awaiting 2-of-3 Arbitrator Signatures...
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF8EA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  introIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  introDesc: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
    padding: 18,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  targetBadge: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B4DFF',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#697089',
    marginTop: 12,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1.5,
    borderColor: '#E3E7F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1A1D2E',
  },
  textArea: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1.5,
    borderColor: '#E3E7F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1A1D2E',
    height: 90,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D2E',
    marginTop: 4,
  },
  disputeCard: {
    padding: 16,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D2E',
  },
  disputeReason: {
    fontSize: 13,
    color: '#4A5068',
    marginVertical: 10,
    lineHeight: 18,
  },
  resolvedBox: {
    backgroundColor: '#E8FAF3',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#C6F4E2',
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF8EA',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
});
