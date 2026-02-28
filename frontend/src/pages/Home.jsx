import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Room ID & username is required');
            return;
        }
        // Redirecting to the editor page and passing the username
        navigate(`/editor/${roomId}`, {
            state: { username },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1c1e29', color: '#fff' }}>
            <div style={{ background: '#282a36', padding: '30px', borderRadius: '10px', width: '400px' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Code Sync Editor</h2>
                <h4 style={{ marginBottom: '10px' }}>Paste invitation ROOM ID</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="ROOM ID" 
                        value={roomId} 
                        onChange={(e) => setRoomId(e.target.value)} 
                        onKeyUp={handleInputEnter}
                        style={{ padding: '10px', borderRadius: '5px', border: 'none', outline: 'none', fontSize: '16px' }}
                    />
                    <input 
                        type="text" 
                        placeholder="USERNAME" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        onKeyUp={handleInputEnter}
                        style={{ padding: '10px', borderRadius: '5px', border: 'none', outline: 'none', fontSize: '16px' }}
                    />
                    <button 
                        onClick={joinRoom} 
                        style={{ padding: '10px', backgroundColor: '#4aee88', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                        JOIN
                    </button>
                    
                    <span style={{ textAlign: 'center', marginTop: '10px' }}>
                        If you don't have an invite then create &nbsp;
                        <a onClick={createNewRoom} href="#" style={{ color: '#4aee88', textDecoration: 'none', fontWeight: 'bold' }}>
                            new room
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Home;