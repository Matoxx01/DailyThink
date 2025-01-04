import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonButton,
  IonInput,
  IonToolbar,
  IonLoading,
  IonItem,
  IonBreadcrumbs,
  IonBreadcrumb,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonToast,
  IonText
} from '@ionic/react';
import styles from './Reset.module.scss';
import { refreshOutline, logInOutline, home, at } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { resetPassword } from '../firebase_config';

const Reset: React.FC = () => {
  const history = useHistory();
  const [mail, setMail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [busy, setBusy] = useState<boolean>(false);

  function isValidEmail(email: string) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
  }

  async function reset() {
      setBusy(true);
      if (!isValidEmail(mail)) {
          setToastMessage('El correo electrónico es inválido.');
          setShowToast(true);
          setBusy(false);
          return;
      }

      const res = await resetPassword(mail);

      if (!res.success) {
          setToastMessage(res.message || 'Error desconocido');
          setShowToast(true);
      } else {
          setToastMessage('Se ha enviado el correo de restablecimiento correctamente');
          setShowToast(true);
      }
      setBusy(false);
  }

  return (
      <IonPage>
          <IonHeader>
              <IonToolbar>
                  <IonButtons slot="start">
                      <IonBackButton defaultHref="/home"></IonBackButton>
                  </IonButtons>
                  <IonTitle>Restablecer Contraseña</IonTitle>
              </IonToolbar>
          </IonHeader>
          <IonBreadcrumbs>
              <IonBreadcrumb href="/home">
                  Home
                  <IonIcon slot="end" icon={home}></IonIcon>
              </IonBreadcrumb>
              <IonBreadcrumb href="/Login">
                  Login
                  <IonIcon slot="end" icon={logInOutline}></IonIcon>
              </IonBreadcrumb>
              <IonBreadcrumb href="/Reset">
                  Restablecer Contraseña
                  <IonIcon slot="end" icon={refreshOutline}></IonIcon>
              </IonBreadcrumb>
          </IonBreadcrumbs>
          <IonLoading message="Cargando..." duration={0} isOpen={busy} />
          <IonContent scrollY={true} className="ion-padding">
              <div className={styles.resetContainer}>
                  <h2 className={styles.resetTitle}>Recupera tu acceso</h2>
                  
                  <IonItem>
                      <IonIcon icon={at} slot="start" />
                      <IonInput 
                          placeholder="Correo Electrónico" 
                          style={{ minHeight: 'auto', flex: '1' }}
                          onIonChange={(e: any) => setMail(e.target.value)} 
                          type="email" 
                          required 
                      />
                  </IonItem>

                  <IonButton
                      expand="block" 
                      className={styles.resetButton} 
                      onClick={reset}
                  >
                      Restablecer Contraseña
                  </IonButton>

                  <IonToast
                      isOpen={showToast}
                      onDidDismiss={() => setShowToast(false)}
                      message={toastMessage}
                      duration={2000}
                  />
              </div>
          </IonContent>
      </IonPage>
  );
};

export default Reset;
