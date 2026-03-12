import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

export default function HomePage() {

    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
            <div className={`text-white backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
                < Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                <RightSidebar />
            </div>
        </div >
    )
}
