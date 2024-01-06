import { createSlice } from '@reduxjs/toolkit';
import { IOrder } from '../types';
import { RootState } from '../store';

interface IOrderState {
  orderHistory: IOrder[];
  totalOrderAmount: number | null;
}

const initialState: IOrderState = {
  orderHistory: [],
  totalOrderAmount: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    STORE_ORDERS: (state, action) => {
      state.orderHistory = action.payload;
    },
    CALCULATE_TOTAL_ORDER_AMOUNT: (state) => {
      const prices = state.orderHistory.map((order) => order.orderAmount);
      const totalAmount = prices.reduce((acc, cur) => acc + cur, 0);

      state.totalOrderAmount = totalAmount;
    },
  },
});

export const { STORE_ORDERS, CALCULATE_TOTAL_ORDER_AMOUNT } = orderSlice.actions;

export const selectOrderHistory = (state: RootState) => state.orders.orderHistory;
export const selectTotalOrderAmount = (state: RootState) => state.orders.totalOrderAmount;

export default orderSlice.reducer;
