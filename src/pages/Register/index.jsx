import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Login from "../Login";
const serverUrl = import.meta.env.VITE_SERVER_URL;

const Register = () => {
  // const [username, setUsername] = useState('');
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [formdata, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

  }

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/auth/register`, {
        "username": formdata.username,
        "email": formdata.email,
        "password": formdata.password
      });
      formdata.username = '';
      formdata.email = '';
      formdata.password = '';
      console.log(response.data.status);
      if (response.data.status === "success") {
        alert(response.data.message)
        navigate('/login')
      }
    } catch (error) {
      setError(error.response.data.message)
      alert(error.response.data.message)
    }

  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <div className="text-[8vw]   text-orange-400"><i className="ri-chat-smile-3-fill"></i></div>
      <h1 className="text-[2.2vw] font-semibold text-center text-orange-400 mb-2">Let's Chat with TextConnect</h1>
      <form action="" onSubmit={handleRegister} className="bg-white py-6 flex flex-col gap-2  rounded-sm w-[27vw]">
        <div className="flex flex-col mb-2">
          <label htmlFor="username" className="text-[1.4vw] ">Username</label>
          <input id="username" name="username" className="bg-slate-200 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-100" type="text" value={formdata.username} onChange={handleChange} required />
        </div>
        <div className="flex flex-col mb-2">
          <label htmlFor="email" className="text-[1.4vw]">Email</label>
          <input id="email" name="email" className="bg-slate-200 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-100" type="email" value={formdata.email} onChange={handleChange} required />
        </div>
        <div className="flex flex-col mb-2">
          <label htmlFor="password" className="text-[1.4vw]">Password</label>
          <input id="password" name="password" className="bg-slate-200 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-100" type="password" value={formdata.password} onChange={handleChange} required />
        </div>
        <div className="flex items-center justify-start gap-2">
          <button className="text-[1.2vw] py-1 px-4 bg-black text-white cursor-pointer w-[100%] rounded-lg" type="submit">Register</button>
        </div>

      </form>
      <p className="text-[1.6vw] py-2">
        Already have an account? <Link className="text-blue-500" to='/login' path={<Login />} >Login</Link>
      </p>
    </div>
  )
}

export default Register;