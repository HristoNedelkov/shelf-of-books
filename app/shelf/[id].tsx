import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Text,
  Card,
  TextField,
  Button,
  Colors,
  TouchableOpacity,
} from 'react-native-ui-lib';
import {
  ArrowLeft,
  Search,
  Filter,
  Book,
  MoveVertical as MoreVertical,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '@/store';
import { Book as BookType, BookStatus } from '@/store/slices/booksSlice';
import { removeBookFromShelf } from '@/store/slices/shelvesSlice';
import { deleteBook } from '@/store/slices/booksSlice';
import { BookCard } from '@/components/BookCard';

export default function ShelfDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const shelf = useSelector((state: RootState) =>
    state.shelves.items.find((s) => s.id === id)
  );
  const allBooks = useSelector((state: RootState) => state.books.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');

  const shelfBooks = useMemo(() => {
    if (!shelf) return [];

    let books = shelf.bookIds.map((bookId) => allBooks[bookId]).filter(Boolean);

    // Apply search filter
    if (searchQuery) {
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      books = books.filter((book) => book.status === statusFilter);
    }

    return books;
  }, [shelf, allBooks, searchQuery, statusFilter]);

  const handleDeleteBook = (book: BookType) => {
    Alert.alert(
      'Изтрий книга',
      `Сигурни ли сте, че искате да изтриете "${book.title}"?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: () => {
            dispatch(removeBookFromShelf({ shelfId: id!, bookId: book.id }));
            dispatch(deleteBook(book.id));
          },
        },
      ]
    );
  };

  if (!shelf) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Рафтът не е намерен</Text>
      </SafeAreaView>
    );
  }

  const statusFilters = [
    { label: 'Всички', value: 'all' as const },
    { label: 'Не е започната', value: 'not_started' as const },
    { label: 'Чета', value: 'reading' as const },
    { label: 'Прочетена', value: 'finished' as const },
    { label: 'Очаква коментар', value: 'awaiting_comment' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Colors.grey40} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{shelf.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <TextField
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leadingAccessory={<Search size={20} color={Colors.grey40} />}
            containerStyle={styles.searchField}
            fieldStyle={styles.searchFieldStyle}
          />
        </View>

        <FlatList
          data={statusFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
        />
      </View>

      {shelfBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Book size={48} color={Colors.grey50} />
          <Text style={styles.emptyTitle}>No books found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first book to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={shelfBooks}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => router.push(`/book/${item.id}` as any)}
              onDelete={() => handleDeleteBook(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchField: {
    marginBottom: 0,
  },
  searchFieldStyle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: Colors.blue30,
    borderColor: Colors.blue30,
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});
