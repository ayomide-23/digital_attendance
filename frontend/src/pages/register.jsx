import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
export default function Register() {
  const [user, setuser] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
    staff_id: "",
    block: "A",
  });
  const [isLoading, setisLoading] = useState(false);
  const [error, seterror] = useState({});

  //handling input changes
  const handlechange = (e) => {
    const { name, value } = e.target;

    setuser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //error validations 
  const validate = () => {
    const new_errors = {};
    const email = user.email.trim().toLowerCase();
    seterror({});
    if (!email) {
      new_errors.email = "Email is required";
    }
    if (!email.endsWith("@gmail.com")) {
      new_errors.email = "Email must end with @gmail.com";
    }
    if(user.password !== user.confirmPassword){
      new_errors.password = "Passwords do not match";
    }else if(user.password.length < 6){
      new_errors.password = "Password must be at least 6 characters";
    }
    return new_errors
  };


  const handleregister = async (e) => {
    e.preventDefault();
    const validate_errors = validate();
    if(Object.keys(validate_errors).length > 0){
      seterror(validate_errors);
      return;
    }
    setisLoading(true); 
    
    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Resgistration successful");
        setuser({
          fname: "",
          lname: "",
          email: "",
          password: "",
          staff_id: "",
          block: "",
        });
        window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during registration", err);
      alert("An error occured during registration. Please try again later.");
      return;
    }
  };

  return (
    <div className="relative text-white h-screen background">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="backdrop-blur-sm bg-white/6 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-200">
            Welcome, Sign up to Digital Attendance
          </h2>
          <p className="text-sm text-green-100/80 mb-6">
            Create your account to continue to Digital Attendance
          </p>
          <form onSubmit={handleregister} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-100/90">First name:</span>
                <input
                  name="fname"
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={user.fname}
                  onChange={handlechange}
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-100/90">Last name</span>
                <input
                  name="lname"
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={user.lname}
                  onChange={handlechange}
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </label>
            </div>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-green-100/90">Email:</span>
              <input
                name="email"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={handlechange}
                required
                className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                aria-describedby="email-help"
              />
              {error.email && (
                <span id="email-help" className="text-red-500 text-sm mt-1">
                  {error.email}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-100/90">Password:</span>
                <input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={user.password}
                  onChange={handlechange}
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                {error.password && (
                  <span className="text-red-500 text-sm mt-1">
                    {error.password}
                  </span>
                )}
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 text-green-100/90">
                  Confirm Password:
                </span>
                <input
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={user.confirmPassword}
                  onChange={handlechange}
                  required
                  className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </label>
              {error.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {error.confirmPassword}
                </span>
              )}
            </div>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-green-100/90">Staff ID:</span>
              <input
                name="staff_id"
                id="staffID"
                type="text"
                placeholder="Staff ID"
                value={user.staff_id}
                onChange={handlechange}
                required
                className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </label>

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-green-100/90">Block type:</span>
              <select
                name="block"
                id="blockType"
                value={user.block}
                onChange={handlechange}
                className="px-3 py-2 rounded-lg bg-[#071010] border border-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
            </label>

            <div className="flex items-center justify-between mt-2 mb-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-linear-to-r from-[#1A3636] to-[#0c8b7a] text-white font-medium shadow hover:brightness-105"
              >
                {isLoading ? "Registring..." : "Register"}
              </button>
              <button
                type="button"
                disabled = {isLoading}
                className="px-4 py-2 rounded-lg border border-green-800 text-green-100/90 hover:bg-white/2"
              >
                Reset
              </button>
            </div>
            <p className="text-xs text-gray-200">Already have an account? <Link to="/login" className="text-green-100/90 hover:underline">Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
