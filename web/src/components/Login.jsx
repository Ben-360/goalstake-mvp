import React, { useState } from 'react'
import { signup, login } from '../api/api'
export default function Login({ onLogin }){
  const [isSignup, setSignup] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', referralCode: '' });
  const [error, setError] = useState(null);
  async function handleSignup(e){ e.preventDefault(); try{ const res = await signup(form); onLogin(res.user); }catch(err){ setError('Signup failed') } }
  async function handleLogin(e){ e.preventDefault(); try{ const res = await login({ email: form.email, password: form.password }); onLogin(res.user); }catch(err){ setError('Login failed') } }
  return (<div style={{maxWidth:420}}><h2>GoalStake</h2><p>Predict. Play. Win Weekly.</p><form onSubmit={isSignup ? handleSignup : handleLogin}>{isSignup && (<input placeholder='Name' value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />)}<input placeholder='Email' value={form.email} onChange={e=>setForm({...form, email: e.target.value})} /><input placeholder='Password' type='password' value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />{isSignup && (<input placeholder='Referral Code (optional)' value={form.referralCode} onChange={e=>setForm({...form, referralCode: e.target.value})} />)}<button type='submit'>{isSignup ? 'Sign up' : 'Log in'}</button></form><button onClick={()=>setSignup(s=>!s)} style={{marginTop:10}}>{isSignup ? 'Have an account? Log in' : 'Create account'}</button>{error && <div style={{color:'red'}}>{error}</div>}</div>)
}
