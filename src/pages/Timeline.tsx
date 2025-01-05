import React, { useState, useEffect } from 'react';
import { 
    IonContent,
    IonHeader,
    IonPage,
    IonButtons,
    IonTitle,
    IonBackButton,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonDatetime,
    IonButton,
    IonRow,
    IonCol,
    IonIcon,
} from '@ionic/react';
import { getMessages } from '../firebase_config';
import styles from './Timeline.module.scss';

const Timeline: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
    const [messages, setMessages] = useState<any[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
    const [highlightedDates, setHighlightedDates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const fetchedMessages = await getMessages();
            setMessages(fetchedMessages);

            // Crear fechas destacadas dinámicamente
            const datesSet = new Set(
              fetchedMessages.map((msg) => 
                new Date(msg.dateTime).toISOString().split('T')[0]
              )
            );

            const highlighted = Array.from(datesSet).map((date) => ({
              date,
              textColor: '#800080',
              backgroundColor: '#fe7c7c',
            }));

            setHighlightedDates(highlighted);
          } catch (error) {
            console.error('Error fetching messages:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchMessages();
      }, []);
    
    useEffect(() => {
        if (selectedDate) {
          const selectedDateOnly = new Date(selectedDate).toISOString().split('T')[0];
          const filtered = messages.filter((msg) => {
            const messageDate = new Date(msg.dateTime).toISOString().split('T')[0];
            return messageDate === selectedDateOnly;
          });
          setFilteredMessages(filtered);
        }
      }, [selectedDate, messages]);
    
      if (loading) {
        return (
          <IonPage>
            <IonContent className="loadingContainer" fullscreen>
              <div className="loadingContainer">
                <p>Cargando mensajes...</p>
              </div>
            </IonContent>
          </IonPage>
        );
      }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Cronología</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
            <div className="datetime-container">
            <IonDatetime
                className={styles.calendar}
                presentation='date'
                value={selectedDate}
                highlightedDates={highlightedDates}
                onIonChange={(e) => setSelectedDate(Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!)}
            />
            </div>
            <div className="messages-container">
            {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                <>
                <h4>{msg.displayName}</h4>
                <IonCard key={msg.id}>
                    <IonCardContent>
                    <p>{msg.message}</p>
                    {msg.image && <img src={msg.image} alt="Uploaded" />}
                    <IonRow style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonCol size="auto">
                        <p>{new Date(msg.dateTime).toLocaleString()}</p>
                        </IonCol>
                    </IonRow>
                    </IonCardContent>
                </IonCard>
                </>
                ))
            ) : (
                <center><p>No hay mensajes para la fecha seleccionada.</p></center>
            )}
            </div>
            </IonContent>
        </IonPage>
    );
};

export default Timeline;