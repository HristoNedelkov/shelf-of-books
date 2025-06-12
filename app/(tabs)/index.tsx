import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { router } from 'expo-router';
import {
  Text,
  Card,
  Button,
  TouchableOpacity,
  Colors,
} from 'react-native-ui-lib';
import { Plus, BookOpen, ArrowUp } from 'lucide-react-native';
import { RootState } from '@/store';
import {
  addShelf,
  deleteShelf,
  reorderShelves,
} from '@/store/slices/shelvesSlice';
import { AddShelfModal } from '@/components/AddShelfModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const shelves = useSelector((state: RootState) => state.shelves.items);
  const books = useSelector((state: RootState) => state.books.items);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const getBookCount = (shelfId: string) => {
    return shelves.find((s) => s.id === shelfId)?.bookIds.length || 0;
  };

  const handleAddShelf = (name: string) => {
    dispatch(addShelf(name));
    setIsAddModalVisible(false);
  };

  const handleDeleteShelf = (shelfId: string, shelfName: string) => {
    if (shelfId === 'default') {
      Alert.alert('Cannot Delete', 'The default shelf cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Shelf',
      `Are you sure you want to delete "${shelfName}"? This will not delete the books.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteShelf(shelfId)),
        },
      ]
    );
  };

  const handleMoveToTop = (shelfId: string) => {
    const newShelves = [...shelves];
    const shelfIndex = newShelves.findIndex((s) => s.id === shelfId);

    if (shelfIndex > 0) {
      // Don't move if it's already at the top
      const [movedShelf] = newShelves.splice(shelfIndex, 1);
      newShelves.unshift(movedShelf);
      dispatch(reorderShelves(newShelves));
    }
  };

  const renderShelfItem = ({ item }: { item: any }) => (
    <Card style={styles.shelfCard}>
      <View style={styles.shelfContent}>
        <TouchableOpacity
          style={styles.shelfMainContent}
          onPress={() => router.push(`/shelf/${item.id}` as any)}
        >
          <View style={styles.shelfIcon}>
            <BookOpen size={24} color={Colors.blue30} />
          </View>
          <View style={styles.shelfInfo}>
            <Text style={styles.shelfTitle}>{item.name}</Text>
            <Text style={styles.bookCount}>
              {getBookCount(item.id)} book
              {getBookCount(item.id) === 1 ? '' : 's'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleMoveToTop(item.id)}
        >
          <ArrowUp size={20} color={Colors.grey40} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Моите рафтове</Text>
        <Button
          iconSource={() => <Plus size={20} color="white" />}
          backgroundColor={Colors.blue30}
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>

      <FlatList
        data={shelves}
        renderItem={renderShelfItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AddShelfModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddShelf}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  listContent: {
    padding: 20,
  },
  shelfCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shelfContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelfMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelfIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shelfInfo: {
    flex: 1,
  },
  shelfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookCount: {
    fontSize: 14,
    color: '#64748b',
  },
  moreButton: {
    padding: 8,
  },
});
