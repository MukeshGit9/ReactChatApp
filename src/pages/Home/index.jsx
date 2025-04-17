import React, { useContext } from "react";
import Header from "../../Components/Compound/Header";
import Profile from "../Profile";
import NavLink from "../../Components/Atom/NavLink";
import ChatPage from "../ChatPage";
import { AllUsersContext } from "../../Context/AllUsersProvider";
import { UserContext } from "../../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { allUsers } = useContext(AllUsersContext);
  const { userdata } = useContext(UserContext);

  // handle div click ------------------------------------------------------HANDLE CLICK
  const navigate = useNavigate();
  const handleClick = (selectedUser) => {
    navigate(`/chat`, { state: { selectedUser } });
  };
  return (
    <div>
      <Header />
      <nav className="flex item-center justify-between gap-2 px-6 py-2 bg-black">
        <div>
          {/* <NavLink url="/chat" element={<ChatPage />}>
            <span className=" text-[2vw] block rounded">
              <i class="ri-wechat-fill"></i> PublicChat
            </span>
          </NavLink>  */}
          <span className=" text-[2vw] text-white  rounded flex gap-3 items-center justify-center">
          <img className="w-[3vw] outline rounded-full" alt="userimage" srcset="" src="https://png.pngtree.com/png-vector/20230831/ourmid/pngtree-man-avatar-image-for-profile-png-image_9197908.png"/> {userdata.username}
          </span>
        </div>
        <NavLink url="/profile" element={<Profile />}>
          <span className=" text-[2vw] block rounded">
            <i class="ri-user-3-fill"></i>
          </span>
        </NavLink>
      </nav>
      <div className="flex gap-8 p-6 flex-wrap ">
        {allUsers.map((data, index) => {
          return (
            <div
              key={data.id}
              className="group flex gap-1 items-center justify-center border border-black py-2 px-4 rounded-full hover:bg-black cursor-pointer"
              onClick={() => handleClick(data)}
            >
              <img
                src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                className="w-[2vw]"
                alt="userimage"
                srcset=""
              />
              <h1 className="group-hover:text-white">{data.username}</h1>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
