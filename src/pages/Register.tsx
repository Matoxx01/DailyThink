import { 
    IonContent, 
    IonHeader, 
    IonPage, 
    IonTitle, 
    IonButton,
    IonText,
    IonInput,
    IonToolbar,
    IonLoading,
    IonItem,
    IonBreadcrumbs,
    IonBreadcrumb,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonToast
} from '@ionic/react';
import styles from './Register.module.scss';
import { logInOutline, globeOutline, home, eye, eyeOff, person, at, key } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../firebase_config';

const Register: React.FC = () => {
    const history = useHistory();
    const [nick, setNick] = useState('');
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [busy, setBusy] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function register() {
        setBusy(true);
        if (password !== confirmPassword) {
            setToastMessage('Las contraseñas no coinciden');
            setShowToast(true);
            setBusy(false);
            return;
        }
        if (mail.trim() === '' || password.trim() === '') {
            setToastMessage('Se requieren Mail y Contraseña');
            setShowToast(true);
            setBusy(false);
            return;
        }
    
        const res = await registerUser(mail, password, nick);
        if (res.success) {
            setToastMessage('Te has registrado correctamente');
            setShowToast(true);
            setTimeout(() => {
                history.push('/Login');
            }, 500);
        } else {
            setToastMessage(res.message || 'Hubo un error durante el registro');
            setShowToast(true);
        }
        setBusy(false);
    }

    const validateEmail = (email: string) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setEmailError(isValid ? '' : 'Ingrese un correo electrónico válido.');
        return isValid;
    };

    const validatePassword = (password: string) => {
        const isValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
        setPasswordError(isValid ? '' : 'La contraseña debe tener 8 caracteres, 1 mayúscula y 1 número.');
        return isValid;
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home"></IonBackButton>
                    </IonButtons>
                    <IonTitle>Registro</IonTitle>
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
                <IonBreadcrumb href="/Register">
                    Registro
                    <IonIcon slot="end" icon={globeOutline}></IonIcon>
                </IonBreadcrumb>
            </IonBreadcrumbs>
            <IonLoading message="Cargando..." duration={0} isOpen={busy} />

            <IonContent scrollY={true} className="ion-padding">
                <div className={styles.registerContainer}>
                    <h2 className={styles.registerTitle}>Crea tu cuenta</h2>
                    
                    <IonItem>
                        <IonIcon icon={person} slot="start" />
                        <IonInput 
                            placeholder="Nickname" 
                            style={{ minHeight: 'auto', flex: '1' }}
                            onIonChange={(e: any) => setNick(e.target.value)} 
                            required 
                        />
                    </IonItem>
                    
                    <IonItem>
                        <IonIcon icon={at} slot="start" />
                        <IonInput 
                            placeholder="Correo Electrónico" 
                            style={{ minHeight: 'auto', flex: '1' }}
                            onIonChange={(e: any) => {
                                const newEmail = e.target.value;
                                setMail(newEmail);
                                validateEmail(newEmail);
                            }} 
                            type="email" 
                            required 
                        />
                    </IonItem>
                    {emailError && <IonText color="danger" className={styles.emailError}>{emailError}</IonText>}
                    
                    <IonItem>
                        <IonIcon icon={key} slot="start" />
                        <IonInput 
                            placeholder="Contraseña" 
                            style={{ minHeight: 'auto', flex: '1' }}
                            type={showPassword ? 'text' : 'password'}
                            onIonChange={(e: any) => {
                                const newPassword = e.target.value;
                                setPassword(newPassword);
                                validatePassword(newPassword);
                            }} 
                            required 
                        />
                        <IonIcon 
                            icon={showPassword ? eyeOff : eye} 
                            slot="end" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className={styles.passwordIcon} 
                        />
                    </IonItem>
                    
                    <IonItem>
                        <IonIcon icon={key} slot="start" />
                        <IonInput 
                            placeholder="Confirmar Contraseña" 
                            style={{ minHeight: 'auto', flex: '1' }}
                            type={showConfirmPassword ? 'text' : 'password'}
                            onIonChange={(e: any) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                        <IonIcon 
                            icon={showConfirmPassword ? eyeOff : eye} 
                            slot="end" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className={styles.passwordIcon} 
                        />
                    </IonItem>
                    {password !== confirmPassword && confirmPassword && (
                        <IonText 
                            color="danger" 
                            className={styles.passwordError}
                            >
                            Las contraseñas no coinciden.
                        </IonText>
                    )}
                    {passwordError && (
                        <IonText 
                            color="danger" 
                            className={styles.passwordError}
                            >
                            {passwordError}
                        </IonText>
                    )}

                    <IonButton
                        expand="block" 
                        className={styles.registerButton} 
                        onClick={register}
                        disabled={ 
                            !nick || 
                            !mail || 
                            !password || 
                            !confirmPassword || 
                            passwordError !== '' || 
                            emailError !== '' || 
                            password !== confirmPassword
                        }
                    >
                        Registrarse
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

export default Register;
