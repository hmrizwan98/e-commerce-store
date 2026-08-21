import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cartReducer, { getCartStorageKey } from './slices/cartSlice';

const combinedReducer = combineReducers({
  cart: cartReducer,
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

// Cart is the only slice persisted client-side (no redux-persist dependency -
// this project has none installed, and a single key/subscribe pair is enough).
if (typeof window !== 'undefined') {
  store.subscribe(() => {
    // Plain module, not a component - reads window.location directly rather
    // than a hook. See getCartStorageKey()'s own comment (Phase 8A).
    const key = getCartStorageKey(window.location.pathname);
    window.localStorage.setItem(key, JSON.stringify(store.getState().cart.items));
  });
}

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
