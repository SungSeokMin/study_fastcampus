import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from './slice/authSlice';
import productReducer from './slice/productSlice';
import filterReducer from './slice/filterSlice';
import cartSliceReducer from './slice/cartSlice';
import checkoutSliceReducer from './slice/checkoutSlice';
import orderReducer from './slice/orderSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  filter: filterReducer,
  cart: cartSliceReducer,
  checkout: checkoutSliceReducer,
  orders: orderReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false });
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
