
import React, { useState, useEffect, useRef ,useCallback } from 'react';
import User from '../components/User';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { debounce, throttle } from 'lodash';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

function EditorPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const { username } = location.state || { username: "Guest" };
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [code, setCode] = useState('// Start coding here...');
    // **NEW STATE: To track last active timestamp for each user by socketId**
  const [activeUsers, setActiveUsers] = useState({});

  useEffect(() => {
    const socketServerUrl = import.meta.env.VITE_BACKEND_URL;
    // Initialize and store the socket instance in a ref
    socketRef.current = io(socketServerUrl);

    // Listen for the connection event
    socketRef.current.on('connect', () => {
      console.log('Socket connected with id:', socketRef.current.id);
    });

    // Update connected users list
    socketRef.current.on('ConnectedUsers', (data) => {
      console.log('Connected users:', data);
      setConnectedUsers(data);
    });

    // Listen for a new user joining and show a toast
    socketRef.current.on('user-joined', (newUsername) => {
      if (newUsername !== username) {
        toast.info(`${newUsername} joined the room`);
      }
    });

    // Listen for a user leaving and show a toast
    socketRef.current.on('user-left', (leftUsername) => {
      if (leftUsername !== username) {
        console.log('User left:', leftUsername);
        toast.info(`${leftUsername} left the room`);
      }
    });

    // Emit join-room event with roomId and username
    socketRef.current.emit('join-room', { roomId, username });

      // **New Listener**: Listen for the initial code from the server
    socketRef.current.on('initial-code', (initialCode) => {
      console.log('Received initial code:', initialCode);
      setCode(initialCode);
    });

     // Listen for code updates from other clients
    socketRef.current.on('code-update', (updatedCode) => {
      // Optionally check if the code is different before updating
      setCode(updatedCode);
    });

        // **NEW LISTENER: Listen for "user-active" events from other clients**
    socketRef.current.on('user-active', (data) => {
      // data contains: { roomId, username, socketId, timestamp }
      // Update the activeUsers state with the latest timestamp for the user (using their socketId)
      setActiveUsers(prev => ({ ...prev, [data.socketId]: data.timestamp }));
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
         socketRef.current.off('connect');
    socketRef.current.off('ConnectedUsers');
    socketRef.current.off('user-joined');
    socketRef.current.off('user-left');
    socketRef.current.off('code-update');
    socketRef.current.off('initial-code');
     socketRef.current.off('user-active');
     socketRef.current.disconnect();
      }
    };
  }, [roomId, username]);

  useEffect(() => {
  const interval = setInterval(() => {
    // Trigger a re-render by updating a dummy state or forceUpdate.
    setActiveUsers(prev => ({ ...prev }));
  }, 1000); // every 1 second

  return () => clearInterval(interval);
}, []);

  const leavRoomFun = () => {
    if (socketRef.current) {
      // Notify the server that the user is leaving
      socketRef.current.emit('leave-room', { roomId, username });
      socketRef.current.disconnect();
    }
    toast.success("You have left the room, redirecting to Home Page");
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const copyRoomIdFun = () => {
    if (!roomId) {
      toast.error("Room ID is empty!");
      return;
    }
    navigator.clipboard.writeText(roomId)
      .then(() => {
        toast.success("Room ID copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error copying room ID:", err);
        toast.error("Failed to copy Room ID!");
      });
  };

   // **NEW FUNCTION: Emit a "user-active" event to signal activity**
  // You might want to throttle or debounce this function to avoid flooding the server.
   // Throttle userActive to emit at most once every 300ms
  const userActive = useCallback(throttle(() => {
    if (socketRef.current) {
      socketRef.current.emit('user-active', {
        roomId,
        username,
        socketId: socketRef.current.id,
        timestamp: Date.now(),
      });
    }
  }, 300), [roomId, username]);

  // Handle code change: update state and call debounced function
  const handleCodeChange = (value) => {
    setCode(value);
    debouncedCodeChange(value);
  };

    // Debounce code changes: wait 300ms after typing stops before sending update
  const debouncedCodeChange = useCallback(debounce((value) => {
    if (socketRef.current) {
      socketRef.current.emit('code-change', { roomId, code: value });
      // Also signal that the user is active
      userActive();
    }
  }, 300), [roomId, userActive]);



  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">MyCodeEditor</h1>
        </div>

        {/* Connected User */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Connected User</h2>
          <div className="mt-2">
            <p>{connectedUsers.length}</p>
          </div>
        </div>

        {/* List of All Connected Users */}
        <div className="flex-grow mb-4">
          <h2 className="text-lg font-semibold">Participants</h2>
          <div className="grid grid-cols-2 mt-2 space-y-2 h-90 overflow-y-auto">
              {connectedUsers.map((user) => {
              // **Determine if user is active**: Check if their last activity is within 5 seconds.
              const isActive = activeUsers[user.socketId] && (Date.now() - activeUsers[user.socketId] < 5000);
              return <User key={user.socketId} username={user.username} active={isActive} />;
            })}
          </div>
        </div>

        {/* Controls: Leave Room & Copy Room ID */}
        <div className="mt-auto">
          <button 
            onClick={leavRoomFun} 
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mb-2"
          >
            Leave Room
          </button>
          <button 
            onClick={copyRoomIdFun} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Copy Room ID
          </button>
        </div>
      </div>

      {/* Right Side: Code Editor */}
      <div className="flex-grow bg-gray-900 p-4">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          theme="vs-dark"
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
}

export default EditorPage;
