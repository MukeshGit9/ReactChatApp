import React, {useState} from 'react';
import {useForm, Controller } from 'react-hook-form';

const ShowForm = ()=>{
  const {control, handleSubmit} = useForm();
  const [formData, setFormData] = useState({});

  const selectedFeilds = JSON.parse(localStorage.getItem('selectedFeilds') || '[]');

  const onSubmit = (data)=>{
      alert(data)
      console.log('Form Data Submitted', data);
      localStorage.setItem('formData',JSON.stringify(data));
      setFormData(data);
      
  }

  return(
    <div>
      <h1>Create the form</h1>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
      {selectedFeilds.map((feild)=>{
        const feildDetails={
          email:{label:'Email', type:'email'},
          name:{label:'Name', type:'text'},
          phone:{label:'Phone', type:'number'},
          age:{label:'Age', type:'number'}
        }[feild];
        return(
          <div key={feild}>
            <label>{feildDetails.label} : </label>
            <Controller name={feild} control={control} render={({feild})=><input  {...feild} type={feildDetails.type} />} />
          </div>
        )
      })}
      <button type='submit'>Submit</button>
      </form>

      <div>
        <h2>Submitted Data</h2>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  )
}

export default ShowForm;