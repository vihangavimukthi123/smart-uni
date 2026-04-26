// registerPage.jsx
import axios from "axios";
import { useState } from 'react'
import toast from "react-hot-toast";
import { Link, useNavigate } from 'react-router-dom'
import { BiUser, BiEnvelope, BiPhone, BiLockAlt, BiArrowBack, BiChevronRight, BiBuildings } from "react-icons/bi";

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const navigate = useNavigate()

  async function register() {
    if (!email || !firstName || !lastName || !phone || !password) {
      return toast.error("Please fill in all security protocols");
    }
    
    try {
      const url = "/api/auth" 
      const res = await axios.post(url, {
        email,
        firstName,
        lastName,
        phone,
        password,
        role
      })
      toast.success(res.data.message || "Credential registry successful")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registry handshake failed")
    }
  }

  return (
    <div className="min-h-screen w-full flex-center relative overflow-hidden bg-[#0A0A0B]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      
      <div className="relative z-10 w-full max-w-xl mx-4">
        {/* Back Link */}
        <Link to="/login" className="group inline-flex items-center gap-2 text-muted hover:text-indigo transition-colors mb-8 ml-2">
          <BiArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Access Portal</span>
        </Link>

        <div className="glass-card p-10 md:p-14 border-white/10 shadow-2xl bg-gradient-to-br from-white/[0.03] to-transparent animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo/10 rounded-2xl flex-center mx-auto mb-6 border border-indigo/20 shadow-2xl shadow-indigo/10">
              <BiUser className="text-indigo" size={32} />
            </div>
            <h1 className="text-4xl font-black text-primary tracking-tighter mb-3">Identity Registry</h1>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] opacity-60">
              Join the university logistics network
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="John" 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-12 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/10" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/10" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <BiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
                <input 
                  type="email" 
                  placeholder="you@university.edu" 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-12 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/10" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <BiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
                <input 
                  type="tel" 
                  placeholder="07XXXXXXXX" 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-12 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/10" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <BiLockAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-12 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/10" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Account Classification</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "student", label: "Student", icon: <BiUser size={18} /> },
                  { id: "supplier", label: "Partner", icon: <BiBuildings size={18} /> }
                ].map(r => (
                  <label key={r.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    role === r.id ? "bg-indigo/10 border-indigo shadow-lg shadow-indigo/10" : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value={r.id} 
                      checked={role === r.id} 
                      onChange={() => setRole(r.id)} 
                      className="hidden"
                    />
                    <div className={`${role === r.id ? "text-indigo" : "text-muted"} transition-colors`}>{r.icon}</div>
                    <span className={`text-sm font-black uppercase tracking-widest ${role === r.id ? "text-primary" : "text-muted"}`}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={register}
              className="w-full py-5 btn btn-primary flex-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo/20 mt-4 active:scale-[0.98] transition-all"
            >
              <span>INITIALIZE REGISTRY</span>
              <BiChevronRight size={20} />
            </button>

            <div className="text-center pt-6">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                Already registered in the network?{" "}
                <Link to="/login" className="text-indigo hover:text-primary transition-colors ml-2">
                  Access Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
