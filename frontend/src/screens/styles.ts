import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  loginWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    width: '100%',
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginSubtitle: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
  loginRegisterLink: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },

  registerWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  registerContent: {
    paddingTop: 32,
    paddingBottom: 64,
  },
  registerHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  registerSubheading: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
  registerRoleSwitcher: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e5f3f2',
    borderRadius: 999,
    padding: 6,
  },
  registerRoleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  registerRoleButtonActive: {
    backgroundColor: colors.primary,
  },
  registerRoleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  registerRoleButtonTextActive: {
    color: '#fff',
  },
  registerMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  registerSignInLink: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },

  jobListContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  jobListHeader: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: colors.text,
  },
  jobListErrorText: {
    color: colors.danger,
    marginBottom: 12,
  },
  jobListContent: {
    paddingBottom: 32,
  },
  jobListEmptyText: {
    textAlign: 'center',
    marginTop: 48,
    color: colors.muted,
  },
  jobListCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  jobDetailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  jobDetailContent: {
    padding: 20,
    paddingBottom: 40,
  },
  jobDetailLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  jobDetailMeta: {
    color: colors.muted,
    marginBottom: 8,
  },
  jobDetailSection: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  jobDetailSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  jobDetailBodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },
  jobDetailBullet: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  jobDetailInput: {
    borderColor: colors.border,
  },
  jobDetailTextArea: {
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.card,
  },

  myJobsContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  myJobsHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: colors.text,
  },
  myJobsListContent: {
    paddingBottom: 32,
  },
  myJobsCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  myJobsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  myJobsCardMeta: {
    color: colors.muted,
    marginBottom: 4,
  },
  myJobsEmpty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 24,
  },
  myJobsRequesterContent: {
    paddingBottom: 64,
  },
  myJobsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  myJobsTextArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.card,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  myJobsInlineFields: {
    flexDirection: 'row',
    columnGap: 12,
  },
  myJobsInlineField: {
    flex: 1,
  },

  profileContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  profileHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  profileRole: {
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  profileMeta: {
    color: colors.muted,
    marginBottom: 4,
  },
  profileSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  profileBody: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
