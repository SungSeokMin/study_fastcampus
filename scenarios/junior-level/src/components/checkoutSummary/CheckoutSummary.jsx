'use client';

import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Link from 'next/link';

import {
  CALCULATE_TOTAL_QUANTITY,
  CALCULATE_TOTAL_SUBTOTAL,
  selectCartItems,
  selectCartTotalAmount,
  selectCartTotalQuantity,
} from '@/redux/slice/cartSlice';

import { priceFormat } from '@/utils/priceFormat';

import styles from './CheckoutSummary.module.scss';

const CheckoutSummary = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(CALCULATE_TOTAL_QUANTITY());
    dispatch(CALCULATE_TOTAL_SUBTOTAL());
  }, [dispatch, cartItems]);

  const cartTotalAmount = useSelector(selectCartTotalAmount);
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);

  return (
    <div className={styles.summary}>
      <h3>주몬 요약</h3>

      <div>
        {cartItems.length === 0 ? (
          <Fragment>
            <p>장바구니에 상품이 없습니다.</p>
            <Link href="/">홈 페이지로</Link>
          </Fragment>
        ) : (
          <div>
            {cartItems.map(({ id, name, price, cartQuantity }) => (
              <div key={id} className={styles.card}>
                <p>
                  <b>상품: </b>
                  {name}
                </p>
                <p>
                  <b>개수: </b>
                  {cartQuantity}
                </p>

                <p>
                  <b>가격: </b>
                  {priceFormat(price)}원
                </p>
                <p>
                  <b>세트 가격: </b>
                  {priceFormat(price * cartQuantity)}원
                </p>
              </div>
            ))}

            <div className={styles.text}>
              <p>
                <b>총 상품 개수:</b>
                {cartTotalQuantity}
              </p>
            </div>
            <div className={styles.text}>
              <p>
                <b>합계:</b>
                {cartTotalAmount}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;
