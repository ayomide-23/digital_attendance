import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Login() {
  const [user, setuser] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setisLoading] = useState(false);
  const [error, seterror] = useState({});
  const Navigate = useNavigate();

  const handlechange = (e) => {
    const { name, value } = e.target;
    setuser((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const new_errors = {};
    seterror({});
    if (user.password.length < 6) {
      new_errors.password = "Password must be at least 6 characters";
    }
    return new_errors;
  };

  const handlelogin = async (e) => {
    e.preventDefault();
    const validate_errors = validate();
    if (Object.keys(validate_errors).length > 0) {
      seterror(validate_errors);
      return;
    }
    setisLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if(response.ok){
        if(data.role == "admin"){
          setuser({email: "", password: ""})
          Navigate("/admin/admin_dashboard")
        }else{
          setuser({email: "", password: ""})
          Navigate("/user/dashboard")
        }
      }else{
        setisLoading(false)
        seterror({ detail: data.error || "An error occured while logging in.", message: "Email or password incorrect"})
      }
    } catch (err) {
      setisLoading(false);
      seterror({detail: "An error occurred while logging in. Please try again."});
      console.error("Login error:", err);
      alert("An error occurred while logging in. Please try again.");
      return;
    }
  };
  return (
    <div className="relative text-white h-screen background">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="backdrop-blur-sm bg-white/6 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-200">
            {" "}
            Welcome, Sign in to Digital Attendance
          </h2>
          <p className="text-sm text-green-100/80 mb-6">
            Log into your account to continue using Digital Attendance
          </p>
          <form onSubmit={handlelogin} className="">
            <div className="grid grid-rows-2 gap-y-2">
              <label className="flex flex-col text-sm gap-y-1">
                <span className="mb-1 text-green-100/90">Email:</span>
                <input
                  name="email"
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={handlechange}
                  placeholder="Enter your email"
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </label>
              <label className="flex flex-col text-sm gap-y-1">
                <span className="mb-1 text-green-100/90">Password:</span>
                <input
                  name="password"
                  id="password"
                  type="password"
                  value={user.password}
                  onChange={handlechange}
                  placeholder="Enter your password"
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                {error.password && (
                  <span className="text-red-500 text-sm">{error.password}</span>
                )}
                {error.message && (
                  <p className="text-red-500 text-sm">{error.message}</p>
                )}
              </label>
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/5 mt-2 px-5 py-2 rounded-lg bg-linear-to-r from-[#1A3636] to-[#0c8b7a] text-white font-medium shadow hover:brightness-105"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-200">Don't have an account? <Link to="/register" className="text-green-100/90 hover:underline">Sign up</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
