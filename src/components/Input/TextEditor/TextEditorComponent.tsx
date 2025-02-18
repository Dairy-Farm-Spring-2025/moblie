import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  actions,
  RichEditor,
  RichEditorProps,
  RichToolbar,
} from 'react-native-pell-rich-editor';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface TextEditorComponentProps extends RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: any;
}

const TextEditorComponent: React.FC<TextEditorComponentProps> = ({
  value,
  onChange,
  error,
  ...props
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const richTextRef = useRef<RichEditor>(null);
  const handleHead2 = ({ tintColor }: any) => (
    <Text style={{ color: tintColor }}>H2</Text>
  );

  const handleHead3 = ({ tintColor }: any) => (
    <Text style={{ color: tintColor }}>H3</Text>
  );

  const handleSave = () => {
    richTextRef.current?.blurContentEditor(); // Dismiss keyboard
    setModalVisible(false); // Close modal
  };

  return (
    <View style={styles.container}>
      {/* Open Editor Button */}
      <TouchableOpacity
        style={styles.openEditorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text numberOfLines={1} style={styles.valuePreview}>
          {value
            ? value.replace(/(<([^>]+)>)/gi, '').slice(0, 50) || 'Edit'
            : 'Open Editor'}
        </Text>
      </TouchableOpacity>

      {/* Validation Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
          <View style={styles.editorWrapper}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
              }}
            >
              <Text style={styles.modalTitle}>Edit Your Text</Text>
              <TouchableOpacity
                style={{
                  height: 20,
                }}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>
            {/* Rich Text Editor */}
            <RichEditor
              {...props}
              ref={richTextRef}
              initialContentHTML={value}
              onChange={onChange}
              placeholder="Start typing here..."
              style={styles.richEditor}
              editorStyle={{
                backgroundColor: '#f9f9f9',
                color: '#333',
                placeholderColor: '#888',
              }}
            />
            {/* Rich Text Toolbar */}
            <RichToolbar
              editor={richTextRef}
              actions={[
                actions.heading2,
                actions.heading3,
                actions.removeFormat,
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.setStrikethrough,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.insertLink,
                actions.alignCenter,
                actions.alignLeft,
                actions.alignRight,
                actions.alignFull,
              ]}
              style={styles.toolbar}
              iconMap={{
                [actions.heading2]: handleHead2,
                [actions.heading3]: handleHead3,
              }}
            />
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  openEditorButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  valuePreview: {
    color: '#555',
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editorWrapper: {
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  richEditor: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
  },
  toolbar: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TextEditorComponent;
