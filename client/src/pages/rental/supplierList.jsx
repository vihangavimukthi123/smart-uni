//supplierList.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  CheckCircle,
  Star,
} from "lucide-react";
// import Sidebar from "../../components/layout/Sidebar";
// import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

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
    <main className="flex-1 flex-col">
          <div className="w-full px-16 py-10">
            <div className="flex justify-between items-start mb-10">
              <div className="max-w-xl">
                <h2 className="mb-4 tracking-tight">
                  Find the Best Suppliers for Your Event
                </h2>
                <p className="-500 leading-relaxed">
                  Browse our curated list of certified rental providers for
                  university events, from high-end AV to essential logistics.
                </p>
              </div>
              <div className="relative w-80">
                <Search
                  className="absolute left-3 top-4/2 -translate-y-1/2 -400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 card-rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white card-shadow"
                />
              </div>
            </div>

            <p className="text-[10px] -400 mb-6 uppercase tracking-[0.2em]">
              {loading ? "SEARCHING..." : `${filteredSuppliers.length} SUPPLIERS AVAILABLE`}
            </p>

            {/* SUPPLIER CARDS */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20">
                    <p className="-400 animate-pulse">Loading suppliers...</p>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="py-20 bg-white border-dashed card-rounded">
                    <p className="-400">No suppliers found matching "{search}"</p>
                </div>
              ) : (
                filteredSuppliers.map((s, i) => (
                  <div
                    key={s._id || i}
                    className="bg-white p-4 card-rounded flex gap-4 hover:card-shadow duration-200"
                  >
                    <div className="w-24 h-24 bg-slate-50 card-rounded flex flex-center shrink-0 overflow-hidden">
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] -300 uppercase tracking-tighter px-1">
                          {s.firstName?.slice(0,1)}{s.lastName?.slice(0,1)} LOGO
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-4 mb-1">
                            <h3 className="-800">
                              {s.firstName} {s.lastName}
                            </h3>
                            {s.isVerified && (
                              <CheckCircle
                                className="-500 fill-blue-500"
                                size={16}
                              />
                            )}
                          </div>
                          <p className="-500 line-clamp-4 mb-4 leading-relaxed">
                            {s.description || "No description provided."}
                          </p>
                        </div>
                        <div className="">
                          <div className="flex items-center justify-end gap-4 mb-1">
                            <Star
                              className="-400 fill-orange-400"
                              size={14}
                            />
                            <span className="">{s.rating || 5.0}</span>
                            <span className="-400 ml-1">
                              ({s.reviewsCount || 0} reviews)
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-1 rounded-full tracking-tight flex items-center gap-1 justify-end ${s.status?.includes("PENDING") ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"}`}
                          >
                            <span className="text-[14px]">●</span> {s.status || "CERTIFIED"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-4">
                          {(s.tags || ["General"]).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-slate-100 -600 card-rounded text-[11px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate(`/rental/supplier-details?email=${s.email}`)}
                          className="bg-blue-600 px-5 py-2 card-rounded flex items-center gap-4 transition-colors"
                        >
                          View Profile & Items <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
    </main>
  );
};

export default SupplierList;



