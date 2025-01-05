import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Reducer
import homePage from './slices/homePageSlice';

const combinedReducer = combineReducers({
  homePage,
});

const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: never
) => {
  // if (action.type === 'auth/logout-thunk/fulfilled') {
  //   state = {}
  // }

  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
