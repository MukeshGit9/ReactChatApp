import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const AllUsersContext = createContext();

const AllUsersProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/allusers`);
        if (response.data.status === 'success') {
          setAllUsers(response.data.data)
        }
        else {
          alert('No users found')
        }
      } catch (error) {
        console.log("Error fetching all users", allUsers);
      }
    }
    fetchAllUsers();
  }, []);

  return(
    <AllUsersContext.Provider value={{ allUsers }}>
      {children}
    </AllUsersContext.Provider>
  )
}

export default AllUsersProvider;