import Login from './login'
import { useAuth } from '../hooks/useAuth'
import Dashboard from './dashboard';

export default function Home() {

  const {loading, user} = useAuth();

  if(loading) {
    return (
      <div class='justify-center align-middle'>
        <div class="loading loading-lg" />
      </div>
    )
  }

  return user ? ( 
    <Dashboard/>
  ) : (
    <Login />
  );
  
}