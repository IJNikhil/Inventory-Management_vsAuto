import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noImageContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 13,
  },
  contentSection: {
    padding: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  partTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  partMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  byLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  supplierName: {
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailColumn: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '600',
    fontSize: 15,
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
  },
  stockBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  stockText: {
    fontWeight: '600',
    fontSize: 15,
  },
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  swiperContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
  },
  partImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  skeletonBase: {
    borderRadius: 8,
  },
  // Not Found Styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSubtitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  backPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backPrimaryBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export { SCREEN_WIDTH };
