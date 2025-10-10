import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const loginStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
  registerLink: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});

export const registerStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 32,
    paddingBottom: 64,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subheading: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
  roleSwitcher: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e5f3f2',
    borderRadius: 999,
    padding: 6,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  signInLink: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});

export const jobListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 48,
    color: colors.muted,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const jobDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    color: colors.muted,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    borderColor: colors.border,
  },
  textArea: {
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.card,
  },
});

export const myJobsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.muted,
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 24,
  },
  requesterContent: {
    paddingBottom: 64,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.card,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  inlineFields: {
    flexDirection: 'row',
    columnGap: 12,
  },
  inlineField: {
    flex: 1,
  },
});

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  role: {
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  meta: {
    color: colors.muted,
    marginBottom: 4,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
