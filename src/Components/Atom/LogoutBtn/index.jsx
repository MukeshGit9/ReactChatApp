import React from "react";
import useLogOut from "../../../utilities/UseLogOut";

const LogoutBtn = () => {
       const logoutFun = useLogOut();
       return <button className='cursor-pointer outline-2 rounded-md font-bold flex items-center justify-center gap-1  outline-red-500 text-red-500 overflow-hidden px-2 duration-50' onClick={logoutFun}> <i className="ri-logout-circle-r-line"></i></button>

}

export default LogoutBtn;