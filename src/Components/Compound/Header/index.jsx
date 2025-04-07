import React from "react";
import { Link } from "react-router-dom";
import Profile from "../../../pages/Profile";
import Home from "../../../pages/Home";

const Header = () => {
  return <div className="flex items-center w-full bg-orange-300 py-3 px-6">
    <h1 className='w-full    font-bold text-[3vw]'><Link to={'/'} part={<Home/>}><i className="ri-chat-smile-3-fill"></i>TextConnect</Link>  </h1>
  </div>

}

export default Header;