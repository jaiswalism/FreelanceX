import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { defaultTheme } from '../../theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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
  const { colors } = defaultTheme;
  const [reason, setReason] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchDisputes = async () => {
    try {
      const res = await ApiClient.getProjectDisputes(projectId);
      if (res.success) {
        setDisputes(res.disputes || []);
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
      Alert.alert('Required', 'Please enter a reason for initiating the dispute.');
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
        'Dispute Initiated',
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
    <View style={[styles.container, { backgroundColor: colors.background.app }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: colors.brand.primary, fontWeight: '700' }}>← Back</Text>
      </TouchableOpacity>

      <Header title="Multisig Dispute Arbitration" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Text style={[styles.introTitle, { color: colors.semantic.warning }]}>2-of-3 Multisig Arbitration</Text>
          <Text style={[styles.introDesc, { color: colors.text.secondary }]}>
            Disputes freeze milestone funds on-chain. Independent signers review uploaded evidence and execute multisig consensus (`PAY_FREELANCER`, `REFUND_CLIENT`, or `SPLIT_FUNDS`).
          </Text>
        </Card>

        {/* Raise New Dispute Form */}
        <Card style={styles.formCard}>
          <Text style={[styles.formTitle, { color: colors.text.primary }]}>Initiate Milestone Dispute</Text>
          <Text style={[styles.formSub, { color: colors.brand.primary }]}>Targeting Milestone #{milestoneIndex + 1}</Text>

          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Reason / Incident Details</Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border.default, color: colors.text.primary, height: 90 }]}
            placeholder="Describe breach of milestone terms or incomplete deliverable..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            value={reason}
            onChangeText={setReason}
          />

          <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>Evidence Link (GitHub PR, IPFS, Chat Log)</Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border.default, color: colors.text.primary }]}
            placeholder="https://github.com/... or ipfs://..."
            placeholderTextColor={colors.text.tertiary}
            value={evidenceUrl}
            onChangeText={setEvidenceUrl}
          />

          <Button
            title={submitting ? 'Submitting Dispute...' : 'Initiate Dispute'}
            onPress={handleRaiseOnChainDispute}
            loading={submitting}
            variant="secondary"
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Active & Resolved Disputes */}
        <Text style={[styles.sectionHeader, { color: colors.text.primary }]}>Project Dispute History</Text>
        {disputes.map((d, idx) => (
          <Card key={d.id || idx} style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Text style={[styles.disputeTitle, { color: colors.text.primary }]}>Dispute #{idx + 1}</Text>
              <Badge
                label={d.isResolved ? 'RESOLVED' : 'PENDING MULTISIG'}
                variant={d.isResolved ? 'success' : 'danger'}
              />
            </View>

            <Text style={[styles.disputeReason, { color: colors.text.secondary }]}>{d.reason}</Text>

            {d.isResolved ? (
              <View style={styles.resolvedBox}>
                <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Multisig Decision:</Text>
                <Text style={{ color: colors.semantic.success, fontSize: 13, fontWeight: '700' }}>{d.outcome}</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 10, marginTop: 2 }}>Tx: {d.resolvedTxHash}</Text>
              </View>
            ) : (
              <Text style={{ color: colors.semantic.warning, fontSize: 12, marginTop: 4 }}>Awaiting 2-of-3 Arbitrator Signatures...</Text>
            )}
          </Card>
        ))}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  introCard: {
    backgroundColor: '#1A140E',
    borderColor: '#F5B942',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  introDesc: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  formCard: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formSub: {
    fontSize: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  disputeCard: {
    padding: 14,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  disputeReason: {
    fontSize: 13,
    marginVertical: 8,
  },
  resolvedBox: {
    backgroundColor: 'rgba(94, 230, 181, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
});
