import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonRefresherContent,
  IonRefresher,
  IonFooter,
  IonRow,
  IonIcon,
  IonToolbar,
  IonModal,
  IonToast,
  IonCol,
  IonButton,
  IonInput,
  IonAlert,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { camera, send, star, trash } from 'ionicons/icons';
import { saveUserMessage, getMessages, auth, deleteUserMessage } from '../firebase_config';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../App';
import { toast } from '../toast';
import './Home.css';

const Home: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);
  const [rememberSelection, setRememberSelection] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    console.log('isLoggedIn:', isLoggedIn); // Verifica el estado de isLoggedIn
    if (!isLoggedIn) {
      // Si no hay un usuario autenticado, mostramos el popup
      console.log('Mostrar popup de inicio de sesión');
      setShowPopup(true);
    } else {
      setShowPopup(false);
      console.log('Usuario autenticado, ocultar popup');
    }
  }, [isLoggedIn]);
  
  useEffect(() => {
    if (user) {
      const loadMessages = async () => {
        try {
          const fetchedMessages = await getMessages();
          setMessages(fetchedMessages);
        } catch (error) {
          console.error('Error fetching messages from Firebase:', error);
        } finally {
          setLoading(false);
        }
      };
      loadMessages();
    }
  }, [user]);

  const handleDeleteMessage = (messageId: string) => {
    if (!messageId) return;
    console.log('ID del mensaje a eliminar:', messageId); // Verifica que el ID se pasa correctamente
    setMessageToDelete(messageId); // Almacena temporalmente el ID del mensaje a eliminar
    setShowAlert(true); // Muestra el cuadro de confirmación
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) {
      console.log('No se ha seleccionado un mensaje para eliminar');
      return; 
    }
  
    // Encuentra el mensaje con el ID correspondiente
    const message = messages.find((msg) => msg.id === messageToDelete);
    if (!message) {
      console.log('Mensaje no encontrado');
      return;
    }
  
    // Convierte la fecha de publicación a un objeto Date
    const messageDate = new Date(message.dateTime);
    const currentDate = new Date();
  
    // Calcula la diferencia en milisegundos
    const timeDifference = currentDate.getTime() - messageDate.getTime();
  
    // Si ha pasado más de una hora (3600000 milisegundos)
    if (timeDifference > 3600000) {
      console.log('Tiempo límite alcanzado, mostrando el toast');
      toast("Ya no puedes eliminar el mensaje, el tiempo límite es de una hora", 3000);
      return;
   }
  
    console.log('Confirmando eliminación del mensaje con ID:', messageToDelete);
  
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error('No se ha encontrado el UID del usuario');
        toast("Inicia sesión para eliminar tu mensaje", 3000);
        return;
      }
  
      await deleteUserMessage(uid, messageToDelete);
      console.log('Mensaje eliminado con éxito');
      toast("Mensaje eliminado con éxito", 3000);
      
      setMessages(messages.filter((msg) => msg.id !== messageToDelete));
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
    } finally {
      setShowAlert(false);
    }
  };

  useEffect(() => {
    if (user) {
      const loadMessages = async () => {
        try {
          const fetchedMessages = await getMessages();
          setMessages(fetchedMessages);
        } catch (error) {
          console.error('Error fetching messages from Firebase:', error);
          setLoading(false); // Asegúrate de actualizar el estado incluso si ocurre un error
        }
      };
      loadMessages();
    }
  }, [user]);  
  
  const loadMessages = async () => {
    if (user) {
      try {
        const fetchedMessages = await getMessages();
        console.log("Mensajes obtenidos:", fetchedMessages); // Verifica los mensajes obtenidos
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching messages from Firebase:', error);
      } finally {
        setLoading(false); // Cambia el estado a false cuando los mensajes hayan sido cargados
      }
    }
  };  

  const handleRefresh = async (event: CustomEvent) => {
    setLoading(true);
  
    try {
      await loadMessages();  
    } catch (error) {
      console.error('Error fetching messages on refresh:', error);
    } finally {
      setLoading(false); 
      event.detail.complete();
    }
  };  

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

  const toast = (message: string, duration: number) => {
    console.log("Mostrar toast:", message); // Verifica si se llama correctamente
    setToastMessage(message);
    setShowToast(true);
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
    uid: string;
  }

  const handleSendMessage = async () => {
    if (user && message.trim()) {
      const now = new Date();
      const messageData: MessageData = {
        message,
        image: typeof image === 'string' ? image : null,
        dateTime: now.toISOString(),
        uid: user.uid,
      };
  
      setLoading(true);  // Mostrar el indicador de carga antes de enviar el mensaje
  
      try {
        await saveUserMessage(user.uid, messageData);
        setMessage('');  // Limpiar el campo del mensaje
        setImage(null);  // Limpiar la imagen
        await loadMessages();  // Recargar los mensajes después de enviar
      } catch (error) {
        console.error('Error saving message to Firebase:', error);
      } finally {
        setLoading(false);  // Ocultar el indicador de carga una vez que los mensajes se hayan recargado
      }
    } else {
      alert('Por favor, escribe un mensaje válido e inicia sesión.');
    }
  };
  
  if (loading) {
    return (
      <IonPage>
        <IonContent className="loadingContainer" fullscreen>
          <div className="loadingContainer">
            <img src="load.gif" className="loadingImage" />
            <p className="loadingText">Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
      <>
        <IonPage id="main-content">
          <IonHeader>
            <IonToolbar>
              <IonTitle className="title">DailyThink</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent id="main-content" fullscreen>
            <IonRefresher className="pageUpdate"  slot="fixed" onIonRefresh={handleRefresh}>
                <IonRefresherContent
                  pullingIcon={star}
                  className='refreshSpinner'
                  refreshingSpinner="circles"
                  pullingText="Desliza hacia abajo para actualizar"
                  refreshingText="Actualizando recetas..."
                >
                </IonRefresherContent>
              </IonRefresher>
            <div className="input-container">
              <IonInput
              className='input'
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
            
            <center>
              {isLoggedIn ? (
                <IonButton onClick={() => history.push('/Account')}>
                  Mi Cuenta
                </IonButton>
                ) : (
                <IonButton onClick={() => history.push('/Login')}>
                  Iniciar sesión
                </IonButton>
                )}
                {isLoggedIn &&
                <IonButton onClick={() => history.push('/Timeline')}>
                  Cronograma
                </IonButton>
                }
              </center>
            <div className="messages-container">
              {messages.map((msg) => (
                <>
                <h4 key={msg.displayName} >{msg.displayName}</h4>
                <IonCard key={msg.id}>
                  <IonCardContent key={msg.id}>
                    <p>{msg.message}</p>
                    <img src={msg.image} />
                    <IonRow style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonCol size="auto">
                        <p>{new Date(msg.dateTime).toLocaleString()}</p>
                      </IonCol>
                      {user && msg.uid === user.uid && (
                        <IonCol size="auto" style={{ textAlign: 'right' }}>
                          <IonButton fill='outline' color="danger" onClick={() => handleDeleteMessage(msg.id)}>
                            <IonIcon icon={trash} />
                          </IonButton>
                        </IonCol>
                      )}
                    </IonRow>
                  </IonCardContent>
                </IonCard>
                </>
              ))}
            </div>
          </IonContent>

          <IonModal isOpen={showPopup} backdropDismiss={false}>
            <center>
              <h2>¡Bienvenido a DailyThink!</h2>
              <p style={{ padding: '0 20px' }}>
                Si quieres acceder a todas las funciones, primero debes iniciar sesión.
              </p>
            </center>
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
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)} // Asegura que se cierre el cuadro de alerta al descartarlo
          header="¿Estás seguro?"
          message="¿Quieres eliminar este mensaje?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setMessageToDelete(null); // Limpia el estado del mensaje a eliminar
                setShowAlert(false); // Cierra la alerta
              },
            },
            {
              text: 'Eliminar',
              handler: handleConfirmDelete, // Ejecuta la eliminación
            },
          ]}
        />
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />
      </>
  );
};

export default Home;
