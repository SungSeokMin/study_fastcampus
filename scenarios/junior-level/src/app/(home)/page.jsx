import { Fragment } from 'react';

import Slider from '@/components/slider/Slider';
import Product from '@/components/product/Product';

export default function Home() {
  return (
    <Fragment>
      <Slider />

      <Product />
    </Fragment>
  );
}
