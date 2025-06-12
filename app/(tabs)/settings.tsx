import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Colors } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearAllData } from '@/store/slices/shelvesSlice';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ExternalLink } from 'lucide-react-native';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const shelves = useSelector((state: RootState) => state.shelves.items);
  const books = useSelector((state: RootState) => state.books.items);

  const handleClearData = () => {
    Alert.alert(
      'Изчисти всички данни',
      'Сигурни ли сте, че искате да изтриете всички рафтове и книги? Това действие не може да бъде отменено.',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изчисти',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Simulate a delay to show the loading animation
              await new Promise((resolve) => setTimeout(resolve, 1500));
              dispatch(clearAllData());
              Alert.alert('Успех', 'Всички данни са изчистени успешно.');
            } catch (error) {
              Alert.alert(
                'Грешка',
                'Възникна проблем при изчистването на данните.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const openGoogleBooksAPI = () => {
    Linking.openURL('https://developers.google.com/books/docs/v1/using');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Настройки</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика на библиотеката</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shelves.length}</Text>
              <Text style={styles.statLabel}>Рафтове</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{books.length}</Text>
              <Text style={styles.statLabel}>Книги</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управление на данните</Text>
          <Button
            label="Изчисти всички данни"
            backgroundColor={Colors.red30}
            onPress={handleClearData}
            style={styles.clearButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>За приложението</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.creatorInfo}>
              Създател: Христо Неделков{'\n'}
              Фак. номер: 2365
            </Text>
            <Text style={styles.apiInfo}>
              Приложението използва Google Books API за търсене и извличане на
              информация за книги.
            </Text>
            <TouchableOpacity
              style={[styles.apiButton, { backgroundColor: Colors.blue30 }]}
              onPress={openGoogleBooksAPI}
            >
              <View style={styles.apiButtonContent}>
                <Text style={styles.apiButtonText}>
                  Google Books API Документация
                </Text>
                <ExternalLink size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Изчистване на данните..." />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.blue30,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  clearButton: {
    marginTop: 8,
  },
  infoContainer: {
    gap: 16,
  },
  creatorInfo: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    fontWeight: '500',
  },
  apiInfo: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  apiButton: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  apiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  apiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
