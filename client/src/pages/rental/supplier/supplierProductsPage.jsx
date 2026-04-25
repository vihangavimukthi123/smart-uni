//supplierProductsPage.jsx
import api from "../../../api/axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BiPlus, BiEdit, BiPackage } from "react-icons/bi";
import { Link } from "react-router-dom";
import Loader from "../components/loader";
import ProductDeleteButton from "../components/productDeleteButton";

export default function SupplierProductsPage() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // useEffect(()=>{  //run first time in startting and second this runs when any value changes
  //   if(!loaded){
  //     axios.get("/api/rental" + '/products').then((response)=>{
  //       console.log(response.data)
  //       setProducts(response.data)
  //       setLoaded(true)
  //     })
  //   }

  // }, [loaded])
  useEffect(() => {
    if (!loaded) {
      api
        .get("/rental/products")
        .then((response) => {
          // Sort by productID in ascending order
          const sortedProducts = response.data.sort((a, b) => 
            a.productID.localeCompare(b.productID, undefined, { numeric: true, sensitivity: 'base' })
          );
          setProducts(sortedProducts);
          setLoaded(true);
        });
    }
  }, [loaded]);

  const navigate = useNavigate();
  return (
    <div className="anim-fadeIn pt-10 px-10">
      <div className="page-header mb-8">
        <div className="page-header-left">
          <div className="flex flex-col gap-1">
            <h1 className="gradient-text text-4xl font-black tracking-tight leading-none">
              Hardware Inventory
            </h1>
            <p className="text-secondary mt-2 font-medium">Manage and track your active rental products and live stock levels.</p>
          </div>
        </div>
        <div className="page-header-actions self-end">
          <Link to="/supplier/add-product" className="btn btn-primary btn-lg px-8 shadow-indigo/20 flex items-center gap-3 h-[54px] rounded-xl font-black tracking-wide">
            <BiPlus size={24} /> Register Component
          </Link>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/10 shadow-2xl">
        {!loaded ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader />
            <p className="text-muted font-bold tracking-widest uppercase text-xs">Synchronizing Inventory...</p>
          </div>
        ) : (
          <div className="table-wrapper border-none">
            <table className="data-table">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="py-6 pl-8 w-32">Visual</th>
                  <th className="py-6">Asset ID</th>
                  <th className="py-6">Hardware Identity</th>
                  <th className="py-6">Category</th>
                  <th className="py-6 text-center">Base Rate</th>
                  <th className="py-6 text-center">In Stock</th>
                  <th className="py-6">Live Status</th>
                  <th className="py-6 pr-8 text-center">Management</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state py-32">
                        <BiPackage className="text-6xl text-indigo/20 mb-6" />
                        <h3 className="text-2xl font-bold">Catalog Empty</h3>
                        <p className="max-w-md mx-auto italic">Start by adding your first hardware product to the rental market.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.productID} className="hover:bg-white/[0.04] transition-colors group">
                      <td className="py-4 pl-8">
                        <div 
                          style={{ width: '56px', height: '56px' }}
                          className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-inner group-hover:border-indigo/30 transition-colors flex items-center justify-center"
                        >
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                          />
                        </div>
                      </td>

                      <td className="py-6">
                        <code className="text-[10px] font-black text-indigo-light opacity-60 group-hover:opacity-100 transition-opacity">
                          #{item.productID}
                        </code>
                      </td>
                      
                      <td className="py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-base tracking-tight group-hover:text-indigo-light transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted font-bold tracking-widest uppercase">{item.brand} {item.model}</span>
                        </div>
                      </td>

                      <td className="py-6">
                        <span className="badge badge-indigo px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-6 text-center">
                        <div className="flex flex-col">
                          <span className="text-primary font-black">LKR {item.price.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-6 text-center">
                        <span className="font-black text-primary bg-white/5 px-3 py-1 rounded-lg border border-white/5 group-hover:bg-white/10 transition-colors">
                          {item.stock}
                        </span>
                      </td>

                      <td className="py-6">
                          <div className="flex items-center">
                            <span className={`text-[10px] font-black tracking-widest uppercase ${item.stock > 0 ? 'text-emerald' : 'text-rose'}`}>
                              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                      </td>

                      <td className="py-6 pr-8">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => navigate("/supplier/update-product", { state: item })}
                            className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center btn-hover-indigo transition-all shadow-sm border border-indigo/20"
                            title="Quick Edit"
                          >
                            <BiEdit size={20} />
                          </button>

                          <ProductDeleteButton
                            productID={item.productID}
                            reload={() => setLoaded(false)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



