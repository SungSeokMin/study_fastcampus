'use client';

import { useCallback, useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { DocumentData, collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from '@/firebase/firebase';
import { getErrorMEssage } from '@/utils/getErrorMessage';

const useFetchCollection = (collectionName: string) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCollection = useCallback(() => {
    setIsLoading(true);

    try {
      const docRef = collection(db, collectionName);
      const q = query(docRef, orderBy('createdAt', 'desc'));

      onSnapshot(q, (snapshot) => {
        const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setData(allData);
      });
    } catch (error) {
      toast.error(getErrorMEssage(error));
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  useEffect(() => getCollection(), [getCollection]);

  return { data, isLoading };
};

export default useFetchCollection;
