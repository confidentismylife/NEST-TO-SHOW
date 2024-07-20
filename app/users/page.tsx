import React from 'react'

interface User {
    name:string,
    id:number,
    email:string
}

const UsersPag = async() => {
  const res=await fetch('https://jsonplaceholder.typicode.com/users')
  const user:User[]= await res.json()

  return (
    <div>
       <h1>UsersPag</h1>
       <p>{new Date().toLocaleTimeString()}</p>
       <table className='table table-bordered'>
        <thead>
            <tr>
                <th>NAME</th>
                <th>EMLAI</th>
            </tr>
        </thead>
        <tbody>
        {
            user.map((user)=>{
                return <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                </tr>
            })
        }</tbody>
       </table>
    </div>
  )
}

export default UsersPag
