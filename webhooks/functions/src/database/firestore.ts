import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const push = async (key: string, value: FirebaseFirestore.DocumentData) => {
  const docRef = db.collection("user-storage").doc(key);
  await docRef.set(value);
}

export const pull = async (key: string) => {
  const docRef = db.collection("user-storage").doc(key);
  const doc = await docRef.get();

  return doc;
}