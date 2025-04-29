import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from 'react-native';

interface AuthState {
  accessToken: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  roleName: string;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  roleName: '',
  userId: 0,
  fullName: '',
  accessToken: '',
  refreshToken: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => action.payload,
    logout: () => initialState,
    setAuthState(
      state,
      action: PayloadAction<{
        isAuthenticated: boolean;
        role: string | null;
        userId: number | null;
        fullName: string | null;
        token: string | null;
      }>
    ) {
      // state.isAuthenticated = action.payload.isAuthenticated;
      // state.role = action.payload.role;
      // state.userId = action.payload.userId;
      // state.fullName = action.payload.fullName;
      // state.token = action.payload.token;
    },
    updateNewAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
});

export const { login, logout, setAuthState, updateNewAccessToken } = authSlice.actions;
export default authSlice.reducer;
