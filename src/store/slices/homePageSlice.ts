import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ActionTracker,
  handleFailure,
  handlePending,
  handleSuccess,
  initialActionTracker,
} from '../utils';
import {
  getSliderThunk,
  getCategoryThunk,
  getSubCategoryThunk,
} from '../thunks/homePageThunk';
import { ConditionEnum } from '@/components/ProductDetail';
import { ProductInsightsTypes } from '@/types/dashboard';

interface HomePage {
  slider: ConditionEnum | null;
  categories: null;
  subCategories: null;
  _subCategories: ActionTracker;
  _categories: ActionTracker;
  _slider: ActionTracker;
}

const initialState: HomePage = {
  slider: [],
  categories: [],
  subCategories: [],
  _subCategories: initialActionTracker,
  _categories: initialActionTracker,
  _slider: initialActionTracker,
};

const dashbaordSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    // Additional reducers if needed
  },
  extraReducers: (builder) => {
    // slider
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

    // Category
    builder.addCase(getCategoryThunk.pending, (state) => {
      state._categories = handlePending();
    });
    builder.addCase(getCategoryThunk.fulfilled, (state, { payload }: any) => {
      state.categories = payload;
      state._categories = handleSuccess('Fetch data successfully');
    });
    builder.addCase(getCategoryThunk.rejected, (state, { payload }) => {
      state._categories = handleFailure(
        (payload as string) || 'fetching error occurred'
      );
    });

    // Sub Category
    builder.addCase(getSubCategoryThunk.pending, (state) => {
      state._subCategories = handlePending();
    });
    builder.addCase(
      getSubCategoryThunk.fulfilled,
      (state, { payload }: any) => {
        state.subCategories = payload;
        state._subCategories = handleSuccess('Fetch data successfully');
      }
    );
    builder.addCase(getSubCategoryThunk.rejected, (state, { payload }) => {
      state._subCategories = handleFailure(
        (payload as string) || 'fetching error occurred'
      );
    });
  },
});

export default dashbaordSlice.reducer;
