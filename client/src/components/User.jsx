import React from 'react';

function User({ username, active }) {
  return (
    <div className="p-7 m-2 bg-gray-700 rounded text-white h-20 w-20 relative">
      {username}
      {/* **NEW: Show active indicator if the user is active** */}
      {active && (
        <span className="absolute top-0 right-0 bg-green-500 text-xs px-1 rounded">
          Active
        </span>
      )}
    </div>
  );
}

export default User;
