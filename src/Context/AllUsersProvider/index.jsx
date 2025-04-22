import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const AllUsersContext = createContext();

const AllUsersProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  // search user on email
  const searchUser = async (email) => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/allusers?userEmail=${email}`
      );
      if (response.data.status === "success") {
        setAllUsers([...allUsers, ...response.data.data]);
      } else {
        alert("No users found");
      }
    } catch (error) {
      console.log("Error fetching all users", error);
    }
  };


  // --add user to added list-------------------------------------------ADDED USER LIST
  const addUserList = (data) => {
    // geting existing list
    const existingUserList = JSON.parse(localStorage.getItem("userList")) || [];

    // check for duplicate users
    const isAlreadyAdded = existingUserList.some((u) => u.email === data.email);
    if (isAlreadyAdded) {
      alert("User already added to list");
      return;
    }

    const updatedUserList = [...existingUserList, data];

    // save to localstorage
    localStorage.setItem("userList", JSON.stringify(updatedUserList));

    // update state
    setUserList(updatedUserList);
  };

  // remove user from list-------------------------------------------REMOVE USER FROM LIST
  const removeUserFromList = (data) => {
    const stored = JSON.parse(localStorage.getItem("userList")) || [];
    const updatedList = stored.filter(u => u.email !== data.email); // NOT EQUAL
    localStorage.setItem("userList", JSON.stringify(updatedList));
    setUserList(updatedList);
  };


  // useEffect to persist added users....................................................
  useEffect(()=>{
    const storedUser = JSON.parse(localStorage.getItem("userList"))
    setUserList(storedUser)
  },[])

  return (
    <AllUsersContext.Provider
      value={{ allUsers, searchUser, userList ,addUserList, removeUserFromList} }
    >
      {children}
    </AllUsersContext.Provider>
  );
};

export default AllUsersProvider;
