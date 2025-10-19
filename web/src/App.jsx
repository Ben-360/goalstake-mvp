import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { getCurrentChallenges } from './api/api'
export default function App(){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('gs_user')) || null);
  const [challenges, setChallenges] = useState([]);
  useEffect(()=>{ getCurrentChallenges().then(list=>setChallenges(list)).catch(()=>{}); },[])
  return (<div className="app-root" style={{fontFamily: 'Inter, system-ui', padding: 20}}>{!user ? <Login onLogin={(u)=>{ setUser(u); localStorage.setItem('gs_user', JSON.stringify(u)); }} /> : <Dashboard user={user} challenges={challenges} />}</div>)
}
