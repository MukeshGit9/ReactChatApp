import React, { useContext, useState } from "react";
import Header from "../../Components/Compound/Header";
import Profile from "../Profile";
import NavLink from "../../Components/Atom/NavLink";
import ChatPage from "../ChatPage";
import { AllUsersContext } from "../../Context/AllUsersProvider";
import { UserContext } from "../../Context/UserProvider";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  // UseChatListHook--------------------------------------------------useChatList
  // allUserContext--------------------------------------------------useContext
  const { allUsers, searchUser, userList,removeUserFromList, addUserList } =
    useContext(AllUsersContext);

  // userDataContext--------------------------------------------------useContext
  const { userdata } = useContext(UserContext);

  const location = useLocation();
  const isChatOpen = location.pathname.includes("/chat");

  // states--------------------------------------------------------------------useSTATE
  const [inputEmail, setInputEmail] = useState("");
  // get user function-------------------------------------------------------handleGetUser
  const handleGetUser = (e) => {
    e.preventDefault();
    searchUser(inputEmail);
    setInputEmail("");
  };

  // handle div click ------------------------------------------------------HANDLE CLICK
  const navigate = useNavigate();
  const handleClick = (selectedUser) => {
    navigate(`/chat`, { state: { selectedUser } });
  };
  return (
    <div className="h-screen">
      <Header />
      <nav className="flex item-center justify-between gap-2 px-6 py-2 bg-black">
        <div>
          {/* <NavLink url="/chat" element={<ChatPage />}>
            <span className=" text-[2vw] block rounded">
              <i class="ri-wechat-fill"></i> PublicChat
            </span>
          </NavLink>  */}
          <span className=" text-[2vw] text-white  rounded flex gap-3 items-center justify-center">
            <img
              className="w-[3vw] outline rounded-full"
              alt="userimage"
              srcset=""
              src="https://png.pngtree.com/png-vector/20230831/ourmid/pngtree-man-avatar-image-for-profile-png-image_9197908.png"
            />{" "}
            {userdata.username}
          </span>
        </div>
        <NavLink url="/profile" element={<Profile />}>
          <span className=" text-[2vw] block rounded">
            <i class="ri-user-3-fill"></i>
          </span>
        </NavLink>
      </nav>

      <div className="flex justify-center items-start   flex-wrap h-[44.6vw] overflow-hidden ">
        <div className="w-[35%] h-[100%] px-4 flex flex-col gap-6 overflow-y-auto ">
          <form
            className="flex justify-evenly items-center py-4 sticky z-[2] top-2"
            onSubmit={handleGetUser}
          >
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Search Email"
              // className="block w-[90%] px-4 py-2 rounded-sm focus:outline-none shadow-xl/20 bg-gradient-to-r from-sky-300 to-sky-200 focus:from-sky-400 "
              className="block w-[90%] px-4 py-2 bg-white  focus:outline-none border-b-2 border-b-black focus:border-b-[#00baff] focus:text-[#00baff]"
            />
            <button
              type="submit"
              className="w-[4%] bg-black text-white px-4 py-2 rounded-sm flex items-center justify-center cursor-pointer hover:font-bold"
            >
              <i class="ri-search-2-line"></i>
            </button>
          </form>
          {allUsers.length <= 0 ? (
            " "
          ) : (
            <div className="flex flex-col w-full  gap-2">
              <h1 className="text-[black] border-b-3 font-semibold border-b-[black] text-[2vw] text-left py-1">
                Searched user list
              </h1>
              {/* searched users----------------------------------------------------------------------------- */}
              {allUsers &&
                allUsers.map((data) => {
                  return (
                    <div className="relative" key={data.id}>
                      {/* <span className="absolute w-full text-center text-[.8vw] top-[-35%] bg-black text-white px-2 rounded-sm">
                        Matching Users
                      </span> */}
                      <div
                        className="group relative flex gap-2 items-center justify-start border border-black py-2 px-4 rounded-sm hover:bg-black cursor-pointer"
                        onClick={() => handleClick(data)}
                      >
                        <img
                          src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                          className="w-[3vw]"
                          alt="userimage"
                          srcset=""
                        />
                        <h1 className="group-hover:text-white text-[1.5vw]">
                          {data.username}
                        </h1>
                      </div>
                      <button
                        type="click"
                        className="absolute text-[.8vw] right-[2%] top-[50%] translate-y-[-50%]   bg-green-500 text-white px-2 py-1 rounded-sm cursor-pointer"
                        onClick={() => addUserList(data)}
                      >
                        <i class="ri-user-add-fill"></i>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
          {userList.length <= 0 ? (
            ""
          ) : (
            <div className="flex flex-col  w-full gap-2 ">
              <h1 className=" text-black border-b-3 font-semibold border-black text-[2vw] text-left py-1">
                Chat List
              </h1>
              {/* user list------------------------------------------------------------------------- */}
              {userList &&
                userList.map((data) => {
                  return (
                    <div className="relative" key={data.id}>
                      {/* <span className="absolute text-[.8vw] w-full text-center top-[-35%] bg-black text-white px-2 rounded-sm">
                        Saved User
                      </span> */}
                      <div
                        className="group relative flex gap-2 items-center justify-start border border-black py-2 px-4 rounded-sm hover:bg-black cursor-pointer"
                        onClick={() => handleClick(data)}
                      >
                        <img
                          src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                          className="w-[3vw]"
                          alt="userimage"
                          srcset=""
                        />
                        <h1 className="group-hover:text-white text-[1.5vw]">
                          {data.username}
                        </h1>
                      </div>
                      <button
                        type="click"
                        className="absolute text-[.8vw]  right-[2%] top-[50%] translate-y-[-50%]   bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-sm cursor-pointer"
                        onClick={() => {
                          removeUserFromList(data);
                        }}
                      >
                        <i class="ri-user-minus-fill"></i>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <div className="w-[65%] h-[100%] ">
          {isChatOpen ? <Outlet /> : <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400"><i className="ri-chat-smile-3-fill text-gray-400 text-[10vw]"></i>___Where connection meets conversation<i>Send and receive messages — anytime, anywhere..</i></div>}
        </div>
      </div>
    </div>
  );
};

export default Home;
