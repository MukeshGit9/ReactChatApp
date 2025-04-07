import React from "react";
import { Link } from "react-router-dom";

const NavLink = ({children, url, element, ...props})=>{
  const linkCss='text-white text-[1.2vw] hover:text-gray-400'
  return <Link to={url} path={element} {...props} className={linkCss}>{children}</Link>
  
}

export default NavLink;