import React,{createContext, useContext, useState} from 'react';

//create auth context
const AuthContext = createContext();

//custom hook to use auth context
export const useAuth =()=>{
  return useContext(AuthContext);
}

//auth provider
export const AuthProvider =({children})=>{
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('auth_token'));

  //login function
  const login =()=>{
    setIsAuthenticated(true);
  }

  //logout function
  const logout =()=>{
    setIsAuthenticated(localStorage.removeItem('auth_token'));
  }

  return <AuthContext.Provider value={{isAuthenticated, login, logout}} >
    {children}
  </AuthContext.Provider>
}

