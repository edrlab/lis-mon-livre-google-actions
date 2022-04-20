import * as admin from 'firebase-admin';
import {Timestamp} from '@google-cloud/firestore';

admin.initializeApp();

export const push = async (key: string, value: FirebaseFirestore.DocumentData) => {
  const db = admin.firestore();
  const docRef = db.collection('user-storage').doc(key);
  await docRef.set(value);
};


// replace Timestamp object from firestore to Date native instance
// but why Firestore return a Timestamp object !?
const convertTimestampRecurs = (obj: {[str:string]:any}) => {
  const ret = Object.entries(obj).reduce((pv, [k, v]) => {
    return {
      ...pv,
      [k]: v instanceof Timestamp ?
        v.toDate() :
        typeof v === 'object' ?
          convertTimestampRecurs(v) :
          v,
    };
  }, {});

  return ret;
};

export const pull = async (key: string): Promise<{[str:string]:any}> => {
  const db = admin.firestore();
  const docRef = db.collection('user-storage').doc(key);
  const doc = await docRef.get();
  const data = doc.exists ? doc.data() : undefined;
  const newData = data ? convertTimestampRecurs(data) : data;
  return newData;
};
