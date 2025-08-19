import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
    paddingVertical: 24,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 16,
  },
  formCard: {
    borderRadius: 18,
    padding: 24,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrap: {
    padding: 12,
    borderWidth: 3,
    borderRadius: 999,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    gap: 4,
  },
  formItem: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    color: '#dc2626',
    marginLeft: 2,
    fontWeight: '700',
  },
  errorContainer: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  errorMsg: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    minHeight: 54,
  },
  loginBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  demoContainer: {
    marginTop: 28,
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    marginBottom: 2,
    fontWeight: '500',
  },
    textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 50,
  },
});
