import { configureStore } from '@reduxjs/toolkit';
import billReducer from '../features/billSlice';
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    bills: billReducer,
    auth: authReducer,
  },
});

export default store;
