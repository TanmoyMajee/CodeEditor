
import React , { useState,useEffect}from 'react';
import User from '../components/user';
import { toast } from 'react-toastify';
import { useNavigate,useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

function EditorPage() {
  const roomId = useParams().roomId;
  const navigate = useNavigate();
  const [ConnectedUser , setConnectedUser] = useState([]);
    const [code, setCode] = useState('// Start coding here...');
  useEffect(() => {
    // Establish socket connection to your server
  const socketServerUrl = import.meta.env.VITE_BACKEND_URL;
const socket = io(socketServerUrl);
    // const socket = io('http://localhost:3000')

    // Listen for the connection event
    socket.on('connect', () => {
      console.log('Socket connected with id:', socket.id);
    });

    // Cleanup: Disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const leavRoomFun = () => {
    // Leave the room
    toast.success("You have left the room , Redirect to Home Page");
    setTimeout(() => {
      navigate('/');
    } , 1000);
  }
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
            <p>User 1</p>
          </div>
        </div>

        {/* List of All Connected Users */}
        <div className="flex-grow mb-4">
          <h2 className="text-lg font-semibold">Participants</h2>
          {/* <div className="mt-2 space-y-2">
            <div className="p-2 bg-gray-700 rounded">User 1</div>
            <div className="p-2 bg-gray-700 rounded">User 2</div>
            <div className="p-2 bg-gray-700 rounded">User 3</div>
          </div> */}
              {/* Fixed height with scrollable content */}
    <div className="mt-2 space-y-2 h-100 overflow-y-auto">
     <User name={1}/>
      <User name={1}/>
      <User name={1}/>
      <User name={1}/>
      <User name={1}/>
      <User name={1}/>
      {/* Additional users can be added here */}
    </div>
        </div>

        {/* Controls: Leave Room & Copy Room ID */}
        <div>
          <button onClick={leavRoomFun} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mb-2">
            Leave Room
          </button>
          <button onClick={copyRoomIdFun} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
            Copy Room ID
          </button>
        </div>
      </div>

      {/* Right Side: Code Editor */}
      <div className=" w-full bg-gray-900 p-4">
        {/* <textarea
          className="w-full h-full bg-gray-800 text-green-300 p-4 rounded border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Write your code here..."
        /> */}
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          theme="vs-dark"
          onChange={(value, event) => setCode(value)}
        />
      </div>
    </div>
  );
}

export default EditorPage;
