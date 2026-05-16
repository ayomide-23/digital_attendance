import { Route, Routes } from "react-router-dom"
import { Navigate } from "react-router-dom"
import Register from "./pages/register.jsx"
import Login from "./pages/login.jsx"
import AdminDashboard from "./pages/admin/admin_dashboard.jsx"
import Dashboard from "./pages/users/dashboard.jsx"
export default function App(){
  return(
    <Routes>
      <Route path="/" element={<Navigate to={"/login"} />} />
      <Route path="/login" element={<Login/> } />
      <Route path="/register" element={<Register/> } />
      <Route path="/admin/admin_dashboard" element={<AdminDashboard/>} />
      <Route path="/user/dashboard" element={<Dashboard/>} />
      <Route path="*" element={<Navigate to={"/login"} />} />
    </Routes>
  )
}