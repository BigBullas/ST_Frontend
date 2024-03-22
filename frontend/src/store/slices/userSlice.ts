import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  login: '',
};

const dataSlice = createSlice({
  name: 'user',
  initialState: { Data: initialState },
  reducers: {
    setData(state, { payload }) {
      state.Data = payload.Data;
    },
    cleanUser: (state) => {
      state.Data.login = '';
    },
  },
});

export const { setData: setUserDataAction, cleanUser: cleanUserDataAction } =
  dataSlice.actions;

export default dataSlice.reducer;
