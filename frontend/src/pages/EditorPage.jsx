import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const EditorPage = () => {
    const socketRef = useRef(null);
    const editorRef = useRef(null); 
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [clients, setClients] = useState([]);
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    
    // --- Naya State: Language ID ke liye ---
    const [languageId, setLanguageId] = useState("63"); // Default Node.js
    const [languageName, setLanguageName] = useState("javascript");

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    // Language change hone par editor ki language update karne ke liye
    const onLanguageChange = (e) => {
        const id = e.target.value;
        setLanguageId(id);
        
        // Monaco editor ko batana ki kaunsi language use karni hai
        if (id === "63") setLanguageName("javascript");
        else if (id === "71") setLanguageName("python");
        else if (id === "54") setLanguageName("cpp");
        else if (id === "62") setLanguageName("java");
    };

    const runCode = async () => {
        setLoading(true);
        setOutput("Compiling...");
        
        const code = editorRef.current.getValue();
        
        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: { base64_encoded: 'false', fields: '*' },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '2f9eabe440msh957c622a34976d7p13644fjsn7c6fad455dc8', 
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: languageId, // Ab ye dynamic hai!
                source_code: code,
            }
        };

        try {
            const response = await axios.request(options);
            const token = response.data.token;
            checkStatus(token);
        } catch (error) {
            setLoading(false);
            setOutput("Error: " + error.message);
        }
    };

    const checkStatus = async (token) => {
        const options = {
            method: 'GET',
            url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            params: { base64_encoded: 'false', fields: '*' },
            headers: {
                'X-RapidAPI-Key': '2f9eabe440msh957c622a34976d7p13644fjsn7c6fad455dc8',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            const statusId = response.data.status?.id;

            if (statusId === 1 || statusId === 2) {
                setTimeout(() => checkStatus(token), 2000);
            } else {
                setLoading(false);
                setOutput(response.data.stdout || response.data.stderr || "No output");
            }
        } catch (err) {
            setLoading(false);
            setOutput("Error fetching status");
        }
    };

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
        }
    };

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                toast.error('Socket connection failed.');
                navigate('/');
            }

            socketRef.current.emit('join', {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on('joined', ({ clients, username }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined.`);
                    socketRef.current.emit('code-change', {
                        roomId,
                        code: editorRef.current?.getValue(),
                    });
                }
                setClients(clients);
            });

            socketRef.current.on('code-change', ({ code }) => {
                if (code !== null && editorRef.current) {
                    if (editorRef.current.getValue() !== code) {
                        editorRef.current.setValue(code);
                    }
                }
            });

            socketRef.current.on('disconnected', ({ socketId, username }) => {
                toast.success(`${username} left.`);
                setClients((prev) => prev.filter(c => c.socketId !== socketId));
            });
        };
        
        if (location.state) { init(); }
        return () => { if(socketRef.current) socketRef.current.disconnect(); }
    }, [location.state, navigate, roomId]);

    if (!location.state) return <Navigate to="/" />;

    return (
        <div style={{ display: 'flex', height: '100vh', color: '#fff', backgroundColor: '#1c1e29' }}>
            {/* Sidebar */}
            <div style={{ width: '230px', backgroundColor: '#282a36', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Connected</h3>
                <div style={{ flex: 1, marginTop: '20px' }}>
                    {clients.map(c => (
                        <div key={c.socketId} style={{ background: '#4aee88', color: '#000', padding: '5px', borderRadius: '4px', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {c.username}
                        </div>
                    ))}
                </div>
                <button onClick={copyRoomId} style={{ padding: '10px', backgroundColor: '#4aee88', marginBottom: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Copy ID</button>
                <button onClick={() => navigate('/')} style={{ padding: '10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Leave</button>
            </div>

            {/* Main Editor Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header with Language Selector and Run Button */}
                <div style={{ padding: '10px', background: '#1c1e29', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    
                    {/* Dropdown Menu */}
                    <select 
                        value={languageId} 
                        onChange={onLanguageChange}
                        style={{ 
                            marginRight: '15px', 
                            padding: '8px', 
                            borderRadius: '5px', 
                            background: '#282a36', 
                            color: '#fff', 
                            border: '1px solid #4aee88',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="63">JavaScript (Node.js)</option>
                        <option value="71">Python (3.8.1)</option>
                        <option value="54">C++ (GCC 9.2.0)</option>
                        <option value="62">Java (OpenJDK 13.0.1)</option>
                    </select>

                    <button 
                        onClick={runCode} 
                        disabled={loading}
                        style={{ padding: '8px 25px', backgroundColor: '#4aee88', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {loading ? "Running..." : "RUN"}
                    </button>
                </div>
                
                {/* Monaco Editor */}
                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        language={languageName} // Dynamic Language
                        theme="vs-dark"
                        onMount={handleEditorDidMount}
                        onChange={(val) => socketRef.current.emit('code-change', { roomId, code: val })}
                        options={{ fontSize: 16, minimap: { enabled: false } }}
                    />
                </div>

                {/* Output Window */}
                <div style={{ height: '150px', background: '#000', padding: '10px', borderTop: '2px solid #282a36', overflowY: 'auto' }}>
                    <h4 style={{ color: '#4aee88', marginBottom: '5px' }}>Output:</h4>
                    <pre style={{ fontSize: '14px', color: '#fff' }}>{output}</pre>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;