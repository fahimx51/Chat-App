import React from 'react'
import assets from '../assets/assets'

export default function Sidebar({ selectedUser, setSelectedUser }) {
    return (
        <div>
            <div className='pb-5 '>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo}
                        alt="logo"
                        className='max-w-40'
                    />
                    <div className='relative py-2 group'>
                        <img src={assets.menu_icon}
                            alt="menu"
                            className='max-h-5 cursor-pointer'
                        />

                        <div>
                            <p>Edit Profile</p>
                            <hr className='my-2 border-t border-gray-500' />
                            <p className='cursor-pointer text-sm'>Logout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
