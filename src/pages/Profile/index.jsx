import React,{useContext} from "react";
import LogoutBtn from "../../Components/Atom/LogoutBtn";
import Header from "../../Components/Compound/Header";
import {UserContext} from "../../Context/UserProvider";

const Profile = () => {
  const {userdata}=useContext(UserContext);
  return <div className="flex flex-col">
    <Header />
    <div className="flex w-full justify-between items-center py-2 px-6 bg-black text-white font-bold"><div className="flex items-center gap-1"><i className="ri-user-3-fill"></i> PROFILE</div> <LogoutBtn /></div>
    <div className="flex justify-start items-center">
        <img className="w-[45vw]" src="https://png.pngtree.com/png-vector/20230831/ourmid/pngtree-man-avatar-image-for-profile-png-image_9197908.png" alt="userimage" srcset="" />
        <div>
          <h6 className="text-[1.2vw] font-medium">USERNAME</h6>
          <p className="text-[3.2vw] mb-5 font-bold">{userdata.username}</p>
          <h6 className="text-[1.2vw] font-medium">EMAIL</h6>
          <p className="text-[3.2vw] mb-5 font-bold"> {userdata.email}</p>
        </div>
    </div>
  </div>
}

export default Profile;