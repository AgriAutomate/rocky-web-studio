/**
 * Layout Utilities for Capability Statement PDF
 * @react-pdf/renderer StyleSheet
 */

import { StyleSheet } from '@react-pdf/renderer';
import { colors } from './colors';

export const layout = StyleSheet.create({
  // Page container
  page: {
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  
  // Section spacing
  section: {
    marginBottom: 60,
  },
  
  // Two-column layout
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 40,
  },
  leftColumn: {
    width: '50%',
  },
  rightColumn: {
    width: '50%',
  },
  
  // Three-column layout
  threeColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 30,
  },
  column: {
    flex: 1, // Equal width
  },
  
  // 2x2 Grid
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
  },
  gridItem: {
    width: '48%', // 2 columns with gap
    marginBottom: 40,
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    padding: 20,
    border: `1px solid ${colors.accentGray}`,
    borderRadius: 4,
  },
  
  // Centered content
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  
  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 12,
    color: colors.accentGray,
  },
});

