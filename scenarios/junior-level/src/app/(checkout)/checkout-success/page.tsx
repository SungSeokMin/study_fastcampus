import Heading from '@/components/heading/Heading';

import { formatTime } from '@/utils/dayjs';
import { priceFormat } from '@/utils/priceFormat';

import styles from './CheckoutSuccess.module.scss';
import Button from '@/components/button/Button';
import Link from 'next/link';

interface ICheckoutSuccessProps {
  searchParams: {
    orderId: string;
  };
}

interface IPayment {
  orderName: string;
  orderId: string;
  approvedAt: string;
  easyPay: {
    provider: number;
    amount: number;
  };
}

const CheckSuccessPage = async ({ searchParams }: ICheckoutSuccessProps) => {
  const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;

  const url = `https://api.tosspayments.com/v1/payments/orders/${searchParams.orderId}`;
  const basicToken = Buffer.from(`${secretKey}:`, 'utf-8').toString('base64');

  const payment: IPayment = await fetch(url, {
    headers: {
      Authorization: `Basic ${basicToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());

  const { orderName, orderId, easyPay, approvedAt } = payment;

  return (
    <section className={styles.success}>
      <Heading title="결제 성공" />
      <ul className={styles.list}>
        <li>
          <b>결제 상품: </b>
          {orderName}
        </li>
        <li>
          <b>주문번호: </b>
          {orderId}
        </li>
        <li>
          <b>카드번호: </b>
          {easyPay.provider}
        </li>
        <li>
          <b>결제금액: </b>
          {priceFormat(easyPay.amount)}원
        </li>
        <li>
          <b>결제승인날짜: </b>
          {formatTime(approvedAt)}
        </li>
      </ul>

      <Button>
        <Link href="/order-history">주문 상태 보기</Link>
      </Button>
    </section>
  );
};

export default CheckSuccessPage;
