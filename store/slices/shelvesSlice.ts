import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Shelf {
  id: string;
  name: string;
  bookIds: string[];
}

interface ShelvesState {
  items: Shelf[];
}

const initialState: ShelvesState = {
  items: [
    {
      id: 'default',
      name: 'Моята библиотека',
      bookIds: [],
    },
  ],
};

const shelvesSlice = createSlice({
  name: 'shelves',
  initialState,
  reducers: {
    addShelf: {
      reducer: (state, action: PayloadAction<Shelf>) => {
        state.items.push(action.payload);
      },
      prepare: (name: string) => ({
        payload: {
          id: nanoid(),
          name,
          bookIds: [],
        },
      }),
    },
    editShelf: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const shelf = state.items.find((s) => s.id === action.payload.id);
      if (shelf) {
        shelf.name = action.payload.name;
      }
    },
    deleteShelf: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((shelf) => shelf.id !== action.payload);
    },
    addBookToShelf: (
      state,
      action: PayloadAction<{ shelfId: string; bookId: string }>
    ) => {
      const shelf = state.items.find((s) => s.id === action.payload.shelfId);
      if (shelf) {
        shelf.bookIds.push(action.payload.bookId);
      }
    },
    removeBookFromShelf: (
      state,
      action: PayloadAction<{ shelfId: string; bookId: string }>
    ) => {
      const shelf = state.items.find((s) => s.id === action.payload.shelfId);
      if (shelf) {
        shelf.bookIds = shelf.bookIds.filter(
          (id) => id !== action.payload.bookId
        );
      }
    },
    reorderShelves: (state, action: PayloadAction<Shelf[]>) => {
      state.items = action.payload;
    },
    clearAllData: (state) => {
      // Keep only the default shelf and clear its books
      state.items = [
        {
          id: 'default',
          name: 'Моята библиотека',
          bookIds: [],
        },
      ];
    },
  },
});

export const {
  addShelf,
  editShelf,
  deleteShelf,
  addBookToShelf,
  removeBookFromShelf,
  reorderShelves,
  clearAllData,
} = shelvesSlice.actions;

export const selectShelves = (state: RootState) => state.shelves.items;

export default shelvesSlice.reducer;
