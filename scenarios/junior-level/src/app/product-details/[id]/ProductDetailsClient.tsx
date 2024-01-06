'use client';

import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Rating } from 'react-simple-star-rating';

import { useParams } from 'next/navigation';
import Image from 'next/image';

import { DocumentData } from 'firebase/firestore';

import Divider from '@/components/divider/Divider';
import Loader from '@/components/loader/Loader';
import Button from '@/components/button/Button';
import ProductReviewItem from '@/components/product/productReviewItem/ProductReviewItem';

import useFetchDocument from '@/hooks/useFetchDocument';
import useFetchDocuments from '@/hooks/useFetchDocuments';

import { priceFormat } from '@/utils/priceFormat';

import listCashIcon from '@/assets/list-cash-icon.png';

import styles from './ProductDetails.module.scss';

import { ADD_TO_CART, CALCULATE_TOTAL_QUANTITY } from '@/redux/slice/cartSlice';

const ProductDetailsClient = () => {
  const { id } = useParams();
  const { document: product } = useFetchDocument('products', id as string);
  const { documents: reviews } = useFetchDocuments('reviews', ['productID', '==', id as string]);

  const dispatch = useDispatch();

  const [count, setCount] = useState(1);

  const addToCart = () => {
    dispatch(ADD_TO_CART({ ...product, quantity: count }));
    dispatch(CALCULATE_TOTAL_QUANTITY());
  };

  const today = new Date();
  const tomorrow = new Date(today.setDate(today.getDate() + 1));
  const tomorrowDate = tomorrow.getDate();
  const tomorrowMonth = tomorrow.getMonth();

  return (
    <section className={styles.product}>
      {product === null ? (
        <Loader />
      ) : (
        <div className={styles.details}>
          <div className={styles.img}>
            <Image src={product.imageURL} width={477} height={410} alt={product.name} priority />
          </div>

          <div className={styles.content}>
            <div className={styles.header}>
              <p className={styles.brandName}>{product.brand}</p>

              <p className={styles.productName}>{product.name}</p>

              <div className={styles.rating}>
                <Rating initialValue={3} size={17} />

                <span className={styles.count}>10,000개 상품평</span>
              </div>
            </div>

            <Divider space={0} />

            <div className={styles.container}>
              <p className={styles.price}>{priceFormat(product.price)}원</p>

              <div className={styles.rewardCashBadge}>
                <Image src={listCashIcon} width={12} height={12} alt="cash-icon" />

                <span>최대 {product.price / 10}원 적립</span>
              </div>
            </div>

            <Divider space={0} />

            <div className={styles.rewardCashWrapper}>
              <div className={styles.rewardSummary}>
                <Image src={listCashIcon} width={15} height={15} alt="cash-icon" />
                <p>
                  캐시적립 혜택
                  <span>
                    최대 <strong>{product.price / 10}</strong>원 적립
                  </span>
                </p>
              </div>

              <div className={styles.rewardCashPromotion}>
                <p>쿠페이 머니 결제 시 1% 적립</p>
                <p>[로켓와우 + 쿠페이 계좌이체] 결제 시 2% 적립</p>
                <p>[로켓와우 + 쿠페이 머니] 결제 시 4% 적립</p>
                <button>로켓와우 무료체험 신청하기</button>
              </div>
            </div>

            <Divider space={0} />

            <div className={styles.bottom}>
              <p className={styles.price}>{product.price * count}원</p>

              <div className={styles.count}>
                <Button
                  onClick={() => setCount((prev) => prev - 1)}
                  disabled={count > 1 ? false : true}
                  secondary
                >
                  -
                </Button>

                <p>
                  <b>{count}</b>
                </p>

                <Button onClick={() => setCount((prev) => prev + 1)} secondary>
                  +
                </Button>

                <Button onClick={addToCart}>장바구니 담기</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h3>상품평 ({reviews?.length})</h3>

        <div>
          {reviews.length === 0 ? (
            <p className={styles.noReviewText}>해당 상품에 대한 상품평이 아직 없습니다.</p>
          ) : (
            <Fragment>
              {reviews.map((review: DocumentData) => (
                <ProductReviewItem
                  rate={review.rate}
                  review={review.review}
                  reviewDate={review.reviewDate}
                  userName={review.userName}
                  key={review.id}
                />
              ))}
            </Fragment>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsClient;
