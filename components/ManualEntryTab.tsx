import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, TextField, Button, Colors, Picker } from 'react-native-ui-lib';
import { ImagePlus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Shelf } from '@/store/slices/shelvesSlice';

interface ManualEntryTabProps {
  onAddBook: (bookData: {
    title: string;
    author: string;
    isbn?: string;
    coverUri?: string;
    shelfId: string;
  }) => void;
  shelves: Shelf[];
}

export function ManualEntryTab({ onAddBook, shelves }: ManualEntryTabProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>();
  const [selectedShelfId, setSelectedShelfId] = useState(shelves[0]?.id || '');

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !author.trim() || !selectedShelfId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim() || undefined,
      coverUri,
      shelfId: selectedShelfId,
    });

    // Reset form
    setTitle('');
    setAuthor('');
    setIsbn('');
    setCoverUri(undefined);
    setSelectedShelfId(shelves[0]?.id || '');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Заглавие *</Text>
          <TextField
            placeholder="Въведете заглавие на книгата"
            value={title}
            onChangeText={setTitle}
            containerStyle={styles.textFieldContainer}
            fieldStyle={styles.textFieldStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Автор *</Text>
          <TextField
            placeholder="Въведете име на автора"
            value={author}
            onChangeText={setAuthor}
            containerStyle={styles.textFieldContainer}
            fieldStyle={styles.textFieldStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>ISBN (По желание)</Text>
          <TextField
            placeholder="Въведете ISBN"
            value={isbn}
            onChangeText={setIsbn}
            containerStyle={styles.textFieldContainer}
            fieldStyle={styles.textFieldStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Рафт *</Text>
          <Picker
            placeholder="Изберете рафт"
            value={selectedShelfId}
            onChange={(value: string) => setSelectedShelfId(value)}
            topBarProps={{ title: 'Изберете рафт' }}
            style={styles.picker}
          >
            {shelves.map((shelf) => (
              <Picker.Item key={shelf.id} value={shelf.id} label={shelf.name} />
            ))}
          </Picker>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cover Image (Optional)</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePicker}
          >
            {coverUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: coverUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Text style={styles.changeImageText}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.imagePickerContent}>
                <ImagePlus size={32} color={Colors.grey50} />
                <Text style={styles.imagePickerText}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Button
          label="Добави книга"
          backgroundColor={Colors.blue30}
          onPress={handleSubmit}
          disabled={!title.trim() || !author.trim() || !selectedShelfId}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textFieldContainer: {
    marginBottom: 0,
  },
  textFieldStyle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: Colors.grey40,
    marginTop: 8,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    objectFit: 'cover',
    marginBottom: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: Colors.blue30,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 16,
  },
});
