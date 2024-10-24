import { createSlice } from '@reduxjs/toolkit';
import { sendOtp, verifyOtp } from '../thunks/User';
import Cookies from 'js-cookie';

const initialState = {
  loading: false,
  isLoggedIn: Cookies.get('isLoggedIn') === 'true',
  isOtpSent: false,
  isAdmin: Cookies.get('_gbsch_fg') === 'fkrarehytapadtieln', // Add isAdmin field
  error: null,
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.isOtpSent = false;
      state.isAdmin = false; // Reset isAdmin on logout
      Cookies.remove('isLoggedIn');
      Cookies.remove('_gbsch_fg');
    },
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.isAdmin = Cookies.get('_gbsch_fg') === 'fkrarehytapadtieln'; // Check role to set isAdmin
      Cookies.set('isLoggedIn', 'true', { expires: 7 }); // Set cookie expiration to 7 days
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.isOtpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.isOtpSent = false;
        state.isAdmin = Cookies.get('_gbsch_fg') === 'fkrarehytapadtieln'; // Check role to set isAdmin
        Cookies.set('isLoggedIn', 'true', { expires: 7 }); // Set cookie expiration to 7 days

      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, loginSuccess } = userReducer.actions;
export default userReducer.reducer;
