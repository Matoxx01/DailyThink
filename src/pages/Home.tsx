import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonCheckbox,
  IonFooter,
  IonIcon,
  IonToolbar,
  IonItem,
  IonModal,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { camera, send } from 'ionicons/icons';
import { saveUserMessage, auth } from '../firebase_config';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../App';
import './Home.css';

const Home: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const history = useHistory();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [rememberSelection, setRememberSelection] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Verifica si el usuario está autenticado cada vez que se vuelve a la página
    if (!isLoggedIn) {
      const userSelection = localStorage.getItem('rememberPopupSelection');
      if (userSelection !== 'true') {
        setShowPopup(true); // Muestra el modal si el usuario no está autenticado
      }
    }
  }, [isLoggedIn]);

  const handleContinueWithoutLogin = () => {
    if (rememberSelection) {
      localStorage.setItem('rememberPopupSelection', 'true');
    }
    setShowPopup(false);
  };

  const handleLoginRedirect = () => {
    setShowPopup(false);
    history.push('/Login');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  interface MessageData {
    message: string;
    image: string | null;
    dateTime: string;
  }

  const handleSendMessage = async () => {
    if (user && message.trim()) {
      const now = new Date();
      const messageData: MessageData = {
        message,
        image: typeof image === 'string' ? image : null,
        dateTime: now.toISOString(),
      };      
  
      try {
        await saveUserMessage(user.uid, messageData);
        setMessage('');
        setImage(null);
      } catch (error) {
        console.error('Error saving message to Firebase:', error);
      }
    } else {
      alert('Por favor, escribe un mensaje válido e inicia sesión.');
    }
  };
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="title">DailyThink</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="input-container">
          <IonInput
            value={message}
            placeholder="¿Qué estás pensando?"
            onIonChange={(e) => setMessage(e.detail.value!)}
          />
          <IonButton onClick={handleSendMessage}>
            <IonIcon icon={send} />
          </IonButton>
          <IonButton>
            <label htmlFor="file-input">
              <IonIcon icon={camera} />
            </label>
          </IonButton>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <IonCard key={index}>
              <IonCardContent>
                <p>{msg.message}</p>
                {msg.image && <img src={msg.image} alt="Uploaded" />}
                <p>{new Date(msg.dateTime).toLocaleString()}</p>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>

      <IonModal isOpen={showPopup} backdropDismiss={false}>
        <center>
          <h2>¡Bienvenido a DailyThink!</h2>
          <p>
            Si quieres acceder a todas las funciones de DailyThink, primero debes iniciar sesión.
          </p>
        </center>
        <IonItem>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setRememberSelection(!rememberSelection)}
          >
            <IonCheckbox
              style={{ marginRight: '8px' }}
              checked={rememberSelection}
              onIonChange={(e) => e.stopPropagation()}
            />
            <span>Recordar selección</span>
          </div>
        </IonItem>
        <IonFooter>
          <IonToolbar>
            <IonButton expand="block" onClick={handleLoginRedirect}>
              Ingresar
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={handleContinueWithoutLogin}>
              Continuar sin ingresar
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </IonPage>
  );
};

export default Home;
