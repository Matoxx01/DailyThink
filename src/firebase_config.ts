import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  deleteUser as firebaseDeleteUser,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
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

const auth = getAuth();

const user = auth.currentUser;
if (user !== null) {
    const displayName = user.displayName;
    const email = user.email;
    const photoURL = user.photoURL;
    const emailVerified = user.emailVerified;
    const uid = user.uid;
}

export async function loginUser(mail: string, password: string) {
    try {
        const res = await signInWithEmailAndPassword(auth, mail, password);
        console.log("Usuario autenticado correctamente:", res.user);
        return { success: true, uid: res.user?.uid  };
    } catch (error: any) {
        console.error("Error en loginUser:", error);
        let message = 'Hay un error con tu mail o contraseña.';
        if (error.code === 'auth/user-not-found') {
            message = 'Este mail no está registrado.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Contraseña incorrecta.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'El correo electrónico es inválido.';
        }
        return { success: false, message };
    }
}

export async function registerUser(mail: string, password: string, nick: string) {
  try {
      const res = await createUserWithEmailAndPassword(auth, mail, password);
      const user = res.user;
      console.log("Usuario registrado correctamente:", user);
      await updateProfile(user, { displayName: nick });
      return { success: true };
  } catch (error: any) {
      console.error("Error en registerUser:", error);
      if (error.code === 'auth/email-already-in-use') {
          return { success: false, message: 'Este mail ya está registrado' };
      }
      return { success: false, message: 'Error durante el registro' };
  }
}

export async function resetPassword(mail: string) {
  try {
      console.log("Enviando correo de restablecimiento a:", mail);
      await sendPasswordResetEmail(auth, mail);
      console.log("Correo de restablecimiento enviado.");
      return { success: true };
  } catch (error: any) {
      console.error("Error en resetPassword:", error);
      if (error.code === 'auth/user-not-found') {
          return { success: false, message: 'Este mail no está registrado.' };
      }
      return { success: false, message: 'Hay un error con el Mail ingresado.' };
  }
}

export async function deleteUserAccount(user: any) {
  try {
      console.log("Eliminando cuenta del usuario:", user);
      await firebaseDeleteUser(user);
      console.log("Cuenta eliminada correctamente.");
      return { success: true };
  } catch (error: any) {
      console.error("Error al eliminar la cuenta:", error);
      return { success: false, message: 'No se pudo eliminar la cuenta.' };
  }
}

export async function saveUserMessage(uid: string, messageData: { message: string; image: string | null; dateTime: string }) {
  try {
    const messageRef = push(ref(database, `users/${uid}`));
    await set(messageRef, messageData);
    console.log("Mensaje guardado exitosamente:", messageData);
  } catch (error) {
    console.error("Error al guardar el mensaje en Firebase:", error);
    throw error;
  }
}


export { database, ref, set, get, child, push, auth, user };
