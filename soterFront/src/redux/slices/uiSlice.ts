import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];
  currentInstallation: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  toasts: [],
  currentInstallation: localStorage.getItem('soter_installation') || null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setCurrentInstallation: (state, action: PayloadAction<string | null>) => {
      state.currentInstallation = action.payload;
      if (action.payload) {
        localStorage.setItem('soter_installation', action.payload);
      } else {
        localStorage.removeItem('soter_installation');
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addToast,
  removeToast,
  setCurrentInstallation,
} = uiSlice.actions;

export default uiSlice.reducer;