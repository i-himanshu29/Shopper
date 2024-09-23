// import React,{useState} from 'react'
// import './CSS/LoginSignup.css'

// const LoginSignup = () => {

//   const [state,setState] = useState('Login');
//   const [formData,setFormData] = useState({
//     username:"",
//     password:"",
//     email:"",
//   })

//   const changeHandler = (e) => {
//     setFormData({...formData,[e.target.name]:e.target.value})
//   }

//   const login = async () =>{
//     console.log("Login Function is Executed",formData);
//   }

//   const Signup = async () =>{
//     console.log("Signup Function is Executed",formData);
//     let responseData;
//     await fetch('http://localhost:4000/signup',{
//       method:'POST',
//       headers:{
//         Accept:'application/form-data',
//         'Content-Type':'application/json',
//       },
//       body:JSON.stringify(formData),
//     }).then((response)=>response.json()).then((data)=>responseData=data)

//     if(responseData.success){
//       localStorage.setItem('auth-token',responseData.token);
//       window.location.replace("/");
//     }
//   }


//   return (
//     <div className='loginsignup'>
//       <div className='loginsignup-container'>
//         <h1>{state}</h1>
//         <div className='loginsignup-fields'>
//             {state==="Sign Up" ? <input name='username' value={formData.username} onChange={changeHandler} type='text' placeholder='Your Name'/>:<></>}
//             <input name='email' value={formData.email} onChange={changeHandler} type='email' placeholder='Email Address'/>
//             <input name='password' value={formData.password} onChange={changeHandler} type='password' placeholder='Password'/>
//         </div>
//         <button onClick = {()=>{state === "Login"? login():Signup()}}>Continue</button>
//         {state === "Sign Up" ? <p className='loginsignup-login'>Already have an account ?<span onClick={()=>{setState("Login")}}>Login here</span></p>
//          : <p className='loginsignup-login'>Create an account ?<span onClick={()=>{setState("Sign Up")}}>click here</span></p>
//         }
        
        
//         <div className='loginsignup-agree'>
//           <input type='checkbox' name='' id=''/>
//           <p>By continuing, i agree to the terms of use & privacy policy</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LoginSignup

//.............................................................


//gpt
import React, { useState } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [state, setState] = useState('Login');
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login Function is Executed", formData);
    // Implement the login logic here
    try {
      const response = await fetch('https://shopper-3yzf.onrender.com/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert('Signup failed already exist:', responseData.message || 'already exist');
      }
      } catch (error) {
        console.error('There was an error with the signup operation:', error);
      }
  };

  const Signup = async () => {
    console.log("Signup Function is Executed", formData);
    try {
      const response = await fetch('https://shopper-3yzf.onrender.com/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert('Signup failed:', responseData.message || 'already exist');
      }
    } catch (error) {
      console.error('There was an error with the signup operation:', error);
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>{state}</h1>
        <div className='loginsignup-fields'>
          {state === "Sign Up" && (
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type='text'
              placeholder='Your Name'
            />
          )}
          <input
            name='email'
            value={formData.email}
            onChange={changeHandler}
            type='email'
            placeholder='Email Address'
          />
          <input
            name='password'
            value={formData.password}
            onChange={changeHandler}
            type='password'
            placeholder='Password'
          />
        </div>
        <button onClick={() => { state === "Login" ? login() : Signup() }}>
          Continue
        </button>
        {state === "Sign Up" ? (
          <p className='loginsignup-login'>
            Already have an account? <span onClick={() => { setState("Login") }}>Login here</span>
          </p>
        ) : (
          <p className='loginsignup-login'>
            Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span>
          </p>
        )}
        <div className='loginsignup-agree'>
          <input type='checkbox' name='' id='' />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
