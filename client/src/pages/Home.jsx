import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both Room ID and Username are required");
      return;
    }
    toast.success("Redirecting to room...");
    // Simulate a delay for the toast, then redirect
    setTimeout(() => {
      navigate(`/room/${roomId}`);
    }, 2000);
  };

  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    toast.info("New Room Created");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Join a Room</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room code"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={joinRoom}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Join Room
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have a room code?{' '}
            <button onClick={createRoom} className="text-blue-500 underline">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
