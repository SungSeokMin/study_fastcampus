import { useCallback, useEffect, useState } from 'react';

import { DocumentData, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

import { db } from '@/firebase/firebase';

const useFetchDocument = (collectionName: string, documentID: string) => {
  const [document, setDocument] = useState<DocumentData | null>(null);

  const getDocument = useCallback(async () => {
    const docRef = doc(db, collectionName, documentID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return toast.error('Document not found');

    setDocument({ id: documentID, ...docSnap.data() });
  }, [collectionName, documentID]);

  useEffect(() => {
    getDocument();
  }, [getDocument]);

  return { document };
};

export default useFetchDocument;
