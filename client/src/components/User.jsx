import React from 'react';

function User({ username }) {
  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      {username}
    </div>
  );
}

export default User;
