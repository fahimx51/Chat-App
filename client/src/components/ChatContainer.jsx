import React, { use, useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

export default function ChatContainer() {

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const scrollEnd = useRef();

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages]);


    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();

        // 2. Block if empty, OR if already sending
        if (!input.trim() || isSending) return;

        try {
            setIsSending(true); // 3. Lock the door
            const messageText = input.trim();
            setInput(""); // 4. Clear input IMMEDIATELY (Before the await)

            await sendMessage({ text: messageText });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false); // 5. Unlock the door
        }
    };

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = ""; // reset file input
        }
        reader.readAsDataURL(file);
    }





    return selectedUser ? (
        <div className='flex flex-col h-full overflow-hidden bg-[#0c0c0c]/60 backdrop-blur-3xl relative'>

            {/* --- HEADER --- */}
            <div className='flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2'>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <img
                            src={selectedUser.profilePic || assets.avatar_icon}
                            alt="profile"
                            className='w-10 h-10 rounded-full object-cover border border-white/10'
                        />
                        {onlineUsers.includes(selectedUser._id) && (
                            <span className='absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#121212]'></span>
                        )}
                    </div>
                    <div>
                        <h3 className='text-white text-sm font-semibold'>{selectedUser.fullName}</h3>
                        <p className='text-[11px] uppercase tracking-widest text-gray-500 font-bold'>
                            {onlineUsers.includes(selectedUser._id) ? 'Online Now' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <img src={assets.help_icon} className='w-4 opacity-30 cursor-pointer hover:opacity-100' alt="info" />
                    <button onClick={() => setSelectedUser(null)} className='md:hidden p-2'>
                        <img src={assets.arrow_icon} className='w-5 invert' alt="back" />
                    </button>
                </div>
            </div>

            {/* --- CHAT CONTENT AREA --- */}
            <div className='flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar pb-28'>
                {messages.length === 0 ? (
                    <div className='h-full flex flex-col items-center justify-center opacity-30'>
                        <img src={assets.logo_icon} className='w-12 mb-3 grayscale' alt="empty" />
                        <p className='text-white text-xs font-medium'>No conversation yet</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId === authUser._id;
                        const isNextFromSame = messages[index + 1]?.senderId === msg.senderId;

                        // Logic to show "Seen" only on your last message in the entire list
                        const isLastMessageOverall = index === messages.length - 1;

                        return (
                            <div key={msg._id || index} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} ${isNextFromSame ? 'mb-0.5' : 'mb-4'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row' : 'flex-row-reverse'}`}>

                                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        {/* Bubble */}
                                        <div className={`relative px-4 py-2 shadow-xl 
                                    ${isMine
                                                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                                                : 'bg-[#222] text-stone-200 border border-white/5'
                                            }
                                    ${isMine
                                                ? `rounded-2xl ${!isNextFromSame ? 'rounded-br-none' : ''}`
                                                : `rounded-2xl ${!isNextFromSame ? 'rounded-bl-none' : ''}`
                                            }`}>

                                            {msg.image ? (
                                                <img src={msg.image} className='rounded-lg max-w-[200px] md:max-w-[300px] block' alt="sent" />
                                            ) : (
                                                <p className='text-[14px] leading-relaxed whitespace-pre-wrap'>{msg.text}</p>
                                            )}
                                        </div>

                                        {/* Footer: Time & Seen Status */}
                                        {!isNextFromSame && (
                                            <div className="flex items-center gap-2 mt-1 px-1">
                                                <span className='text-[9px] text-gray-600 font-medium'>
                                                    {formatMessageTime(msg.createdAt)}
                                                </span>

                                                {/* Show "Seen" only if it's your message and it has been read */}
                                                {isMine && isLastMessageOverall && msg.seen && (
                                                    <span className='text-[10px] text-violet-400 font-bold italic animate-pulse'>
                                                        Seen
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-7 h-7 flex-shrink-0">
                                        {!isNextFromSame ? (
                                            <img
                                                src={isMine ? (authUser.profilePic || assets.avatar_icon) : (selectedUser.profilePic || assets.avatar_icon)}
                                                className='w-7 h-7 rounded-full border border-white/10 object-cover'
                                                alt="user"
                                            />
                                        ) : (
                                            <div className="w-7" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollEnd} />
            </div>

            {/* --- INPUT AREA --- */}
            <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c0c0c] to-transparent'>
                <form
                    onSubmit={handleSendMessage}
                    className='flex items-center gap-2 bg-[#1a1a1a] border border-white/10 p-1.5 pl-4 rounded-xl shadow-2xl'
                >
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        type="text"
                        placeholder='Type a message...'
                        className='flex-1 bg-transparent py-2 text-sm text-white placeholder-gray-600 outline-none'
                    />

                    <div className='flex items-center gap-1'>
                        <input onChange={handleSendImage} type="file" id="image" accept='image/*' hidden />
                        <label htmlFor="image" className='p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all active:scale-90'>
                            <img src={assets.gallery_icon} className='w-5 opacity-40 hover:opacity-100' alt="gallery" />
                        </label>

                        <button
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className={`p-2.5 rounded-xl transition-all ${input.trim() && !isSending ? 'bg-violet-600' : 'bg-white/5 opacity-20'
                                }`}
                        >
                            {isSending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <img src={assets.send_button} className='w-5 invert' alt="send" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : (
        /* Welcome State */
        <div className='flex flex-col justify-center items-center h-full gap-6 bg-[#121212] max-md:hidden border-l border-white/5'>
            <div className='relative'>
                <div className='absolute inset-0 bg-violet-600 blur-[80px] opacity-20 animate-pulse'></div>
                <img src={assets.logo_icon} className='w-24 relative z-10' alt="logo" />
            </div>
            <div className='text-center z-10'>
                <h2 className='text-3xl font-bold text-white tracking-tight'>Chat anytime, anywhere</h2>
                <p className='text-gray-500 mt-2 text-sm max-w-[250px] mx-auto'>Connect with your friends and start a conversation today.</p>
            </div>
        </div>
    );
}
