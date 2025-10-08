import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Button,
  Pressable,
  Modal,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { NativeViewGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import ModalSheet, { ModalSheetRef } from '../../react-native-modal-sheet/src/ModalSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ExampleType = 'actions' | 'form' | 'scroll' | 'large' | 'small' | 'draggable' | 'dynamic' | 'dynamicSmall' | 'dynamicMedium' | 'dynamicLarge' | 'snapPoints';

type DraggableItem = {
  key: string;
  label: string;
  backgroundColor: string;
};

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  height: number;
  children: React.ReactNode;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, height, children }) => {
  const [contentHeight, setContentHeight] = useState(300);
  const effectiveHeight = height > 0 ? height : contentHeight;

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 125) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleContentLayout = (event: any) => {
    if (height === 0) {
      const { height: measuredHeight } = event.nativeEvent.layout;
      // Add padding for handle and margins
      const totalHeight = Math.max(150, Math.min(measuredHeight + 100, SCREEN_HEIGHT * 0.9));
      setContentHeight(totalHeight);
    }
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && height === 0) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        useNativeDriver: true,
      }).start();
    }
  }, [contentHeight, visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={closeSheet}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable onPress={closeSheet} style={styles.backdrop}>
            <Animated.View
              style={[
                styles.backdropAnimated,
                {
                  opacity: backdropOpacity,
                },
              ]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.modalContent,
              {
                height: effectiveHeight,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handleArea} {...handlePanResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
            <View onLayout={handleContentLayout}>
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const getColor = (index: number) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[index % colors.length];
};

export default function ExamplesScreen() {
  const [activeExample, setActiveExample] = useState<ExampleType | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const snapPointSheetRef = useRef<ModalSheetRef>(null);

  const initialData: DraggableItem[] = [...Array(8)].map((_, index) => ({
    key: `item-${index}`,
    label: `Item ${index + 1}`,
    backgroundColor: getColor(index),
  }));

  const [data, setData] = useState(initialData);

  const getSheetHeight = (type: ExampleType): number => {
    switch (type) {
      case 'actions': return 300;
      case 'form': return 450;
      case 'scroll': return 600;
      case 'large': return 700;
      case 'small': return 200;
      case 'draggable': return 550;
      case 'dynamic': return 0; // Auto-size based on content
      case 'dynamicSmall': return 0; // Auto-size based on content
      case 'dynamicMedium': return 0; // Auto-size based on content
      case 'dynamicLarge': return 0; // Auto-size based on content
      case 'snapPoints': return 0; // Using snap points instead
      default: return 400;
    }
  };

  const renderSheetContent = () => {
    switch (activeExample) {
      case 'actions':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Choose an Action</Text>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={styles.buttonText}>Share</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.secondaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={styles.secondaryButtonText}>Save to Gallery</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.dangerButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.cancelButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => setActiveExample(null)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        );

      case 'form':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Contact Us</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your Message"
              multiline
              numberOfLines={4}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
            />
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
          </View>
        );

      case 'scroll':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Select a Country</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
                'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Australia', 'New Zealand',
                'South Korea', 'Singapore', 'Netherlands', 'Belgium', 'Sweden', 'Norway'].map((country) => (
                <Pressable
                  key={country}
                  style={({ pressed }) => [
                    styles.listItem,
                    { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
                  ]}
                >
                  <Text style={styles.listItemText}>{country}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );

      case 'large':
        return (
          <ScrollView style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Terms of Service</Text>
            <Text style={styles.bodyText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              {'\n\n'}
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              {'\n\n'}
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              {'\n\n'}
              Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
              {'\n\n'}
              Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
          </ScrollView>
        );

      case 'small':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Quick Settings</Text>
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
              >
                <Text style={styles.iconButtonText}>🌙</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
              >
                <Text style={styles.iconButtonText}>🔔</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
              >
                <Text style={styles.iconButtonText}>⚙️</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
              >
                <Text style={styles.iconButtonText}>📱</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'draggable':
        const renderItem = ({ item, drag, isActive }: RenderItemParams<DraggableItem>) => {
          return (
            <ScaleDecorator>
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={drag}
                disabled={isActive}
                delayLongPress={70}
                style={[
                  styles.draggableRowItem,
                  {
                    backgroundColor: item.backgroundColor,
                    opacity: isActive ? 0.5 : 1,
                    transform: [{ scale: isActive ? 1.02 : 1 }],
                  },
                ]}
              >
                <Text style={styles.draggableRowText}>{item.label}</Text>
              </TouchableOpacity>
            </ScaleDecorator>
          );
        };

        return (
          <View style={{ height: 550 - 72, paddingTop: 10 }}>
            <Text style={styles.sheetTitle}>Drag & Drop List</Text>
            <DraggableFlatList
              data={data}
              onDragEnd={({ data: newData }) => setData(newData)}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              animationConfig={{
                damping: 20,
                stiffness: 100,
              }}
            />
          </View>
        );

      case 'dynamicSmall':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Small Auto-Sized Content</Text>
            <Text style={styles.dynamicSubtitle}>
              Just a single message with minimal content.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => setActiveExample(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        );

      case 'dynamicMedium':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Medium Auto-Sized Content</Text>
            <Text style={styles.dynamicSubtitle}>
              This modal has medium-sized content to demonstrate auto-sizing.
            </Text>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Feature 1</Text>
              <Text style={styles.dynamicCardText}>
                The modal automatically calculates the height needed for this content.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Feature 2</Text>
              <Text style={styles.dynamicCardText}>
                No manual height configuration required.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Feature 3</Text>
              <Text style={styles.dynamicCardText}>
                Perfect fit for varying content lengths.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => setActiveExample(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        );

      case 'dynamicLarge':
        return (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Large Auto-Sized Content</Text>
            <Text style={styles.dynamicSubtitle}>
              This example shows how the modal handles larger amounts of content while staying within the maxHeight constraint.
            </Text>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Section 1: Introduction</Text>
              <Text style={styles.dynamicCardText}>
                Auto-sizing modals are incredibly useful when you have varying content that changes based on user interaction, API responses, or dynamic data. The modal automatically adjusts to fit the content perfectly.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Section 2: Benefits</Text>
              <Text style={styles.dynamicCardText}>
                You don't need to calculate heights manually or create multiple modal variants for different content sizes. The component handles everything automatically, making your code cleaner and more maintainable.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Section 3: Use Cases</Text>
              <Text style={styles.dynamicCardText}>
                Perfect for forms with conditional fields, product details with varying descriptions, user profiles with different amounts of information, notifications with variable message lengths, and much more.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Section 4: Constraints</Text>
              <Text style={styles.dynamicCardText}>
                The modal respects both minHeight and maxHeight constraints. If content exceeds maxHeight, you can make the content scrollable. The default maxHeight is 90% of the screen height.
              </Text>
            </View>
            <View style={styles.dynamicCard}>
              <Text style={styles.dynamicCardTitle}>Section 5: Performance</Text>
              <Text style={styles.dynamicCardText}>
                Built using React Native's onLayout callback for efficient measurement. The height calculation happens instantly without noticeable delays or jank.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => setActiveExample(null)}
            >
              <Text style={styles.buttonText}>Got It!</Text>
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Bottom Sheet Examples</Text>

      <ScrollView style={styles.examplesList}>
        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('actions')}
        >
          <Text style={styles.exampleButtonText}>Action Buttons (300px)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('form')}
        >
          <Text style={styles.exampleButtonText}>Form Input (450px)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('scroll')}
        >
          <Text style={styles.exampleButtonText}>Scrollable List (600px)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('large')}
        >
          <Text style={styles.exampleButtonText}>Large Content (700px)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('small')}
        >
          <Text style={styles.exampleButtonText}>Small Sheet (200px)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('draggable')}
        >
          <Text style={styles.exampleButtonText}>🎯 Draggable List (550px)</Text>
        </Pressable>

        <Text style={styles.sectionHeader}>Auto-Sizing Examples</Text>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            styles.dynamicButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('dynamicSmall')}
        >
          <Text style={styles.exampleButtonText}>📦 Small Content (Auto)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            styles.dynamicButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('dynamicMedium')}
        >
          <Text style={styles.exampleButtonText}>📦 Medium Content (Auto)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            styles.dynamicButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => setActiveExample('dynamicLarge')}
        >
          <Text style={styles.exampleButtonText}>📦 Large Content (Auto)</Text>
        </Pressable>

        <Text style={styles.sectionHeader}>Snap Points Example</Text>

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            styles.snapPointsButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => {
            setActiveExample('snapPoints');
            setCurrentSnapIndex(0);
            setTimeout(() => snapPointSheetRef.current?.open(), 100);
          }}
        >
          <Text style={styles.exampleButtonText}>🎯 Snap Points (NEW)</Text>
        </Pressable>
      </ScrollView>

      {activeExample && activeExample !== 'snapPoints' && (
        <CustomBottomSheet
          visible={!!activeExample}
          onClose={() => setActiveExample(null)}
          height={getSheetHeight(activeExample)}
        >
          {renderSheetContent()}
        </CustomBottomSheet>
      )}

      {/* Snap Points Modal using ModalSheet component */}
      <ModalSheet
        ref={snapPointSheetRef}
        snapPoints={[0.3, 0.6, 0.9]}
        initialSnapIndex={0}
        onSnapPointChange={(index) => setCurrentSnapIndex(index)}
        onClose={() => setActiveExample(null)}
        backgroundColor="white"
        borderRadius={20}
        showHandle={true}
        containerStyle={{ paddingBottom: 40 }}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.sheetTitle}>🎯 Snap Points Demo</Text>
          <Text style={styles.dynamicSubtitle}>
            Drag the sheet up or down to snap between different heights!
          </Text>

          <View style={styles.snapIndicator}>
            <Text style={styles.snapIndicatorText}>
              Current Position: {currentSnapIndex === 0 ? 'Small (30%)' : currentSnapIndex === 1 ? 'Medium (60%)' : 'Large (90%)'}
            </Text>
          </View>

          <View style={styles.dynamicCard}>
            <Text style={styles.dynamicCardTitle}>⌨️ Keyboard Test</Text>
            <Text style={styles.dynamicCardText}>
              Test how the keyboard interacts with snap points:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Type something here..."
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Another input field..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.dynamicCard}>
            <Text style={styles.dynamicCardTitle}>📏 How Snap Points Work</Text>
            <Text style={styles.dynamicCardText}>
              • Drag the handle or sheet to move between positions{'\n'}
              • Release to snap to the nearest point{'\n'}
              • The sheet intelligently snaps to: 30%, 60%, or 90%{'\n'}
              • Swipe down from the smallest size to close
            </Text>
          </View>

          <Text style={styles.snapButtonsTitle}>Quick Navigation:</Text>
          <View style={styles.snapButtonsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                currentSnapIndex === 0 && styles.snapButtonActive,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => snapPointSheetRef.current?.snapToPoint(0)}
            >
              <Text style={[styles.snapButtonText, currentSnapIndex === 0 && styles.snapButtonTextActive]}>
                Small{'\n'}30%
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                currentSnapIndex === 1 && styles.snapButtonActive,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => snapPointSheetRef.current?.snapToPoint(1)}
            >
              <Text style={[styles.snapButtonText, currentSnapIndex === 1 && styles.snapButtonTextActive]}>
                Medium{'\n'}60%
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                currentSnapIndex === 2 && styles.snapButtonActive,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => snapPointSheetRef.current?.snapToPoint(2)}
            >
              <Text style={[styles.snapButtonText, currentSnapIndex === 2 && styles.snapButtonTextActive]}>
                Large{'\n'}90%
              </Text>
            </Pressable>
          </View>

          <View style={styles.dynamicCard}>
            <Text style={styles.dynamicCardTitle}>✨ Use Cases</Text>
            <Text style={styles.dynamicCardText}>
              Perfect for music players, maps, shopping carts, and any UI where users need quick access to different detail levels.
            </Text>
          </View>

          <View style={styles.dynamicCard}>
            <Text style={styles.dynamicCardTitle}>⚙️ Configuration</Text>
            <Text style={styles.dynamicCardText}>
              Define snap points as percentages (0.3 = 30%) or absolute pixel values (300 = 300px). You can have as many snap points as needed!
            </Text>
          </View>

          <View style={styles.dynamicCard}>
            <Text style={styles.dynamicCardTitle}>🎨 Customization</Text>
            <Text style={styles.dynamicCardText}>
              Control the initial snap point, enable scroll-to-expand behavior, and receive callbacks when snap points change.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              { opacity: pressed ? 0.8 : 1, marginTop: 10 }
            ]}
            onPress={() => {
              snapPointSheetRef.current?.close();
              setActiveExample(null);
            }}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </ScrollView>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 50,
    textAlign: 'center',
  },
  examplesList: {
    flex: 1,
  },
  exampleButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  exampleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handleArea: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  sheetContent: {
    paddingBottom: 10,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  actionButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  listItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  iconButton: {
    width: 60,
    height: 60,
    backgroundColor: '#F2F2F7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: -10,
  },
  draggableRowItem: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  draggableRowText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dynamicButton: {
    backgroundColor: '#FF2D55',
  },
  dynamicSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  dynamicCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  dynamicCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  dynamicCardText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 5,
  },
  snapPointsButton: {
    backgroundColor: '#34C759',
  },
  snapIndicator: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  snapIndicatorText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  snapButtonsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    marginTop: 5,
  },
  snapButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  snapButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  snapButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  snapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  snapButtonTextActive: {
    color: '#34C759',
    fontWeight: '700',
  },
});
