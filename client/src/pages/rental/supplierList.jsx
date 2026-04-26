// supplierList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { BiSearch, BiChevronRight, BiCheckCircle, BiStar, BiArrowBack, BiMap } from "react-icons/bi";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/rental/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Fetch suppliers error", err);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div className="flex flex-col gap-10 mb-16">
        <Link to="/rental/items" className="group inline-flex items-center gap-2 text-muted hover:text-indigo transition-colors">
          <BiArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Inventory</span>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-black tracking-tight leading-tight text-primary">Certified Rental Partners</h1>
            <p className="text-secondary text-sm font-bold uppercase tracking-widest opacity-70">Browse our curated list of verified hardware providers for university events</p>
          </div>
          <div className="relative w-full md:w-96">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={22} />
            <input
              type="text"
              placeholder="Search by name, category, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 rounded-2xl px-12 py-4 text-sm font-bold outline-none transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-[10px] text-muted font-black uppercase tracking-[0.25em] opacity-50 px-2">
          {loading ? "SEARCHING REGISTRY..." : `${filteredSuppliers.length} SUPPLIERS IDENTIFIED`}
        </p>

        {loading ? (
          <div className="flex-center py-40">
            <div className="w-10 h-10 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="glass-card py-40 flex flex-col items-center text-center gap-4 border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex-center mb-2">
              <BiSearch className="text-indigo/20" size={40} />
            </div>
            <h3 className="text-2xl font-black text-primary">No Results Identified</h3>
            <p className="text-muted text-sm font-bold max-w-sm">No suppliers found matching your current search parameters. Try broad terms like 'Audio' or 'Lighting'.</p>
          </div>
        ) : (
          filteredSuppliers.map((s, i) => (
            <div
              key={s._id || i}
              className="glass-card p-8 flex flex-col md:flex-row gap-8 hover:translate-y-[-4px] hover:border-indigo/30 transition-all duration-500 shadow-xl bg-gradient-to-br from-white/[0.02] to-transparent group"
            >
              <div className="w-28 h-28 bg-white/5 rounded-3xl flex-center shrink-0 overflow-hidden border border-white/10 shadow-2xl relative">
                {s.profileImage ? (
                  <img src={s.profileImage} alt={s.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[14px] text-indigo font-black uppercase tracking-tighter opacity-40">
                    {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                  </div>
                )}
                {s.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-1">
                    <BiCheckCircle className="text-emerald" size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-primary tracking-tight group-hover:text-indigo transition-colors">
                        {s.firstName} {s.lastName}
                      </h3>
                    </div>
                    <p className="text-secondary text-sm font-medium leading-relaxed line-clamp-2 max-w-2xl opacity-80">
                      {s.description || "A verified university supplier providing professional-grade hardware and event logistics services."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <BiStar className="text-amber fill-amber" size={18} />
                      <span className="text-sm font-black text-primary">{s.rating || "5.0"}</span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">({s.reviewsCount || 0} reviews)</span>
                    </div>
                    <span className="badge badge-emerald px-3 py-1 text-[9px] font-black tracking-widest uppercase">
                      {s.status || "CERTIFIED PARTNER"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {(s.tags || ["General"]).map((tag) => (
                      <span key={tag} className="badge badge-indigo text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/rental/supplier-details?email=${s.email}`)}
                    className="btn btn-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-indigo/20 active:scale-95 transition-all"
                  >
                    <span>EXPLORE PORTFOLIO</span>
                    <BiChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierList;
