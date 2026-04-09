import axios from "axios";
import { useState } from 'react'
import toast from "react-hot-toast";
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const navigate = useNavigate()

  async function register() {
    try {
      const url = role === "student" 
        ? "/api/auth" 
        : "/api/auth"

      const res = await axios.post(url, {
        email,
        firstName,
        lastName,
        phone,
        password,
        role
      })

      toast.success(res.data.message || "Registration successful")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
      console.log(err)
    }
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 40%, #1e2f6e 100%)",
        zIndex: 0,
      }} />

      <div
        style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: "500px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
          Create Account
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 32px 0" }}>
          Join the university event rental community
        </p>

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>First Name</label>
            <input type="text" placeholder="John" onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Last Name</label>
            <input type="text" placeholder="Doe" onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Email Address</label>
          <input type="email" placeholder="you@university.edu" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Phone Number</label>
          <input type="tel" placeholder="0XXXXXXXXX" onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Password</label>
          <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ width: "100%", marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>I am a:</label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
              <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} /> Student
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" }}>
              <input type="radio" name="role" value="supplier" checked={role === "supplier"} onChange={() => setRole("supplier")} /> Supplier
            </label>
          </div>
        </div>

        <button
          onClick={register}
          style={{
            width: "100%", height: "46px",
            backgroundColor: "#1E40AF", color: "#FFFFFF",
            fontSize: "15px", fontWeight: "700",
            border: "none", borderRadius: "8px", cursor: "pointer",
            marginBottom: "16px", transition: "background-color 0.15s",
          }}
          onMouseEnter={e => e.target.style.backgroundColor = "#1E3A8A"}
          onMouseLeave={e => e.target.style.backgroundColor = "#1E40AF"}
        >
          Create Account
        </button>

        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1E40AF", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%", height: "42px",
  padding: "0 12px",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#111827",
  backgroundColor: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
}


