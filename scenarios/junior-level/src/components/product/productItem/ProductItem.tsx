import Link from 'next/link';
import Image from 'next/image';

import { Rating } from 'react-simple-star-rating';

import styles from './ProductItem.module.scss';

import { priceFormat } from '@/utils/priceFormat';
import useFetchDocuments from '@/hooks/useFetchDocuments';

interface IProductItemProps {
  id: string;
  name: string;
  price: number;
  imageURL: string;
}

const ProductItem = ({ id, name, price, imageURL }: IProductItemProps) => {
  // const { documents } = useFetchDocuments('reviews', ['productID', '==', id]);

  // const productRating = documents.reduce((acc, cur) => acc + cur.rate, 0);
  // const rating = productRating / documents.length || 0;

  const shortenText = (text: string, n: number) => {
    if (text.length <= n) return text;

    return text.substring(0, n).concat('...');
  };

  return (
    <div className={styles.grid}>
      <Link href={`/product-details/${id}`}>
        <div className={styles.img}>
          <Image src={imageURL} alt={name} width={265} height={265} />
        </div>
      </Link>

      <div className={styles.content}>
        <div className={styles.details}>
          <p>{shortenText(name, 10)}</p>
          <strong style={{ color: '#cb1400' }}>{priceFormat(price)}</strong>원{' '}
          <div>
            <Rating initialValue={1} size={17} readonly />
            <span className={styles.ratingCount}>({1})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
