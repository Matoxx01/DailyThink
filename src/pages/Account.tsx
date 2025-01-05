import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonButton,
    IonLabel,
    IonInput,
    IonToolbar,
    IonAlert,
    IonItem,
    IonToast,
    IonBreadcrumbs,
    IonBreadcrumb,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonLoading,
    IonText
} from '@ionic/react';
import styles from './Account.module.scss';
import { home, person, at } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { deleteUserAccount } from '../firebase_config';
import { getAuth, signOut, updateEmail, updateProfile } from 'firebase/auth';
import { useAuth } from '../App';

const Account: React.FC = () => {
    const history = useHistory();
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const auth = getAuth();
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    const [email, setEmail] = useState(auth.currentUser?.email || '');
    const [nick, setNick] = useState(auth.currentUser?.displayName || '');
    const [busy, setBusy] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleLogout = async () => {
        setBusy(true);
        try {
            await signOut(auth);
            setIsLoggedIn(false);
            setToastMessage('Sesión cerrada con éxito');
            setShowToast(true);
            history.push('/Home');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setToastMessage('Error al cerrar sesión');
            setShowToast(true);
        } finally {
            setBusy(false);
        }
    };

    const handleUpdateProfile = async () => {
        setBusy(true);
        const user = auth.currentUser;
        if (user) {
            try {
                await updateProfile(user, { displayName: nick });
                if (email !== user.email) {
                    await updateEmail(user, email);
                }
                setToastMessage('Perfil actualizado correctamente');
                setShowToast(true);
            } catch (error) {
                console.error("Error al actualizar el perfil:", error);
                setToastMessage('Error al actualizar el perfil');
                setShowToast(true);
            } finally {
                setBusy(false);
            }
        }
    };

    const handleDeleteAccount = async () => {
        setBusy(true);
        const user = auth.currentUser;
        if (user) {
            try {
                const res = await deleteUserAccount(user);
                if (res.success) {
                    setIsLoggedIn(false);
                    setToastMessage('Cuenta eliminada correctamente');
                    history.push('/home');
                } else {
                    setToastMessage(res.message || 'Error al eliminar la cuenta');
                }
            } catch (error) {
                setToastMessage('Error al eliminar la cuenta');
            } finally {
                setBusy(false);
                setShowToast(true);
            }
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home"></IonBackButton>
                    </IonButtons>
                    <IonTitle>Mi cuenta</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonBreadcrumbs>
                <IonBreadcrumb href="/home">
                    Home
                    <IonIcon slot="end" icon={home}></IonIcon>
                </IonBreadcrumb>
                <IonBreadcrumb href="/Login">
                    Mi cuenta
                    <IonIcon slot="end" icon={person}></IonIcon>
                </IonBreadcrumb>
            </IonBreadcrumbs>
            <IonLoading message="Cargando..." duration={0} isOpen={busy} />

            <IonContent scrollY={true} className="ion-padding">
                <div className={styles.accountContainer}>
                    <h2 className={styles.accountTitle}>Gestiona tu cuenta</h2>

                    <IonItem>
                        <IonIcon icon={at} slot="start" />
                        <IonInput 
                            placeholder="Correo Electrónico" 
                            value={email}
                            style={{ minHeight: 'auto', flex: '1' }}
                            onIonChange={(e) => setEmail(e.detail.value!)}
                            type="email" 
                            required 
                        />
                    </IonItem>

                    <IonItem>
                        <IonIcon icon={person} slot="start" />
                        <IonInput 
                            placeholder="Nuevo Apodo" 
                            value={nick}
                            style={{ minHeight: 'auto', flex: '1' }}
                            onIonChange={(e) => setNick(e.detail.value!)}
                            type="text" 
                            required 
                        />
                    </IonItem>

                    <IonButton 
                        expand="block" 
                        className={styles.updateButton} 
                        onClick={handleUpdateProfile}
                    >
                        Actualizar Información
                    </IonButton>

                    <IonButton 
                        onClick={() => history.push('/Reset_account')}
                        expand="block"
                        className={styles.resetButton}
                    >
                        Restablecer contraseña
                    </IonButton>

                    <IonButton 
                        expand="block" 
                        className={styles.closeButton} 
                        onClick={() => setShowLogoutAlert(true)}
                    >
                        Cerrar Sesión
                    </IonButton>

                    <IonButton 
                        expand="block" 
                        className={styles.deleteButton} 
                        onClick={() => setShowConfirmAlert(true)}
                    >
                        Eliminar Cuenta
                    </IonButton>

                    <IonAlert
                        isOpen={showLogoutAlert}
                        onDidDismiss={() => setShowLogoutAlert(false)}
                        header={'¿Seguro que quiere cerrar sesión?'}
                        buttons={[
                            { text: 'No', role: 'cancel' },
                            { text: 'Sí', handler: handleLogout },
                        ]}
                    />

                    <IonAlert
                        isOpen={showConfirmAlert}
                        onDidDismiss={() => setShowConfirmAlert(false)}
                        header={'¿Seguro que quiere eliminar la cuenta?'}
                        buttons={[
                            { text: 'No', role: 'cancel' },
                            { text: 'Sí', handler: handleDeleteAccount },
                        ]}
                    />

                    <IonToast 
                        isOpen={showToast} 
                        message={toastMessage} 
                        duration={2000} 
                        onDidDismiss={() => setShowToast(false)} 
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Account;
