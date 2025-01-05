import { Redirect, Route } from 'react-router-dom';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Reset from './pages/Reset';
import Account from './pages/Account';
import Register from './pages/Register';
import Timeline from './pages/Timeline';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
});
const [user, setUser] = useState<{ uid: string; email: string; displayName: string } | null>(() => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
});

const setAuthStatus = (status: boolean) => {
  setIsLoggedIn(status);
  localStorage.setItem('isLoggedIn', status.toString());
};

const setAuthUser = (user: { uid: string; email: string; displayName: string } | null) => {
  setUser(user);
  if (user) {
      localStorage.setItem('user', JSON.stringify(user));
  } else {
      localStorage.removeItem('user');
  }
};

return (
  <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn: setAuthStatus, setUser }}>
    {children}
  </AuthContext.Provider>
);
};

interface AuthUser {
  uid: string;
  displayName?: string;
  email?: string;
}

interface AuthContext {
  user: AuthUser | null;
  isLoggedIn: boolean;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthContextType {
isLoggedIn: boolean;
user: { uid: string; email: string; displayName: string } | null;
setIsLoggedIn: (status: boolean) => void;
setUser: (user: { uid: string; email: string; displayName: string } | null) => void;
}

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id='main-content'>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route path="/Login" component={Login} exact={true} />
          <Route path="/Reset" component={Reset} exact={true} />
          <Route path="/Account" component={Account} exact={true} />
          <Route path="/Register" component={Register} exact={true} />
          <Route path="/Timeline" component={Timeline} exact={true} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;
