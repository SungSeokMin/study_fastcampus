import { useState } from 'react';

import styles from './Pagination.module.scss';

interface IPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalProducts: number;
  productsPerPage: number;
}

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalProducts,
  productsPerPage,
}: IPaginationProps) => {
  const pageNumbers = [];

  const [pageNumberLimit] = useState(3);
  const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(3);
  const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const paginateNextPage = () => {
    setCurrentPage(currentPage + 1);

    if (currentPage + 1 > maxPageNumberLimit) {
      setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
    }
  };

  const paginatePrevPage = () => {
    setCurrentPage(currentPage - 1);

    if ((currentPage - 1) % pageNumberLimit === 0) {
      setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
    }
  };

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) pageNumbers.push(i);

  return (
    <div className={styles.pagination}>
      <li
        className={currentPage === pageNumbers[0] ? styles.hidden : ''}
        onClick={paginatePrevPage}
      >
        {'<'}
      </li>

      {pageNumbers.map((pageNumber) => {
        if (pageNumber < maxPageNumberLimit + 1 && pageNumber > minPageNumberLimit) {
          return (
            <li
              className={currentPage === pageNumber ? styles.active : ''}
              onClick={() => paginate(pageNumber)}
              key={pageNumber}
            >
              {pageNumber}
            </li>
          );
        }
      })}

      <li
        className={currentPage === pageNumbers[pageNumbers.length - 1] ? styles.hidden : ''}
        onClick={paginateNextPage}
      >
        {'>'}
      </li>
    </div>
  );
};

export default Pagination;
