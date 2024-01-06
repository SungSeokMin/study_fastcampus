'use client';

import { useCallback, useEffect, useState } from 'react';

import { DocumentData, WhereFilterOp, collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/firebase/firebase';

const useFetchDocuments = (collectionName: string, arg: [string, WhereFilterOp, string]) => {
  const [documents, setDocuments] = useState<DocumentData>([]);

  const getDocuments = useCallback(async () => {
    const q = query(collection(db, collectionName), where(arg[0], arg[1], arg[2]));
    const querySnapshot = await getDocs(q);

    let temp: DocumentData = [];
    querySnapshot.forEach((doc) => temp.push({ id: doc.id, ...doc.data() }));
    setDocuments(temp);
  }, [collectionName, arg[0], arg[1], arg[2]]);

  useEffect(() => {
    getDocuments();
  }, [getDocuments]);

  return { documents };
};

export default useFetchDocuments;
