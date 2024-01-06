import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { selectMaxPrice, selectMinPrice, selectProducts } from '@/redux/slice/productSlice';
import { FILTER_BY } from '@/redux/slice/filterSlice';

import { priceFormat } from '@/utils/priceFormat';

import styles from './ProductFilter.module.scss';
import Button from '@/components/button/Button';

const ProductFilter = () => {
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [price, setPrice] = useState(10000);

  const products = useSelector(selectProducts);
  const minPrice = useSelector(selectMinPrice);
  const maxPrice = useSelector(selectMaxPrice);

  const dispatch = useDispatch();

  const allCategories = ['All', ...new Set(products.map((product) => product.category))];

  const filterCategories = (category: string) => setCategory(category);

  const allBrands = ['All', ...new Set(products.map((product) => product.brand))];

  useEffect(() => {
    dispatch(FILTER_BY({ products, category, brand, price }));
  }, [dispatch, products, category, brand, price]);

  const clearFilters = () => {
    setCategory('All');
    setBrand('All');
    setPrice(maxPrice);
  };

  return (
    <div className={styles.filter}>
      <h4>카테고리</h4>
      <div className={styles.category}>
        {allCategories.map((currentCategory) => (
          <button
            key={currentCategory}
            type="button"
            className={category === currentCategory ? styles.active : ''}
            onClick={() => filterCategories(currentCategory)}
          >
            &#8250; {currentCategory}
          </button>
        ))}
      </div>

      <h4>브랜드</h4>
      <div className={styles.brand}>
        <select value={brand} onChange={(event) => setBrand(event.target.value)}>
          {allBrands.map((currentBrand) => (
            <option key={currentBrand} value={currentBrand}>
              {currentBrand}
            </option>
          ))}
        </select>
      </div>

      <h4>가격</h4>
      <p>{priceFormat(Number(price))}원</p>
      <div className={styles.price}>
        <input
          type="range"
          value={price}
          onChange={(event) => setPrice(event.target.valueAsNumber)}
          min={minPrice}
          max={maxPrice}
        />
      </div>

      <br />

      <Button onClick={clearFilters}>필터 초기화</Button>
    </div>
  );
};

export default ProductFilter;
