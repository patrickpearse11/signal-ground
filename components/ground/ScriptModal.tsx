import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, ActivityIndicator, Linking,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { RepScript } from '@/types/ground'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  visible: boolean
  type: 'call' | 'email'
  repName: string
  repPhone: string
  repEmail: string
  script: RepScript | null
  isLoading: boolean
  onClose: () => void
}

export function ScriptModal({
  visible, type, repName, repPhone, repEmail,
  script, isLoading, onClose,
}: Props) {
  const [copied, setCopied] = useState(false)

  const scriptText = type === 'call' ? script?.call_script ?? '' : script?.email_body ?? ''

  async function handleCopy() {
    await Clipboard.setStringAsync(scriptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openDestination(withScript: boolean) {
    onClose()
    setTimeout(() => {
      if (type === 'call') {
        const cleaned = repPhone.replace(/\D/g, '')
        Linking.openURL(`tel:${cleaned}`)
      } else {
        // Some reps use a URL contact form instead of a direct email
        if (repEmail.startsWith('http')) {
          Linking.openURL(repEmail)
          return
        }
        if (withScript && script) {
          const subject = encodeURIComponent(script.email_subject || 'Constituent inquiry — Tarzana resident')
          const body = encodeURIComponent(scriptText)
          Linking.openURL(`mailto:${repEmail}?subject=${subject}&body=${body}`)
        } else {
          const subject = encodeURIComponent('Constituent inquiry — Tarzana resident')
          Linking.openURL(`mailto:${repEmail}?subject=${subject}`)
        }
      }
    }, 300)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerType}>
              {type === 'call' ? 'CALL SCRIPT' : 'EMAIL DRAFT'}
            </Text>
            <Text style={styles.headerRep}>{repName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Issue context */}
        {script?.issue_summary && (
          <View style={styles.issueBanner}>
            <Text style={styles.issueLabel}>ABOUT THIS ISSUE</Text>
            <Text style={styles.issueText}>{script.issue_summary}</Text>
          </View>
        )}

        {/* Script content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.ground.primary} />
              <Text style={styles.loadingText}>Generating your personalized script...</Text>
            </View>
          ) : script ? (
            <>
              {type === 'email' && script.email_subject && (
                <View style={styles.subjectRow}>
                  <Text style={styles.subjectLabel}>SUBJECT</Text>
                  <Text style={styles.subjectText}>{script.email_subject}</Text>
                </View>
              )}
              <View style={styles.scriptBox}>
                <Text style={styles.scriptText}>{scriptText}</Text>
              </View>
              <Text style={styles.placeholderNote}>
                Replace [your name] with your actual name before sending.
              </Text>
            </>
          ) : (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>
                Could not generate a script right now.{'\n'}You can still proceed without one.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          {script && !isLoading && (
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
              <Text style={styles.copyBtnText}>
                {copied ? '✓ Copied!' : 'Copy script'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={() => openDestination(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedBtnText}>
              {type === 'call' ? 'Open dialer' : 'Open mail'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openDestination(false)} activeOpacity={0.7}>
            <Text style={styles.skipText}>
              Skip script and {type === 'call' ? 'call' : 'email'} directly
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerType: {
    fontSize: 10,
    fontFamily: fonts.mono,
    color: colors.ground.primary,
    letterSpacing: 1,
    marginBottom: 3,
  },
  headerRep: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  closeBtnText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  issueBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.ground.primary,
  },
  issueLabel: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.ground.primary,
    letterSpacing: 1,
    marginBottom: 3,
  },
  issueText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  subjectRow: {
    marginBottom: spacing.sm,
  },
  subjectLabel: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  scriptBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  scriptText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 24,
  },
  placeholderNote: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  copyBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ground.primary,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ground.primary,
  },
  proceedBtn: {
    backgroundColor: colors.ground.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  proceedBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  skipText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
})
