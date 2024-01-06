'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import { Timestamp, doc, setDoc } from 'firebase/firestore';

import { db } from '@/firebase/firebase';

import Loader from '@/components/loader/Loader';
import Button from '@/components/button/Button';

import { IOrder } from '@/redux/types';

import { getErrorMEssage } from '@/utils/getErrorMessage';

import styles from './ChangeOrderStatus.module.scss';

interface IChangeOrderStatusProps {
  order: IOrder;
  id: string;
}

const ChangeOrderStatus = ({ order, id }: IChangeOrderStatusProps) => {
  const router = useRouter();

  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const editOrder = (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();

    const orderData = {
      userID: order.userID,
      userEmail: order.userEmail,
      orderDate: order.orderDate,
      orderTime: order.orderTime,
      orderAmount: order.orderAmount,
      orderStatus: status,
      cartItems: order.cartItems,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      editedAt: Timestamp.now().toDate(),
    };

    try {
      setDoc(doc(db, 'orders', id), orderData);

      toast.success('주문 상태가 변경되었습니다.');
      router.push('/admin/orders');
    } catch (error) {
      toast.error(getErrorMEssage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader basic />}

      <div className={styles.status}>
        <div className={styles.card}>
          <h4>주문 상태 업데이트</h4>
          <form onSubmit={(e) => editOrder(e, id)}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option disabled value="">
                -- 선택 --
              </option>
              <option value="주문수락">주문수락</option>
              <option value="주문처리중">주문처리중</option>
              <option value="배송중">배송중</option>
              <option value="배송완료">배송완료</option>
            </select>
            <div>
              <Button type="submit">업데이트</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangeOrderStatus;
