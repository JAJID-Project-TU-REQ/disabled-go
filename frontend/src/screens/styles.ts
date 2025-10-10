import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  padHorizontal16: {
    paddingHorizontal: 16,
  },
  padHorizontal20: {
    paddingHorizontal: 20,
  },
  pad20: {
    padding: 20,
  },
  pad24: {
    padding: 24,
  },
  pb40: {
    paddingBottom: 40,
  },
  pb64: {
    paddingBottom: 64,
  },
  pt32: {
    paddingTop: 32,
  },
  mt12: {
    marginTop: 12,
  },
  mt16: {
    marginTop: 16,
  },
  mt20: {
    marginTop: 20,
  },
  mt24: {
    marginTop: 24,
  },
  mt32: {
    marginTop: 32,
  },
  mb4: {
    marginBottom: 4,
  },
  mb6: {
    marginBottom: 6,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  mv16: {
    marginVertical: 16,
  },
  authCard: {
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
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  headingPrimary: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 24,
  },
  link: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
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
  meta: {
    color: colors.muted,
    marginBottom: 8,
  },
  metaCompact: {
    color: colors.muted,
    marginBottom: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 24,
  },
  emptyLarge: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 48,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
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
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.card,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  textAreaSoft: {
    textAlignVertical: 'top',
    height: 120,
  },
  inlineFields: {
    flexDirection: 'row',
    columnGap: 12,
  },
  inlineField: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  roleLabel: {
    fontWeight: '600',
    color: colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
});
