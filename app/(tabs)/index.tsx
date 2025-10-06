import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ModalSheet</Text>
      <Text style={styles.subtitle}>
        A powerful React Native modal sheet component with smooth animations and gesture support.
      </Text>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>✨ Features</Text>
        <Text style={styles.feature}>• Smooth gesture-driven animations</Text>
        <Text style={styles.feature}>• Spring physics for natural feel</Text>
        <Text style={styles.feature}>• Backdrop with tap-to-dismiss</Text>
        <Text style={styles.feature}>• Customizable content and styling</Text>
        <Text style={styles.feature}>• TypeScript support</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/examples')}
      >
        <Text style={styles.buttonText}>View Examples</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  feature: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
