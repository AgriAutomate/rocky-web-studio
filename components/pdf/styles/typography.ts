/**
 * Typography Styles for Capability Statement PDF
 * @react-pdf/renderer StyleSheet
 */

import { StyleSheet } from '@react-pdf/renderer';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 20,
  },
  h2: {
    fontSize: 28,
    fontWeight: 600, // Semibold
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 1.3,
    marginBottom: 20,
  },
  h3: {
    fontSize: 20,
    fontWeight: 600, // Semibold
    color: colors.text,
    lineHeight: 1.4,
    marginBottom: 12,
  },
  h4: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.accentGray,
    lineHeight: 1.4,
  },
  bullet: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
    paddingLeft: 20,
  },
});

