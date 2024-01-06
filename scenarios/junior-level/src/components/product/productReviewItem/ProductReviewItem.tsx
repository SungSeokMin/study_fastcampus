import { Rating } from 'react-simple-star-rating';

import { formatTime } from '@/utils/dayjs';

import styles from './ProductReviewItem.module.scss';

interface IProductReviewItemProps {
  rate: number;
  review: string;
  reviewDate: string;
  userName: string;
}

const ProductReviewItem = ({ rate, review, reviewDate, userName }: IProductReviewItemProps) => {
  return (
    <div className={styles.review}>
      <p className={styles.writer}>
        {userName} <span>님의 상품평</span>
      </p>

      <Rating initialValue={rate} readonly size={25} />

      <p className={styles.content}>{review}</p>
      <p className={styles.date}>{formatTime(reviewDate)}</p>
    </div>
  );
};

export default ProductReviewItem;
