import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import { RootState } from '../index';

export type BookStatus =
  | 'not_started'
  | 'reading'
  | 'finished'
  | 'awaiting_comment';

export interface Book {
  id: string;
  shelfId: string;
  title: string;
  author: string;
  isbn?: string;
  coverUri?: string;
  status: BookStatus;
  comment?: string;
  addedDate: string;
}

interface BooksState {
  items: { [id: string]: Book };
}

const initialState: BooksState = {
  items: {},
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    addBook: {
      reducer: (state, action: PayloadAction<Book>) => {
        state.items[action.payload.id] = action.payload;
      },
      prepare: (bookData: Omit<Book, 'id' | 'addedDate'>) => {
        const id = nanoid();
        return {
          payload: {
            ...bookData,
            id,
            addedDate: new Date().toISOString(),
          },
        };
      },
    },
    updateBook: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Book> }>
    ) => {
      const book = state.items[action.payload.id];
      if (book) {
        Object.assign(book, action.payload.updates);
      }
    },
    deleteBook: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    updateBookStatus: (
      state,
      action: PayloadAction<{ id: string; status: BookStatus }>
    ) => {
      const book = state.items[action.payload.id];
      if (book) {
        book.status = action.payload.status;
      }
    },
    moveBookToShelf: (
      state,
      action: PayloadAction<{ bookId: string; newShelfId: string }>
    ) => {
      const book = state.items[action.payload.bookId];
      if (book) {
        book.shelfId = action.payload.newShelfId;
      }
    },
    updateBookComment: (
      state,
      action: PayloadAction<{ id: string; comment: string }>
    ) => {
      const book = state.items[action.payload.id];
      if (book) {
        book.comment = action.payload.comment;
      }
    },
    clearAllData: (state) => {
      state.items = {};
    },
  },
});

export const {
  addBook,
  updateBook,
  deleteBook,
  updateBookStatus,
  moveBookToShelf,
  updateBookComment,
  clearAllData,
} = booksSlice.actions;

export const selectBooks = (state: RootState) => state.books.items;

export default booksSlice.reducer;
