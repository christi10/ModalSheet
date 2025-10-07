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
import ModalSheet, { ModalSheetRef } from '../../react-native-modal-sheet/src';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ExampleType = 'actions' | 'form' | 'scroll' | 'large' | 'small' | 'draggable' | 'snappoints';

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
  const translateY = useRef(new Animated.Value(height)).current;
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
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      translateY.setValue(height);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

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
                height,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handleArea} {...handlePanResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
            {children}
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
  const snapPointsSheetRef = useRef<ModalSheetRef>(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<number>(50);

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
          <View style={{ flex: 1, paddingTop: 10 }}>
            <Text style={styles.sheetTitle}>Drag & Drop List</Text>
            <DraggableFlatList
              data={data}
              onDragEnd={({ data: newData }) => setData(newData)}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              containerStyle={{ flex: 1 }}
              animationConfig={{
                damping: 20,
                stiffness: 100,
              }}
            />
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

        <Pressable
          style={({ pressed }) => [
            styles.exampleButton,
            styles.snapPointsButton,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={() => snapPointsSheetRef.current?.open()}
        >
          <Text style={styles.exampleButtonText}>📍 Snap Points (25%, 50%, 90%)</Text>
        </Pressable>
      </ScrollView>

      {activeExample && activeExample !== 'snappoints' && (
        <CustomBottomSheet
          visible={!!activeExample}
          onClose={() => setActiveExample(null)}
          height={getSheetHeight(activeExample)}
        >
          {renderSheetContent()}
        </CustomBottomSheet>
      )}

      <ModalSheet
        ref={snapPointsSheetRef}
        snapPoints={[25, 50, 90]}
        initialSnapPointIndex={1}
        onSnapPointChange={(index, snapPoint) => {
          setCurrentSnapPoint(snapPoint);
        }}
        backgroundColor="#FFFFFF"
        borderRadius={20}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>📍 Snap Points Demo</Text>
          <Text style={styles.subtitle}>Current Position: {currentSnapPoint}%</Text>

          <View style={styles.snapPointInfo}>
            <Text style={styles.infoText}>
              This modal sheet has three snap points that you can swipe between:
            </Text>
            <Text style={[styles.bulletPoint, currentSnapPoint === 25 && styles.activeBullet]}>
              • 25% - Small peek view
            </Text>
            <Text style={[styles.bulletPoint, currentSnapPoint === 50 && styles.activeBullet]}>
              • 50% - Medium view
            </Text>
            <Text style={[styles.bulletPoint, currentSnapPoint === 90 && styles.activeBullet]}>
              • 90% - Full screen view
            </Text>
          </View>

          <View style={styles.controlButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: currentSnapPoint === 25 ? '#007AFF' : '#E5E5EA' }
              ]}
              onPress={() => snapPointsSheetRef.current?.snapToPoint(0)}
            >
              <Text style={[styles.snapButtonText, { color: currentSnapPoint === 25 ? 'white' : '#333' }]}>
                25%
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: currentSnapPoint === 50 ? '#007AFF' : '#E5E5EA' }
              ]}
              onPress={() => snapPointsSheetRef.current?.snapToPoint(1)}
            >
              <Text style={[styles.snapButtonText, { color: currentSnapPoint === 50 ? 'white' : '#333' }]}>
                50%
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.snapButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: currentSnapPoint === 90 ? '#007AFF' : '#E5E5EA' }
              ]}
              onPress={() => snapPointsSheetRef.current?.snapToPoint(2)}
            >
              <Text style={[styles.snapButtonText, { color: currentSnapPoint === 90 ? 'white' : '#333' }]}>
                90%
              </Text>
            </Pressable>
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>💡 How to use:</Text>
            <Text style={styles.instructionsText}>
              • Drag the handle up or down to snap between heights{'\n'}
              • The modal automatically snaps to the nearest point{'\n'}
              • Use the buttons above for programmatic control{'\n'}
              • Fast swipes change snap points more quickly
            </Text>
          </View>

          {/* Sample content blocks */}
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.contentBlock}>
              <Text style={styles.contentBlockTitle}>Content Block {i}</Text>
              <Text style={styles.contentBlockText}>
                This is sample content to demonstrate scrolling at different snap points.
                Try expanding the modal to 90% to see all content comfortably.
              </Text>
            </View>
          ))}

          <View style={styles.featureHighlight}>
            <Text style={styles.featureTitle}>✨ Key Features</Text>
            <Text style={styles.featureText}>
              • Percentage-based heights for cross-device compatibility{'\n'}
              • Smooth spring animations{'\n'}
              • Velocity-based snap detection{'\n'}
              • Fully customizable snap points{'\n'}
              • TypeScript support
            </Text>
          </View>
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
    flex: 1,
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
  snapPointsButton: {
    backgroundColor: '#34C759',
  },
  snapPointInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    marginVertical: 4,
    lineHeight: 22,
  },
  activeBullet: {
    color: '#007AFF',
    fontWeight: '700',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  snapButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  snapButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsBox: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  contentBlock: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentBlockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contentBlockText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureHighlight: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B8860B',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
