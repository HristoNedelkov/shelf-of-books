import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Text,
  Button,
  Colors,
  TouchableOpacity,
  TextField,
} from 'react-native-ui-lib';
import {
  ArrowLeft,
  Book,
  CreditCard as Edit3,
  Save,
  X,
  Trash2,
  MoveRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '@/store';
import {
  BookStatus,
  updateBook,
  updateBookStatus,
  moveBookToShelf,
  deleteBook,
} from '@/store/slices/booksSlice';
import {
  removeBookFromShelf,
  addBookToShelf,
} from '@/store/slices/shelvesSlice';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const book = useSelector((state: RootState) => state.books.items[id!]);
  const shelves = useSelector((state: RootState) => state.shelves.items);

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editComment, setEditComment] = useState(book?.comment || '');

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Книгата не е намерена</Text>
      </SafeAreaView>
    );
  }

  const statusSteps: { status: BookStatus; label: string; color: string }[] = [
    { status: 'not_started', label: 'Не е започната', color: '#6b7280' },
    { status: 'reading', label: 'Чета', color: '#f59e0b' },
    { status: 'finished', label: 'Прочетена', color: '#10b981' },
    { status: 'awaiting_comment', label: 'Очаква коментар', color: '#8b5cf6' },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.status === book.status
  );

  const handleStatusUpdate = (newStatus: BookStatus) => {
    dispatch(updateBookStatus({ id: book.id, status: newStatus }));
  };

  const handleSaveComment = () => {
    dispatch(
      updateBook({
        id: book.id,
        updates: { comment: editComment.trim() || undefined },
      })
    );
    setIsEditingComment(false);
  };

  const handleDeleteBook = () => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(
              removeBookFromShelf({ shelfId: book.shelfId, bookId: book.id })
            );
            dispatch(deleteBook(book.id));
            router.back();
          },
        },
      ]
    );
  };

  const handleMoveToShelf = (newShelfId: string) => {
    const newShelf = shelves.find((s) => s.id === newShelfId);
    if (!newShelf) return;

    Alert.alert('Move Book', `Move "${book.title}" to "${newShelf.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move',
        onPress: () => {
          dispatch(
            removeBookFromShelf({ shelfId: book.shelfId, bookId: book.id })
          );
          dispatch(addBookToShelf({ shelfId: newShelfId, bookId: book.id }));
          dispatch(moveBookToShelf({ bookId: book.id, newShelfId }));
        },
      },
    ]);
  };

  const currentShelf = shelves.find((s) => s.id === book.shelfId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.grey40} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        <TouchableOpacity
          onPress={handleDeleteBook}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bookHeader}>
          <View style={styles.coverContainer}>
            {book.coverUri ? (
              <Image
                source={{ uri: book.coverUri }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Book size={32} color={Colors.grey50} />
              </View>
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            {book.isbn && <Text style={styles.isbn}>ISBN: {book.isbn}</Text>}
            <Text style={styles.shelf}>
              Shelf: {currentShelf?.name || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Напредък в четенето</Text>
          <View style={styles.statusStepper}>
            {statusSteps.map((step, index) => (
              <TouchableOpacity
                key={step.status}
                style={[
                  styles.statusStep,
                  index <= currentStatusIndex && styles.statusStepActive,
                  { borderColor: step.color },
                  index <= currentStatusIndex && {
                    backgroundColor: step.color,
                  },
                ]}
                onPress={() => handleStatusUpdate(step.status)}
              >
                <Text
                  style={[
                    styles.statusStepText,
                    index <= currentStatusIndex && styles.statusStepTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.statusLabels}>
            {statusSteps.map((step, index) => (
              <Text
                key={step.status}
                style={[
                  styles.statusLabel,
                  index === currentStatusIndex && {
                    color: step.color,
                    fontWeight: '600',
                  },
                ]}
              >
                {step.label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comment</Text>
            {!isEditingComment && (
              <TouchableOpacity
                onPress={() => {
                  setEditComment(book.comment || '');
                  setIsEditingComment(true);
                }}
              >
                <Edit3 size={20} color={Colors.blue30} />
              </TouchableOpacity>
            )}
          </View>

          {isEditingComment ? (
            <View style={styles.commentEditor}>
              <TextField
                placeholder="Add your thoughts about this book..."
                value={editComment}
                onChangeText={setEditComment}
                multiline
                numberOfLines={4}
                containerStyle={styles.commentField}
                fieldStyle={styles.commentFieldStyle}
              />
              <View style={styles.commentButtons}>
                <Button
                  iconSource={() => <X size={16} color={Colors.grey40} />}
                  backgroundColor="transparent"
                  onPress={() => setIsEditingComment(false)}
                  style={styles.commentButton}
                />
                <Button
                  iconSource={() => <Save size={16} color="white" />}
                  backgroundColor={Colors.blue30}
                  onPress={handleSaveComment}
                  style={styles.commentButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.commentDisplay}>
              {book.comment ? (
                <Text style={styles.commentText}>"{book.comment}"</Text>
              ) : (
                <Text style={styles.noComment}>No comment added yet</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Move to Shelf</Text>
          <View style={styles.shelfButtons}>
            {shelves
              .filter((s) => s.id !== book.shelfId)
              .map((shelf) => (
                <TouchableOpacity
                  key={shelf.id}
                  style={styles.shelfButton}
                  onPress={() => handleMoveToShelf(shelf.id)}
                >
                  <Text style={styles.shelfButtonText}>{shelf.name}</Text>
                  <MoveRight size={16} color={Colors.blue30} />
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  bookHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  coverContainer: {
    marginRight: 20,
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    objectFit: 'cover',
  },
  placeholderCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  isbn: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  shelf: {
    fontSize: 14,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusStepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statusStepActive: {
    borderColor: '#2563eb',
  },
  statusStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusStepTextActive: {
    color: 'white',
  },
  statusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    flex: 1,
  },
  commentEditor: {
    marginTop: 8,
  },
  commentField: {
    marginBottom: 12,
  },
  commentFieldStyle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  commentButton: {
    width: 40,
    height: 40,
  },
  commentDisplay: {
    marginTop: 8,
  },
  commentText: {
    fontSize: 16,
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  noComment: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  shelfButtons: {
    marginTop: 8,
  },
  shelfButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shelfButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
});
