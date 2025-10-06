import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">About Bottom Sheet</ThemedText>
      <ThemedText style={styles.text}>
        This bottom sheet component features:
      </ThemedText>
      <ThemedView style={styles.list}>
        <ThemedText style={styles.listItem}>✓ Smooth gesture-based interactions</ThemedText>
        <ThemedText style={styles.listItem}>✓ Spring physics animations</ThemedText>
        <ThemedText style={styles.listItem}>✓ Backdrop with tap-to-close</ThemedText>
        <ThemedText style={styles.listItem}>✓ Ref-based API for programmatic control</ThemedText>
        <ThemedText style={styles.listItem}>✓ Customizable content</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  text: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
  },
  list: {
    gap: 10,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
  },
});
