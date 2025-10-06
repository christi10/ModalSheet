import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  SafeAreaView,
  Pressable,
} from 'react-native';
import ModalSheet, { ModalSheetRef } from 'react-native-modal-sheet';

export default function App() {
  const sheetRef = useRef<ModalSheetRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>React Native Modal Sheet</Text>
        <Text style={styles.subtitle}>Demo App</Text>

        <Button
          title="Open Bottom Sheet"
          onPress={() => sheetRef.current?.open()}
        />
      </View>

      <ModalSheet
        ref={sheetRef}
        height={400}
        onOpen={() => console.log('Sheet opened')}
        onClose={() => console.log('Sheet closed')}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Welcome! 👋</Text>

          <Text style={styles.description}>
            This is a demo of the react-native-modal-sheet component.
          </Text>

          <View style={styles.features}>
            <Text style={styles.feature}>✅ Smooth animations</Text>
            <Text style={styles.feature}>✅ Gesture support</Text>
            <Text style={styles.feature}>✅ Customizable</Text>
            <Text style={styles.feature}>✅ TypeScript ready</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => sheetRef.current?.close()}
          >
            <Text style={styles.closeButtonText}>Close Sheet</Text>
          </Pressable>
        </View>
      </ModalSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
