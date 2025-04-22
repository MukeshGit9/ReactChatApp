import React from "react";
import {
  BrowserRouter,
  Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ShowForm from "./pages/ShowForm";
import SelectFeilds from "./pages/SelectFeilds";
import ChatPage from "./pages/ChatPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./Routes/ProtectedRoute";
import UserProvider from "./Context/UserProvider";
import AllUsersProvider from "./Context/AllUsersProvider";

const App = () => {
  return (
    <BrowserRouter>
        <AllUsersProvider>
          <UserProvider>
            <Routes>
              {/* punlic rotes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* protected route */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />}>
                  <Route path="chat" element={<ChatPage />} />
                </Route>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>

            {/* default */}
          </UserProvider>
        </AllUsersProvider>
    </BrowserRouter>
  );
};

export default App;
