import { useNavigate } from "react-router-dom"

 const useLogOut = () => {
  const navigate = useNavigate();
  const logoutFun = () => {
    localStorage.removeItem('auth_token')
    alert("User Logout Successfuly!")
    navigate('/login')
  }
  return logoutFun
}

export default useLogOut;
