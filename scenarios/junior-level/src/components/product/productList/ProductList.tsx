import { ChangeEvent, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { SORT_PRODUCTS, selectFilteredProducts } from '@/redux/slice/filterSlice';

import Pagination from '@/components/pagination/Pagination';

import ProductItem from '../productItem/ProductItem';

import styles from './ProductList.module.scss';

const ProductList = () => {
  const [sort, setSort] = useState('latest');

  const dispatch = useDispatch();

  const filteredProducts = useSelector(selectFilteredProducts);

  useEffect(() => {
    dispatch(SORT_PRODUCTS({ products: filteredProducts, sort }));
  }, [dispatch, sort]);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(1);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFastProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFastProduct, indexOfLastProduct);

  const isRadioSelected = (value: string) => sort === value;
  const handleRadioClick = (event: ChangeEvent<HTMLInputElement>) => setSort(event.target.value);

  return (
    <div className={styles.productList}>
      <div className={styles.top}>
        <div>
          <ul className={styles.sort}>
            <li className={isRadioSelected('latest') ? styles.selected : ''}>
              <input
                type="radio"
                value="latest"
                id="latest"
                checked={isRadioSelected('latest')}
                onChange={handleRadioClick}
              />
              <label htmlFor="latest">최신순</label>
            </li>

            <li className={isRadioSelected('lowest-price') ? styles.selected : ''}>
              <input
                type="radio"
                value="lowest-price"
                id="lowest-price"
                checked={isRadioSelected('lowest-price')}
                onChange={handleRadioClick}
              />
              <label htmlFor="lowest-price">낮은가격순</label>
            </li>

            <li className={isRadioSelected('highest-price') ? styles.selected : ''}>
              <input
                type="radio"
                value="highest-price"
                id="highest-price"
                checked={isRadioSelected('highest-price')}
                onChange={handleRadioClick}
              />
              <label htmlFor="highest-price">높은가격순</label>
            </li>
          </ul>
        </div>

        <div className={styles.limit}>
          <select
            value={productsPerPage}
            onChange={(event) => setProductsPerPage(Number(event.target.value))}
          >
            <option value={10}>10개씩 보기</option>
            <option value={20}>20개씩 보기</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {currentProducts.length === 0 ? (
          <p>상품이 없습니다.</p>
        ) : (
          currentProducts.map((product) => (
            <div key={product.id}>
              <ProductItem {...product} />
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalProducts={filteredProducts.length}
        productsPerPage={productsPerPage}
      />
    </div>
  );
};

export default ProductList;
