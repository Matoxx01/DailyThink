import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBPsP8pe5SwKWZz_ly8w1rFiYH_SdbLvWI",
  authDomain: "dailythink-6c1d2.firebaseapp.com",
  databaseURL: "https://dailythink-6c1d2-default-rtdb.firebaseio.com",
  projectId: "dailythink-6c1d2",
  storageBucket: "dailythink-6c1d2.firebasestorage.app",
  messagingSenderId: "248827576886",
  appId: "1:248827576886:web:b8882d4f486360c4874e97",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const saveUserName = async (userName: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userName}`);
    await set(userRef, { name: userName });
  } catch (error) {
    console.error("Error saving user name to Firebase:", error);
    throw error;
  }
};

const saveMessage = async (userName: string, messageData: any): Promise<void> => {
  try {
    const messagesRef = ref(database, `users/${userName}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);
  } catch (error) {
    console.error("Error saving message to Firebase:", error);
    throw error;
  }
};

const getMessages = async (userName: string): Promise<any[]> => {
  try {
    const messagesRef = ref(database, `users/${userName}/messages`);
    const snapshot = await get(messagesRef);
    const messages = snapshot.val();
    return messages ? Object.values(messages) : [];
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    throw error;
  }
};

export { saveUserName, saveMessage, getMessages };
