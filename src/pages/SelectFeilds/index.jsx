import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';

const SelectFeilds =()=>{
  // Available feilds for the form
  const availableFeilds =[
    {name:'name',label:'Name', type:'text'},
    {name:'email', label:'Email', type:'email'},
    {name:'phone', label:'Phone', type:'number'},
    {name:'age', label:'Age', type:'number'},
  ];

  const navigate = useNavigate();
  
  const [SelectFeilds, setSelectedFeilds]=useState([]);
  // const history = useHistory();

  // Handle checkbox change
  const handleCheckboxChange = (e, feild)=>{
      const isChacked = e.target.checked;
      if (isChacked) {
        setSelectedFeilds([...SelectFeilds, feild]);
      } else {
        setSelectedFeilds(setSelectedFeilds.filter((item)=>item !== feild));
      }
  }

  // Handle form submit
  const handleSubmit =()=>{
    //store selected feilds in local storage
    localStorage.setItem('selectedFeilds', JSON.stringify(SelectFeilds));
    //redirect to form page
    navigate('/show-form')
  }

  return(
    <div>
      <h1>Select feilds for the form</h1>
      <div>
        {availableFeilds.map((feild)=>(
          <label key={feild.name}>
          <input type="checkbox" onChange={(e)=>handleCheckboxChange(e,feild.name)} />
          {feild.label}
          </label>
        ))}
      </div>
      <button onClick={handleSubmit}>Go to Form</button>
    </div>
  )
}

export default SelectFeilds;