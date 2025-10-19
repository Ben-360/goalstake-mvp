import React from 'react'
export default function Dashboard({ user, challenges }){
  return (<div><h3>Welcome, {user.name || user.id}</h3><div style={{border:'1px solid #eee', padding:12, marginBottom:12}}><strong>Active Challenges</strong><ul>{challenges.map(c=> <li key={c._id}>{c.title} — Entry: {c.entryFee}</li>)}</ul></div></div>)
}
