import '../styles/globals.css'
import Login from './login'
import Dashboard from './dashboard'
import { AuthProvider } from '../hooks/useAuth';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp