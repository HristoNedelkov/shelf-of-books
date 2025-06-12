import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Button, Colors, SegmentedControl } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '@/store';
import { addBook } from '@/store/slices/booksSlice';
import { addBookToShelf } from '@/store/slices/shelvesSlice';
import { ScanBooksTab } from '@/components/ScanBooksTab';
import { ManualEntryTab } from '@/components/ManualEntryTab';

export default function AddBookScreen() {
  const dispatch = useDispatch();
  const shelves = useSelector((state: RootState) => state.shelves.items);
  const [activeTab, setActiveTab] = useState(0);

  const handleAddBook = (bookData: {
    title: string;
    author: string;
    isbn?: string;
    coverUri?: string;
    shelfId: string;
  }) => {
    try {
      // Добави книга to store and get the action result
      const bookAction = dispatch(
        addBook({
          ...bookData,
          status: 'not_started' as const,
        })
      );

      // Extract the book ID from the action payload
      const bookId = bookAction.payload.id;

      // Добави книга to selected shelf
      dispatch(
        addBookToShelf({
          shelfId: bookData.shelfId,
          bookId,
        })
      );

      Alert.alert('Успех', 'Книгата е добавена успешно!');
    } catch (error) {
      Alert.alert(
        'Грешка',
        'Неуспешно добавяне на книга. Моля, опитайте отново.'
      );
      console.error('Error adding book:', error);
    }
  };

  const segments = [{ label: 'Сканирай баркод' }, { label: 'Въведи ръчно' }];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Добавяне на книга</Text>
      </View>

      <View style={styles.content}>
        <SegmentedControl
          segments={segments}
          onChangeIndex={setActiveTab}
          activeIndex={activeTab}
          containerStyle={styles.segmentedControl}
          activeColor={Colors.blue30}
        />

        <View style={styles.tabContent}>
          {activeTab === 0 ? (
            <ScanBooksTab onAddBook={handleAddBook} shelves={shelves} />
          ) : (
            <ManualEntryTab onAddBook={handleAddBook} shelves={shelves} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  segmentedControl: {
    marginBottom: 24,
  },
  tabContent: {
    flex: 1,
  },
});
