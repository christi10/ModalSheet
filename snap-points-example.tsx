import React, { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import ModalSheet, { ModalSheetRef } from './react-native-modal-sheet';

export default function SnapPointsExample() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<number>(0);

  const handleSnapPointChange = (index: number, snapPoint: number) => {
    setCurrentSnapPoint(snapPoint);
    console.log(`Snapped to point ${index}: ${snapPoint}%`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snap Points Demo</Text>
      <Text style={styles.subtitle}>Current position: {currentSnapPoint}%</Text>

      <Button title="Open Modal Sheet" onPress={() => sheetRef.current?.open()} />

      <View style={styles.buttonGroup}>
        <Button
          title="Snap to 25%"
          onPress={() => sheetRef.current?.snapToPoint(0)}
        />
        <Button
          title="Snap to 50%"
          onPress={() => sheetRef.current?.snapToPoint(1)}
        />
        <Button
          title="Snap to 90%"
          onPress={() => sheetRef.current?.snapToPoint(2)}
        />
      </View>

      <ModalSheet
        ref={sheetRef}
        snapPoints={[25, 50, 90]}
        initialSnapPointIndex={1}
        onSnapPointChange={handleSnapPointChange}
        onOpen={() => console.log('Sheet opened')}
        onClose={() => console.log('Sheet closed')}
      >
        <ScrollView>
          <Text style={styles.sheetTitle}>Snap Points Modal</Text>
          <Text style={styles.sheetText}>
            This modal sheet has three snap points:
          </Text>
          <Text style={styles.bulletPoint}>• 25% - Small peek</Text>
          <Text style={styles.bulletPoint}>• 50% - Medium view</Text>
          <Text style={styles.bulletPoint}>• 90% - Full screen</Text>

          <Text style={styles.sheetText}>
            {'\n'}Drag the handle up or down to snap between different heights.
            The modal will automatically snap to the nearest point when you release.
          </Text>

          <Text style={styles.sheetText}>
            {'\n'}You can also programmatically control the snap position using
            the snapToPoint() method with the index of your desired snap point.
          </Text>

          <Text style={styles.sheetText}>
            {'\n'}Current snap point: {currentSnapPoint}%
          </Text>

          {/* Add some filler content to demonstrate scrolling */}
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.contentBlock}>
              <Text style={styles.contentTitle}>Content Block {i}</Text>
              <Text style={styles.contentText}>
                This is sample content to demonstrate scrolling within the modal
                sheet at different snap points. Try swiping up to expand the
                modal to see more content.
              </Text>
            </View>
          ))}
        </ScrollView>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    marginLeft: 20,
  },
  contentBlock: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
