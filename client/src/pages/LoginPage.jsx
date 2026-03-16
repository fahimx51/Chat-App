import React, { useState } from 'react'
import assets from '../assets/assets'

export default function LoginPage() {

    const [currState, setCurrState] = useState("Sign Up");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmitHandler = (e) => {
        e.preventDefault();
        if (currState === "Sign Up" && !isSubmitted) {
            setIsSubmitted(true);
            return;
        }
        
    }

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>

            {/* left */}
            <img
                src={assets.logo_big}
                alt=""
                className='w-[30vw] max-lg:hidden'
            />

            {/* right */}
            <form
                onSubmit={handleSubmitHandler}
                className='w-100 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'
            >
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currState}
                    {
                        isSubmitted
                        &&
                        <img
                            onClick={() => setIsSubmitted(false)}
                            src={assets.arrow_icon}
                            alt=""
                            className='w-5 cursor-pointer'
                        />

                    }

                </h2>

                {
                    currState === "Sign Up" && !isSubmitted && (
                        <input
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                            type="text"
                            placeholder='Full Name'
                            className='p-2 border border-gray-500 rounded-md focus:outline-none'
                            required
                        />

                    )
                }

                {
                    !isSubmitted && (
                        <>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                placeholder='Email Address'
                                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                required
                            />

                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                placeholder='Password'
                                className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                required
                            />
                        </>
                    )
                }

                {
                    currState === "Sign Up" && isSubmitted && (
                        <textarea
                            onChange={(e) => setBio(e.target.value)}
                            value={bio}
                            rows={4}
                            placeholder='Provide a short BIO'
                            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            required
                        >

                        </textarea>
                    )
                }


                <button
                    type='submit'
                    className='py-3 bg-gradient-to-r font-semibold from-purple-400 to-violet-600 text-white rounded-md cursor-pointer '>
                    {
                        currState === "Sign Up" ? "Create Account" : "Login Now"
                    }
                </button>


                {

                    currState === "Sign UP"
                    &&
                    <div className='flex items-center gap-3 text-sm text-gray-400'>
                        <input
                            type="checkbox"
                            className="w-5 h-5 appearance-none border-2 border-gray-500 rounded-md checked:bg-violet-600 checked:border-violet-600 transition-all cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                        />
                        <p>Agree to the terms of use & <span className='text-violet-500 cursor-pointer'>privacy policy</span></p>
                    </div>

                }


                <div className='flex flex-col gap-2'>
                    {
                        currState === "Sign Up" ?
                            <p className='text-sm text-gray-600'>
                                Already have an account? {" "}
                                <span
                                    onClick={() => setCurrState("Sign In")}
                                    className='font-semibold text-violet-500 cursor-pointer'>
                                    Login
                                </span>
                            </p>
                            :
                            <p className='text-sm text-gray-600'>
                                Don't have any account? {" "}
                                <span
                                    onClick={() => setCurrState("Sign Up")}
                                    className='font-semibold text-violet-500 cursor-pointer'>
                                    Sign Up
                                </span>
                            </p>
                    }
                </div>


            </form>

        </div>
    )
}
