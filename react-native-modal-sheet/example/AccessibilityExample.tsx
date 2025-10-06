import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import ModalSheet, { ModalSheetRef } from 'react-native-modal-sheet';

const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
];

export default function AccessibilityExample() {
  const profileSheetRef = useRef<ModalSheetRef>(null);
  const formSheetRef = useRef<ModalSheetRef>(null);
  const menuSheetRef = useRef<ModalSheetRef>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Accessibility Examples
        </Text>

        <Text style={styles.description}>
          These examples demonstrate proper accessibility implementation
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => profileSheetRef.current?.open()}
          accessibilityRole="button"
          accessibilityLabel="Open profile options"
          accessibilityHint="Opens a sheet with profile-related actions"
        >
          <Text style={styles.buttonText}>Profile Options</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => formSheetRef.current?.open()}
          accessibilityRole="button"
          accessibilityLabel="Open contact form"
          accessibilityHint="Opens a form to send a message"
        >
          <Text style={styles.buttonText}>Contact Form</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => menuSheetRef.current?.open()}
          accessibilityRole="button"
          accessibilityLabel="Open country menu"
          accessibilityHint="Opens a menu to select a country"
        >
          <Text style={styles.buttonText}>Country Menu</Text>
        </Pressable>
      </View>

      {/* Profile Options Sheet */}
      <ModalSheet
        ref={profileSheetRef}
        height={300}
        accessibilityLabel="Profile options menu"
        accessibilityHint="Contains profile-related actions and settings"
        backdropAccessibilityLabel="Close profile options"
        openAccessibilityAnnouncement="Profile options opened"
        closeAccessibilityAnnouncement="Profile options closed"
        sheetAccessibilityProps={{
          accessibilityRole: "menu"
        }}
      >
        <View style={styles.sheetContent}>
          <Text
            style={styles.sheetTitle}
            accessibilityRole="header"
          >
            Profile Options
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
            ]}
            accessibilityRole="menuitem"
            accessibilityLabel="Edit profile information"
            accessibilityHint="Opens profile editing screen"
          >
            <Text style={styles.menuItemText}>✏️ Edit Profile</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
            ]}
            accessibilityRole="menuitem"
            accessibilityLabel="Account settings"
            accessibilityHint="Opens account settings screen"
          >
            <Text style={styles.menuItemText}>⚙️ Settings</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
            ]}
            accessibilityRole="menuitem"
            accessibilityLabel="Sign out"
            accessibilityHint="Signs out of your account"
          >
            <Text style={styles.menuItemText}>🚪 Sign Out</Text>
          </Pressable>
        </View>
      </ModalSheet>

      {/* Contact Form Sheet */}
      <ModalSheet
        ref={formSheetRef}
        height={400}
        accessibilityLabel="Contact form"
        accessibilityHint="Form to send us a message"
        backdropAccessibilityLabel="Close contact form"
        openAccessibilityAnnouncement="Contact form opened"
        closeAccessibilityAnnouncement="Contact form closed"
        accessibilityLiveRegion="polite"
      >
        <View style={styles.sheetContent}>
          <Text
            style={styles.sheetTitle}
            accessibilityRole="header"
          >
            Contact Us
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            accessibilityLabel="Your name"
            accessibilityHint="Enter your full name"
            accessibilityRole="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            accessibilityLabel="Email address"
            accessibilityHint="Enter a valid email address for replies"
            accessibilityRole="none"
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: (!formData.name || !formData.email) ? '#CCCCCC' : '#34C759'
              }
            ]}
            onPress={() => {
              // Handle form submission
              console.log('Form submitted:', formData);
            }}
            disabled={!formData.name || !formData.email}
            accessibilityRole="button"
            accessibilityLabel="Submit contact form"
            accessibilityHint="Sends your message to our support team"
            accessibilityState={{ disabled: !formData.name || !formData.email }}
          >
            <Text style={[
              styles.submitButtonText,
              { color: (!formData.name || !formData.email) ? '#999' : 'white' }
            ]}>
              Send Message
            </Text>
          </Pressable>
        </View>
      </ModalSheet>

      {/* Country Menu Sheet */}
      <ModalSheet
        ref={menuSheetRef}
        height={400}
        accessibilityLabel="Country selection menu"
        accessibilityHint="Select your country from the list"
        backdropAccessibilityLabel="Close country menu"
        openAccessibilityAnnouncement="Country menu opened"
        closeAccessibilityAnnouncement="Country menu closed"
        sheetAccessibilityProps={{
          accessibilityRole: "menu"
        }}
      >
        <View style={styles.sheetContent}>
          <Text
            style={styles.sheetTitle}
            accessibilityRole="header"
          >
            Select Country
          </Text>

          <ScrollView
            accessibilityRole="list"
            accessibilityLabel="List of countries"
          >
            {countries.map((country, index) => (
              <Pressable
                key={country.code}
                style={({ pressed }) => [
                  styles.countryItem,
                  { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
                ]}
                onPress={() => {
                  console.log('Selected country:', country.name);
                  menuSheetRef.current?.close();
                }}
                accessibilityRole="menuitem"
                accessibilityLabel={`Select ${country.name}`}
                accessibilityHint={`Country code ${country.code}`}
                accessibilityState={{
                  selected: false // You would track selection state here
                }}
              >
                <Text style={styles.countryText}>
                  {country.name}
                </Text>
                <Text style={styles.countryCode}>
                  {country.code}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  countryText: {
    fontSize: 16,
    color: '#333',
  },
  countryCode: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});
