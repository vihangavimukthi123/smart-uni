import axios from "axios";
import { useState } from 'react'
import toast from "react-hot-toast";
import { GrGoogle } from 'react-icons/gr'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student") // Added role state
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function login() {
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const url = role === "student" 
        ? "/api/auth/login" 
        : "/api/auth/login"

      const res = await axios.post(url, {
        email: email,
        password: password
      })

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.role)
      }

      toast.success("Login successful")

      if (res.data.role?.toLowerCase() === "supplier") {
        navigate("/supplier");
      } else {
        navigate("/landing");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
      console.log(err)
    } finally {
      setLoading(false)
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
          width: "100%", maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{
          width: "52px", height: "52px", borderRadius: "12px",
          backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "18px",
        }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <rect x="8"  y="20" width="4" height="16" rx="1" fill="#1E40AF"/>
            <rect x="16" y="14" width="4" height="22" rx="1" fill="#1E40AF"/>
            <rect x="24" y="8"  width="4" height="28" rx="1" fill="#1E40AF"/>
            <rect x="32" y="14" width="4" height="22" rx="1" fill="#1E40AF"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 32px 0" }}>
          Sign in to your university event account
        </p>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@university.edu"
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ width: "100%", marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Role Selector */}
        <div style={{ width: "100%", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#374151" }}>
              <input type="radio" value="student" checked={role === "student"} onChange={() => setRole("student")} style={{ accentColor: "#1E40AF" }} />
              Student Login
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer", color: "#374151" }}>
              <input type="radio" value="supplier" checked={role === "supplier"} onChange={() => setRole("supplier")} style={{ accentColor: "#1E40AF" }} />
              Supplier Login
            </label>
          </div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%", height: "46px",
            backgroundColor: loading ? "#9CA3AF" : "#1E40AF",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: "700",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "16px",
            transition: "background-color 0.15s",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }} />
          <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }} />
        </div>

        <button
          style={{
            width: "100%", height: "46px",
            backgroundColor: "#FFFFFF",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "24px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          <GrGoogle size={16} color="#EA4335" />
          Continue with Google
        </button>

        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#1E40AF", fontWeight: "600", textDecoration: "none" }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%", height: "46px",
  padding: "0 14px",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#111827",
  backgroundColor: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
}

