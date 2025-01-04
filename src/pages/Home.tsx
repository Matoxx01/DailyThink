import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonModal,
  IonButton,
  IonInput,
  IonLabel,
  IonCard,
  IonCardContent,
  IonFooter,
} from '@ionic/react';
import { saveUserName, saveMessage, getMessages } from '../firebase_config';
import './Home.css';

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
      setIsModalOpen(false);
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = async () => {
    if (name.trim()) {
      try {
        await saveUserName(name);
        localStorage.setItem('userName', name);
        console.log('Nombre guardado:', name);
        setIsModalOpen(false);
        console.log('Modal cerrado:', isModalOpen);
      } catch (error) {
        console.error('Error saving name to Firebase:', error);
      }
    } else {
      alert('Por favor, ingresa un nombre válido.');
    }
  };

  const handleSendMessage = async () => {
    const now = new Date();
    const messageData = {
      message,
      image,
      dateTime: now.toISOString(),
    };
    try {
      await saveMessage(name, messageData);
      setMessage('');
    } catch (error) {
      console.error('Error saving message to Firebase:', error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getMessages(name);
        setMessages(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (name) {
      fetchMessages();
    }
  }, [name]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="title">DailyThink</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {name && (
          <div className="message-container">
            <h2>¿Qué estás pensando?</h2>
            <IonInput
              value={message}
              onIonChange={(e) => setMessage(e.detail.value!)}
              placeholder="Escribe tu mensaje..."
              clearInput
            />
            <IonToolbar>
              <IonButton expand="block" onClick={handleSendMessage}>
                Enviar
              </IonButton>
              <input slot="end" type="file" accept="image/*" onChange={handleImageChange} />
            </IonToolbar>

            <div className="messages-list">
              {messages.map((msg, index) => (
                <IonCard key={index} className="message-card">
                  <IonCardContent>
                    <h3>{msg.message}</h3>
                    <small>{new Date(msg.dateTime).toLocaleString()}</small>
                  </IonCardContent>
                  {image && <img src={msg.image} alt="message" />}
                </IonCard>
              ))}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
    
  );
};

export default Home;