import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text, Button, Colors, Picker, TextField } from 'react-native-ui-lib';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, Scan, Edit3, Save, X } from 'lucide-react-native';
import { Shelf } from '@/store/slices/shelvesSlice';

interface BookData {
  title: string;
  author: string;
  isbn: string;
  coverUri?: string;
}

interface ScanBooksTabProps {
  onAddBook: (bookData: {
    title: string;
    author: string;
    isbn?: string;
    coverUri?: string;
    shelfId: string;
  }) => void;
  shelves: Shelf[];
}

export function ScanBooksTab({ onAddBook, shelves }: ScanBooksTabProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedShelfId, setSelectedShelfId] = useState(shelves[0]?.id || '');
  const [scannedData, setScannedData] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<BookData | null>(null);

  const fetchBookFromGoogleBooks = async (
    isbn: string
  ): Promise<BookData | null> => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const book = data.items[0];
        const volumeInfo = book.volumeInfo;

        return {
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors?.[0] || 'Unknown Author',
          isbn: isbn,
          coverUri:
            volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') ||
            volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching book data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setIsScanning(false);

    // Extract ISBN from barcode data
    const isbn = data.trim();

    if (!isbn) {
      Alert.alert('Невалиден баркод', 'Не може да се извлече ISBN от баркода.');
      return;
    }

    // Fetch book data from Google Books API
    const bookData = await fetchBookFromGoogleBooks(isbn);

    if (bookData) {
      setScannedData(bookData);
      setEditedData(bookData);
    } else {
      Alert.alert(
        'Книгата не е намерена',
        'Не е намерена информация за книга с този ISBN. Можете да въведете данните ръчно.',
        [
          { text: 'Опитайте отново', onPress: () => setIsScanning(true) },
          {
            text: 'Въведете ръчно',
            onPress: () => {
              setScannedData({
                title: '',
                author: '',
                isbn: isbn,
                coverUri: undefined,
              });
              setEditedData({
                title: '',
                author: '',
                isbn: isbn,
                coverUri: undefined,
              });
              setIsEditing(true);
            },
          },
        ]
      );
    }
  };

  const handleSaveBook = () => {
    const dataToSave = isEditing ? editedData : scannedData;

    if (
      !dataToSave ||
      !dataToSave.title.trim() ||
      !dataToSave.author.trim() ||
      !selectedShelfId
    ) {
      Alert.alert('Грешка', 'Моля, попълнете всички задължителни полета');
      return;
    }

    onAddBook({
      title: dataToSave.title.trim(),
      author: dataToSave.author.trim(),
      isbn: dataToSave.isbn || undefined,
      coverUri: dataToSave.coverUri,
      shelfId: selectedShelfId,
    });

    // Reset state
    setScannedData(null);
    setEditedData(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(scannedData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(scannedData);
  };

  const handleSaveEdit = () => {
    setScannedData(editedData);
    setIsEditing(false);
  };

  // Platform check for camera availability
  const isCameraAvailable = Platform.OS !== 'web';

  if (!isCameraAvailable) {
    return (
      <View style={styles.webContainer}>
        <Camera size={48} color={Colors.grey50} />
        <Text style={styles.webTitle}>Камерата не е достъпна</Text>
        <Text style={styles.webSubtitle}>
          Сканирането на баркод не е достъпно в уеб версията. Моля, използвайте
          опцията за ръчно въвеждане.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={48} color={Colors.grey50} />
        <Text style={styles.permissionTitle}>
          Необходимо е разрешение за камера
        </Text>
        <Text style={styles.permissionSubtitle}>
          Нужен е достъп до камерата за сканиране на баркодове на книги
        </Text>
        <Button
          label="Дайте разрешение"
          backgroundColor={Colors.blue30}
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue30} />
        <Text style={styles.loadingText}>
          Зареждане на информация за книгата...
        </Text>
      </View>
    );
  }

  if (scannedData) {
    const displayData = isEditing ? editedData : scannedData;

    return (
      <View style={styles.container}>
        <View style={styles.scannedDataContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.scannedTitle}>
              {isEditing ? 'Редактиране на детайли' : 'Книгата е намерена!'}
            </Text>
            {!isEditing && (
              <Button
                iconSource={() => <Edit3 size={20} color={Colors.blue30} />}
                backgroundColor="transparent"
                onPress={handleEdit}
                style={styles.editButton}
              />
            )}
          </View>

          <View style={styles.bookPreview}>
            {displayData?.coverUri ? (
              <Image
                source={{ uri: displayData.coverUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Text style={styles.placeholderText}>Без корица</Text>
              </View>
            )}

            <View style={styles.bookDetails}>
              {isEditing ? (
                <>
                  <TextField
                    placeholder="Заглавие на книгата"
                    value={editedData?.title || ''}
                    onChangeText={(text) =>
                      setEditedData((prev) =>
                        prev ? { ...prev, title: text } : null
                      )
                    }
                    containerStyle={styles.editField}
                    fieldStyle={styles.editFieldStyle}
                  />
                  <TextField
                    placeholder="Автор"
                    value={editedData?.author || ''}
                    onChangeText={(text) =>
                      setEditedData((prev) =>
                        prev ? { ...prev, author: text } : null
                      )
                    }
                    containerStyle={styles.editField}
                    fieldStyle={styles.editFieldStyle}
                  />
                  <TextField
                    placeholder="ISBN"
                    value={editedData?.isbn || ''}
                    onChangeText={(text) =>
                      setEditedData((prev) =>
                        prev ? { ...prev, isbn: text } : null
                      )
                    }
                    containerStyle={styles.editField}
                    fieldStyle={styles.editFieldStyle}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.bookTitle}>{displayData?.title}</Text>
                  <Text style={styles.bookAuthor}>{displayData?.author}</Text>
                  <Text style={styles.bookIsbn}>ISBN: {displayData?.isbn}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.shelfSection}>
            <Text style={styles.shelfLabel}>Изберете рафт:</Text>
            <Picker
              placeholder="Изберете рафт"
              value={selectedShelfId}
              onChange={(value: string) => setSelectedShelfId(value)}
              topBarProps={{ title: 'Изберете рафт' }}
              style={styles.picker}
            >
              {shelves.map((shelf) => (
                <Picker.Item
                  key={shelf.id}
                  value={shelf.id}
                  label={shelf.name}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.buttons}>
            {isEditing ? (
              <>
                <Button
                  label="Отказ"
                  backgroundColor="transparent"
                  color={Colors.grey40}
                  iconSource={() => <X size={16} color={Colors.grey40} />}
                  onPress={handleCancelEdit}
                  style={styles.cancelButton}
                />
                <Button
                  label="Запази промените"
                  backgroundColor={Colors.blue30}
                  iconSource={() => <Save size={16} color="white" />}
                  onPress={handleSaveEdit}
                  style={styles.saveButton}
                />
              </>
            ) : (
              <>
                <Button
                  label="Сканирайте отново"
                  backgroundColor="transparent"
                  color={Colors.grey40}
                  onPress={() => {
                    setScannedData(null);
                    setEditedData(null);
                    setIsScanning(true);
                  }}
                  style={styles.scanAgainButton}
                />
                <Button
                  label="Добави книга"
                  backgroundColor={Colors.blue30}
                  onPress={handleSaveBook}
                  disabled={
                    !selectedShelfId ||
                    !displayData?.title.trim() ||
                    !displayData?.author.trim()
                  }
                  style={styles.addButton}
                />
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
            ],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.scanInstructions}>
              Насочете камерата към баркода на книгата
            </Text>
            <Text style={styles.scanSubtext}>
              Приложението ще извлече автоматично информацията за книгата
            </Text>
          </View>
        </CameraView>

        <Button
          label="Отказ"
          backgroundColor="transparent"
          color={Colors.grey40}
          onPress={() => setIsScanning(false)}
          style={styles.cancelButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.scanPrompt}>
      <Scan size={48} color={Colors.grey50} />
      <Text style={styles.promptTitle}>Сканирайте баркода на книгата</Text>
      <Text style={styles.promptSubtitle}>
        Сканирайте баркода на книгата, за да получите автоматично информация от
        Google Books
      </Text>
      <Button
        label="Започни сканиране"
        backgroundColor={Colors.blue30}
        onPress={() => setIsScanning(true)}
        style={styles.startScanButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  scanPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  promptSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startScanButton: {
    paddingHorizontal: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
  },
  scanInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  scanSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scannedDataContainer: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  scannedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    width: 40,
    height: 40,
  },
  bookPreview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    objectFit: 'cover',
    marginRight: 16,
  },
  placeholderCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  bookIsbn: {
    fontSize: 14,
    color: '#9ca3af',
  },
  editField: {
    marginBottom: 12,
  },
  editFieldStyle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  shelfSection: {
    marginBottom: 24,
  },
  shelfLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  scanAgainButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
