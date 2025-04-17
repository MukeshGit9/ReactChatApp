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
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/auth/register`, {
        username: formdata.username,
        email: formdata.email,
        password: formdata.password,
      });
      formdata.username = "";
      formdata.email = "";
      formdata.password = "";
      console.log(response.data.status);
      if (response.data.status === "success") {
        alert(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      setError(error.response.data.message);
      alert(error.response.data.message);
    }
  };

  return (
    <div className="flex w-full h-screen justify-center items-center bg-[#00baff]">
      <div className="w-[50%] px-6   items-center justify-center text-[10vw] text-white  relative">
        <i className="ri-chat-smile-3-fill text-[12vw] absolute top-[-60%] text-black right-0"></i>
        connecText
        <p className="text-[1.8vw] absolute bottom-0 ml-2 text-black"><i>___Where connection meets conversation</i></p>
      </div>
      <div className="flex h-screen w-[50%] flex-col items-center justify-center ">
        <form
          action=""
          onSubmit={handleRegister}
          className="bg-white  flex flex-col gap-2 justify-end rounded-[3vw] w-[70%] px-8 pt-40 pb-10 relative"
        >
          <h1 className="absolute top-0 left-[50%] translate-x-[-50%] text-[5vw] text-slate-400 py-4">
            Register
          </h1>
          <div className="flex flex-col mb-2">
            <label htmlFor="username" className="text-[1.2vw] ">
              Username
            </label>
            <input
              id="username"
              name="username"
              className="bg-slate-100 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-200"
              type="text"
              value={formdata.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col mb-2">
            <label htmlFor="email" className="text-[1.2vw]">
              Email
            </label>
            <input
              id="email"
              name="email"
              className="bg-slate-100 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-200"
              type="email"
              value={formdata.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col mb-2">
            <label htmlFor="password" className="text-[1.2vw]">
              Password
            </label>
            <input
              id="password"
              name="password"
              className="bg-slate-100 text-[1.2vw] text-blue-400 py-2 px-2 rounded-sm focus:outline-none focus:bg-slate-200"
              type="password"
              value={formdata.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-start gap-2">
            <button
              className="text-[1.2vw] py-2 px-6 bg-[#00baff] text-white font-bold cursor-pointer w-[100%] rounded-sm"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-[1.2vw] py-2">
          Already have an account?{" "}
          <Link className="text-white font-bold" to="/login" path={<Login />}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
