import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
  findNodeHandle,
  UIManager,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Colors, Typography, Spacing, Radius, Shadow} from '../theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import {Medicine3DViewer} from '../components/Medicine3DViewer';
import {usePatient, BagItem} from '../store/PatientContext';
import LottieView from 'lottie-react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const BagChecklistScreen: React.FC = () => {
  const navigation = useNavigation();
  const {state, dispatch} = usePatient();

  // Description modal state
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const descriptionModalAnim = useRef(new Animated.Value(0)).current;

  const packedCount = state.bagChecklist.filter(i => i.packed).length;
  const totalItems = state.bagChecklist.length;
  const progress = totalItems > 0 ? packedCount / totalItems : 0;

  // Animated progress value for smooth transitions
  const progressAnim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Animated entrance for list items
  const itemAnims = useRef<Record<string, Animated.Value>>({}).current;
  useEffect(() => {
    const anims = state.bagChecklist.map((it, i) => {
      if (!itemAnims[it.id]) itemAnims[it.id] = new Animated.Value(0);
      return Animated.spring(itemAnims[it.id], {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      });
    });
    Animated.stagger(60, anims).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.bagChecklist]);

  // Pulse on toggle
  const pulseAnims = useRef<Record<string, Animated.Value>>({}).current;

  // Refs for measuring item and bag positions
  const itemRefs = useRef<Record<string, any>>({}).current;
  const bagRef = useRef<any>(null);

  // Flying item animation state
  const flyAnim = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const flyScale = useRef(new Animated.Value(1)).current;  const flyOpacity = useRef(new Animated.Value(0)).current;  const [flying, setFlying] = useState<null | {label: string}>(null);

  const measureNode = (ref: any): Promise<[number, number, number, number]> =>
    new Promise(resolve => {
      try {
        const handle = findNodeHandle(ref);
        if (!handle) return resolve([0, 0, 0, 0]);
        UIManager.measureInWindow(handle, (x: number, y: number, w: number, h: number) => {
          console.log('Measured:', x, y, w, h);
          resolve([x, y, w, h]);
        });
      } catch (e) {
        console.log('Measure error:', e);
        resolve([0, 0, 0, 0]);
      }
    });

  const handleToggle = async (item: BagItem) => {
    const ref = itemRefs[item.id];
    try {
      const [sx, sy, sw, sh] = ref ? await measureNode(ref) : [0, 0, 0, 0];
      const [bx, by, bw, bh] = bagRef.current ? await measureNode(bagRef.current) : [0, 0, 0, 0];

      console.log('Start:', sx, sy, 'Bag:', bx, by);

      const startX = sx + sw / 2;
      const startY = sy + sh / 2;
      const endX = bx + bw / 2;
      const endY = by + bh / 2;

      flyAnim.setValue({x: startX - 36, y: startY - 12});
      flyScale.setValue(1);
      flyOpacity.setValue(1);
      setFlying({label: item.label});

      // dispatch immediately
      dispatch({type: 'TOGGLE_BAG_ITEM', payload: item.id});
      if (!item.packed && item.description) {
        openDescriptionModal(item.description, item.asset);
      }

      Animated.parallel([
        Animated.timing(flyAnim.x, {toValue: endX - 20, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false}),
        Animated.timing(flyAnim.y, {toValue: endY - 20, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false}),
        Animated.timing(flyScale, {toValue: 0.8, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false}),
        Animated.timing(flyOpacity, {toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false}),
      ]).start(() => setTimeout(() => setFlying(null), 100));
    } catch (e) {
      console.log('Toggle error:', e);
      // safe fallback
      dispatch({type: 'TOGGLE_BAG_ITEM', payload: item.id});
    }

    if (!pulseAnims[item.id]) pulseAnims[item.id] = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(pulseAnims[item.id], {toValue: 1.08, duration: 120, useNativeDriver: true}),
      Animated.timing(pulseAnims[item.id], {toValue: 1, duration: 120, useNativeDriver: true}),
    ]).start();
  };

  // Celebration when progress reaches 100%
  const [celebrate, setCelebrate] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const prevProgress = useRef(progress);
  useEffect(() => {
    if (progress === 1 && prevProgress.current < 1) {
      setCelebrate(true);
      celebrateAnim.setValue(0);
      Animated.spring(celebrateAnim, {toValue: 1, friction: 6, useNativeDriver: true}).start();
      setTimeout(() => setCelebrate(false), 1600);
    }
    prevProgress.current = progress;
  }, [progress, celebrateAnim]);

  const handleRemoveItem = (id: string, label: string) => {
    Alert.alert('Eşyayı Sil', `"${label}" listeden kaldırılsın mı?`, [
      {text: 'İptal', style: 'cancel'},
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => dispatch({type: 'REMOVE_BAG_ITEM', payload: id}),
      },
    ]);
  };

  const openDescriptionModal = (description: string, asset?: string) => {
    setSelectedDescription(description);
    setSelectedAsset(asset || null);
    setShowDescriptionModal(true);
    descriptionModalAnim.setValue(0);
    Animated.spring(descriptionModalAnim, {toValue: 1, friction: 8, useNativeDriver: true}).start();
  };

  const closeDescriptionModal = () => {
    Animated.timing(descriptionModalAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => {
      setShowDescriptionModal(false);
      setSelectedDescription(null);
      setSelectedAsset(null);
    });
  };

  return (
    <View style={styles.screen}>
      <Header title="Hastane Çantası" subtitle="AR ile eşya kontrolü" onBack={() => navigation.goBack()} />
      

      {/* Özet */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hazırlanan</Text>
          <Text style={styles.summaryCount}>
            <Text style={styles.countPacked}>{packedCount}</Text>
            <Text style={styles.countTotal}> / {totalItems}</Text>
          </Text>
        </View>
        <ProgressBar
          value={progress}
          animatedValue={progressAnim}
          color={Colors.warning}
          height={8}
          showPercent
          style={styles.progressBar}
        />
      </View>

      {/* Bag visual (wide) */}
      <View
        ref={r => { bagRef.current = r; }}
        style={styles.bagContainer}
        collapsable={false}>
        <View style={styles.bagInner}><Text style={styles.bagEmoji}>🧳</Text></View>
      </View>

      {/* Eşya listesi */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>

        {/* Eksik eşyalar önce */}
        {[false, true].map(packedGroup =>
          state.bagChecklist
            .filter(i => i.packed === packedGroup)
            .map((item, index) => {
              const entrance = itemAnims[item.id] || new Animated.Value(1);
              const pulse = pulseAnims[item.id] || new Animated.Value(1);
              return (
                <AnimatedTouchable
                  key={item.id}
                  ref={r => { itemRefs[item.id] = r; }}
                  style={[
                    styles.itemCard,
                    item.packed && styles.itemCardPacked,
                    {
                      opacity: entrance.interpolate({inputRange: [0, 1], outputRange: [0, 1]}),
                      transform: [
                        {translateY: entrance.interpolate({inputRange: [0, 1], outputRange: [10, 0]})},
                        {scale: pulse},
                      ],
                    },
                  ]}
                  onPress={() => handleToggle(item)}
                  onLongPress={() => handleRemoveItem(item.id, item.label)}>
                  <View
                    style={[
                      styles.checkbox,
                      item.packed
                        ? styles.checkboxChecked
                        : item.critical
                        ? styles.checkboxCritical
                        : styles.checkboxEmpty,
                    ]}>
                    {item.packed && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  <View style={styles.itemInfo}>
                    <View style={styles.itemLabelRow}>
                      <Text
                        style={[
                          styles.itemLabel,
                          item.packed && styles.itemLabelPacked,
                        ]}>
                        {item.label}
                      </Text>
                      {item.critical && !item.packed && (
                        <Text style={styles.criticalBadge}>⚠ Kritik</Text>
                      )}
                    </View>
                    {item.description && (
                      <TouchableOpacity onPress={() => openDescriptionModal(item.description!, item.asset)}>
                        <View style={styles.descriptionCard}>
                          <Text
                            style={[
                              styles.itemDescription,
                              item.packed && styles.itemDescriptionPacked,
                            ]}>
                            {item.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {item.critical && !item.packed && (
                      <Text style={styles.criticalBadge}>⚠ Kritik</Text>
                    )}
                  </View>

                  {!item.packed && (
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: item.critical
                            ? Colors.danger + '33'
                            : Colors.bgElevated,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: item.critical
                              ? Colors.arRed
                              : Colors.textDisabled,
                          },
                        ]}>
                        {item.critical ? 'Eksik!' : 'Bekliyor'}
                      </Text>
                    </View>
                  )}
                </AnimatedTouchable>
              );
            }),
        )}
      </ScrollView>
      {/* Flying clone */}
      {flying && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingItem,
            flyAnim.getLayout(),
            {
              transform: [{scale: flyScale}],
              opacity: flyOpacity,
            },
          ]}>
          <Text style={styles.flyingText}>{flying.label}</Text>
        </Animated.View>
      )}

      {/* Description Modal */}
      {showDescriptionModal && selectedDescription && (
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.descriptionModalOverlay,
            {
              opacity: descriptionModalAnim,
            },
          ]}>
          <TouchableOpacity style={styles.descriptionModalBackdrop} onPress={closeDescriptionModal} />
          <Animated.View
            style={[
              styles.descriptionModalContent,
              {
                transform: [
                  {
                    scale: descriptionModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: descriptionModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.descriptionModalTitle}>Açıklama</Text>
            {selectedAsset && (
              <View style={styles.assetContainer}>
                <Medicine3DViewer color="#1976D2" category="bag" medicineId={selectedAsset} />
              </View>
            )}
            <Text style={styles.descriptionModalText}>{selectedDescription}</Text>
            <TouchableOpacity style={styles.descriptionModalClose} onPress={closeDescriptionModal}>
              <Text style={styles.descriptionModalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {celebrate && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.celebrate,
            {
              transform: [
                {
                  scale: celebrateAnim.interpolate({inputRange: [0, 1], outputRange: [0.6, 1]}),
                },
              ],
              opacity: celebrateAnim,
            },
          ]}>
          <LottieView
            source={{uri: 'https://assets4.lottiefiles.com/packages/lf20_jmgekfqg.json'}}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.celebrateText}>🎉 Tüm eşyalar hazır!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.bgPrimary, position: 'relative'},
  

  summaryCard: {
    margin: Spacing.base,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  summaryCount: {},
  countPacked: {
    ...Typography.headingLarge,
    color: Colors.warning,
  },
  countTotal: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  progressBar: {},

  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  itemCardPacked: {
    opacity: 0.45,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  checkboxEmpty: {borderColor: Colors.textDisabled},
  checkboxChecked: {
    borderColor: Colors.arGreen,
    backgroundColor: Colors.successLight,
  },
  checkboxCritical: {
    borderColor: Colors.arRed,
    backgroundColor: Colors.dangerLight,
  },
  checkmark: {
    color: Colors.arGreen,
    fontWeight: '700',
    fontSize: 14,
  },
  itemInfo: {flex: 1},
  itemLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemLabelPacked: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
  itemDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  descriptionCard: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  itemDescriptionPacked: {
    color: Colors.textDisabled,
  },
  criticalBadge: {
    ...Typography.caption,
    color: Colors.arRed,
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.round,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },

  addSection: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  addTitle: {
    ...Typography.headingSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  criticalToggle: {
    width: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  criticalToggleActive: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  criticalToggleText: {fontSize: 18},
  addBtn: {
    width: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.low,
  },
  addBtnText: {
    fontSize: 24,
    color: Colors.bgPrimary,
    fontWeight: '700',
    lineHeight: 28,
  },
  celebrate: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  celebrateText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.warning,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 8,
  },
  bagContainer: {
    width: '92%',
    alignSelf: 'center',
    height: 120,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.low,
  },
  bagInner: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bagEmoji: {fontSize: 48},
  flyingItem: {
    position: 'absolute',
    zIndex: 40,
    backgroundColor: 'transparent',
  },
  flyingText: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    ...Typography.headingLarge,
    color: Colors.arGreen,
    ...Shadow.medium,
  },
  descriptionModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  descriptionModalContent: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    margin: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.high,
    maxWidth: 340,
    width: '85%',
  },
  assetContainer: {
    height: 280,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.bgElevated,
  },
  descriptionModalTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  descriptionModalText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  descriptionModalClose: {
    backgroundColor: Colors.brandBlue,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignSelf: 'center',
  },
  descriptionModalCloseText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  lottie: {width: 220, height: 140, alignSelf: 'center'},
});

export default BagChecklistScreen;
