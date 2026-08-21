import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;