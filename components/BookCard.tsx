import React from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, Card, TouchableOpacity, Colors } from 'react-native-ui-lib';
import {
  MoveVertical as MoreVertical,
  Book as BookIcon,
} from 'lucide-react-native';
import { Book } from '@/store/slices/booksSlice';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onDelete: () => void;
}

export function BookCard({ book, onPress, onDelete }: BookCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return '#6b7280';
      case 'reading':
        return '#f59e0b';
      case 'finished':
        return '#10b981';
      case 'awaiting_comment':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'Не е започната';
      case 'reading':
        return 'Чета';
      case 'finished':
        return 'Прочетена';
      case 'awaiting_comment':
        return 'Очаква коментар';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.mainContent} onPress={onPress}>
          <View style={styles.coverContainer}>
            {book.coverUri ? (
              <Image
                source={{ uri: book.coverUri }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <BookIcon size={24} color={Colors.grey50} />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {book.author}
            </Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(book.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(book.status)}
                </Text>
              </View>
            </View>

            {book.comment && (
              <Text style={styles.comment} numberOfLines={2}>
                "{book.comment}"
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton} onPress={onDelete}>
          <MoreVertical size={20} color={Colors.grey40} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  coverContainer: {
    marginRight: 16,
  },
  cover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    objectFit: 'cover',
  },
  placeholderCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  comment: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
});
