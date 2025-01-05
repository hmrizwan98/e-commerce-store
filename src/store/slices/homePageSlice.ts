import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ActionTracker,
  handleFailure,
  handlePending,
  handleSuccess,
  initialActionTracker,
} from '../utils';
import { getSliderThunk } from '../thunks/homePageThunk';
import { ConditionEnum } from '@/components/ProductDetail';
import { ProductInsightsTypes } from '@/types/dashboard';

interface HomePage {
  slider: ConditionEnum | null;
  _slider: ActionTracker;
}

const initialState: HomePage = {
  slider: [],
  _slider: initialActionTracker,
};

const dashbaordSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    // Additional reducers if needed
  },
  extraReducers: (builder) => {
    builder.addCase(getSliderThunk.pending, (state) => {
      state._slider = handlePending();
    });
    builder.addCase(getSliderThunk.fulfilled, (state, { payload }: any) => {
      state.slider = payload;
      state._slider = handleSuccess('Fetch data successfully');
    });
    builder.addCase(getSliderThunk.rejected, (state, { payload }) => {
      state._slider = handleFailure(
        (payload as string) || 'Streaming error occurred'
      );
    });
  },
});

export default dashbaordSlice.reducer;
