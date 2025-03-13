import React from 'react';

function User({ name }) {
  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      {name}
    </div>
  );
}

export default User;
