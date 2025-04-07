import React,{createContext, useState, useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const UserContext = createContext();

const UserProvider = ({children})=>{
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('auth_token');
  const [userdata, setUserData]=useState({});

  useEffect(()=>{
    const fetchUserData = async (accessToken)=>{
      if(!accessToken){
        navigate('/login')
      }
      try {
        const response = await axios.get(`${serverUrl}/api/userprofile`,{
          headers:{
            "Authorization": `Bearer ${accessToken}`
          }
        })
        console.log(response.data.user);

        if(response.data.status === 'success'){
          setUserData(response.data.user);
        }
      } catch (error) {
        navigate('/login')
      }
    }
    fetchUserData(accessToken)
  },[accessToken])

  return(
    <UserContext.Provider value={{userdata}}>
      {children}
    </UserContext.Provider>
  )

}

export default UserProvider;
