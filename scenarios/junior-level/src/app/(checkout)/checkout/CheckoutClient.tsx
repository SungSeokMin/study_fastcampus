'use client';

import React, { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import { Timestamp, addDoc, collection } from 'firebase/firestore';

import Heading from '@/components/heading/Heading';
import CheckoutSummary from '@/components/checkoutSummary/CheckoutSummary';
import Button from '@/components/button/Button';

import { loadTossPayments } from '@tosspayments/payment-sdk';

import { CLEAR_CART, selectCartItems, selectCartTotalAmount } from '@/redux/slice/cartSlice';
import { selectEmail, selectUserID } from '@/redux/slice/authSlice';
import { selectShippingAddress } from '@/redux/slice/checkoutSlice';

import { db } from '@/firebase/firebase';

import styles from './Checkout.module.scss';

const CheckoutClient = () => {
  const userID = useSelector(selectUserID);
  const cartItems = useSelector(selectCartItems);
  const shippingAddress = useSelector(selectShippingAddress);
  const userEmail = useSelector(selectEmail);
  const cartTotalAmount = useSelector(selectCartTotalAmount);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const tossPayment = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);

    tossPayment
      .requestPayment('카드', {
        amount: cartTotalAmount,
        orderId: Math.random().toString(36).slice(2),
        orderName: '주문',
      })
      .then(async (data) => {
        const { orderId, paymentKey, amount } = data;
        const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;

        const url = `https://api.tosspayments.com/v1/payments/confirm`;
        const basicToken = Buffer.from(`${secretKey}:`, 'utf-8').toString('base64');

        const confirmResponse = fetch(url, {
          method: 'post',
          body: JSON.stringify({
            amount,
            orderId,
            paymentKey,
          }),
          headers: {
            Authorization: `Basic ${basicToken}`,
            'Content-Type': 'application/json',
          },
        }).then((response) => response.json());

        const today = new Date();
        const date = today.toDateString();
        const time = today.toLocaleTimeString();

        const orderData = {
          userID,
          userEmail,
          orderDate: date,
          orderTime: time,
          orderAmount: amount,
          orderStatus: '주문수락',
          cartItems,
          shippingAddress,
          createdAt: Timestamp.now().toDate(),
        };

        await addDoc(collection(db, 'orders'), orderData);
        dispatch(CLEAR_CART());

        router.push(`/checkout-success?orderId=${orderId}`);
      })
      .catch((error) => {
        if (error.code === 'PAY_PROCESS_CANCELED') {
          toast.error('결제창이 닫아졌습니다.');
        }
      });
  };

  return (
    <section>
      <div className={styles.checkout}>
        <Heading title="주문하기" />
        <form onSubmit={handleSubmit}>
          <div className={styles.card}>
            <CheckoutSummary />
          </div>

          <div>
            <Button type="submit">토스를 이용해서 결제하기</Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutClient;
