import Login from './login'
import { useAuth } from '../hooks/useAuth'
import Dashboard from './dashboard';

export default function Home() {

  const {loading, user} = useAuth();

  if(loading) {
    return (
      <div className="loading loading-lg" />
    )
  }

  return user ? ( 
    <Dashboard/>
  ) : (
    <Login />
  );
  
}