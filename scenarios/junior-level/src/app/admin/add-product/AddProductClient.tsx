'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'react-toastify';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Timestamp, addDoc, collection } from 'firebase/firestore';

import { db, storage } from '@/firebase/firebase';

import Loader from '@/components/loader/Loader';
import Heading from '@/components/heading/Heading';
import Button from '@/components/button/Button';

import styles from './AddProduct.module.scss';
import { getErrorMEssage } from '@/utils/getErrorMessage';

export const categories = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Electronics' },
  { id: 3, name: 'Fashion' },
  { id: 4, name: 'Phone' },
  { id: 5, name: 'Movies & Television' },
  { id: 6, name: 'Home & Kitchen' },
  { id: 7, name: 'Automotive' },
  { id: 8, name: 'Software' },
  { id: 9, name: 'Video Games' },
  { id: 10, name: 'Sports & Outdoor' },
  { id: 11, name: 'Toys & Games' },
  { id: 12, name: 'Industrial & Scientific' },
];

const initialState = {
  name: '',
  imageURL: '',
  price: 0,
  category: '',
  brand: '',
  desc: '',
};

const AddProductClient = () => {
  const [product, setProduct] = useState({ ...initialState });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const file = event.target.files[0];

    const storageRef = ref(storage, `images/${Date.now()}${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadProgress(progress);
      },
      (error) => toast.error(error.message),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProduct({ ...product, imageURL: downloadURL });
          toast.success('이미지를 성공적으로 업로드했습니다.');
        });
      }
    );
  };

  const addProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      addDoc(collection(db, 'products'), {
        name: product.name,
        imageURL: product.imageURL,
        price: Number(product.price),
        category: product.category,
        brand: product.brand,
        desc: product.desc,
        createdAt: Timestamp.now().toDate(),
      });

      setUploadProgress(0);
      setProduct({ ...initialState });

      toast.success('상품을 저장했습니다.');
      router.push('/admin/all-products');
    } catch (error) {
      toast.error(getErrorMEssage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      <div className={styles.product}>
        <Heading title="새 상품 생성하기" />

        <form onSubmit={addProduct}>
          <label htmlFor="name">상품 이름:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            placeholder="상품 이름"
            onChange={(event) => handleInputChange(event)}
            required
          />

          <div>
            {uploadProgress === 0 ? null : (
              <div className={styles.progress}>
                <div className={styles['progress-bar']} style={{ width: `${uploadProgress}%` }}>
                  {uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : `Upload Complete ${uploadProgress}%`}
                </div>
              </div>
            )}

            <input
              type="file"
              placeholder="상품 이미지"
              accept="image/*"
              name="image"
              onChange={(event) => handleImageChange(event)}
              required
            />

            {product.imageURL === '' ? null : (
              <input
                type="text"
                name="imageURL"
                disabled
                value={product.imageURL}
                required
                placeholder="이미지 URL"
              />
            )}
          </div>

          <label htmlFor="price">상품 가격:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            placeholder="상품 가격"
            onChange={(event) => handleInputChange(event)}
            required
          />

          <label htmlFor="category">상품 카테고리:</label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={(event) => handleInputChange(event)}
            required
          >
            <option value="" disabled>
              --상품 카테고리 선택
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <label htmlFor="brand">상품 브랜드:</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={product.brand}
            placeholder="상품 브랜드/회사"
            onChange={(event) => handleInputChange(event)}
            required
          />

          <label htmlFor="desc">상품 설명:</label>
          <textarea
            id="desc"
            name="desc"
            value={product.desc}
            cols={10}
            rows={10}
            required
            onChange={(event) => handleInputChange(event)}
          />

          <Button type="submit">상품 생성</Button>
        </form>
      </div>
    </>
  );
};

export default AddProductClient;
