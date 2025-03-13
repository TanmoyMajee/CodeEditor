import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import EditorPage from './pages/EditorPage.jsx'
import { ToastContainer } from 'react-toastify';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  )
}

export default App
