import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  role: string | null; // User role (e.g., "admin", "user")
  userId: number | null; // User ID
  fullName: string | null; // User's full name
  token: string | null; // Auth token
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  userId: null,
  fullName: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ role: string; userId: number; fullName: string; token: string }>) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.userId = null;
      state.fullName = null;
      state.token = null;
    },
    setAuthState(
      state,
      action: PayloadAction<{ isAuthenticated: boolean; role: string | null; userId: number | null; fullName: string | null; token: string | null }>
    ) {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
      state.token = action.payload.token;
    },
  },
});

export const { login, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
