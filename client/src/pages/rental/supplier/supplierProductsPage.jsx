//supplierProductsPage.jsx
import api from "../../../api/axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BiPlus } from "react-icons/bi";
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
      const token = localStorage.getItem("token");

      api
        .get("/rental/products")
        .then((response) => {
          setProducts(response.data);
          setLoaded(true);
        });
    }
  }, [loaded]);

  const navigate = useNavigate();
  return (
    <div className="glass-card w-full min-h-screen bg-elevated p-4">
      <div className="bg-white card-rounded card-shadow overflow-hidden">
        {loaded ? (
          <table className="w-full">
            <thead className="bg-card sticky top-4 z-10">
              <tr className="uppercase tracking-wide">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price</th>
                {/* <th className="px-6 py-4">Labeled Price</th> */}
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((item) => (
                <tr
                  key={item.productID}
                  className="transition duration-200"
                >
                  <td className="px-6 py-4">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover card-rounded card-shadow border"
                    />
                  </td>

                  <td className="px-6 py-4">{item.productID}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">Rs. {item.price}</td>
                  {/* <td className="px-6 py-4 line-through -500">
                  Rs. {item.labelPrice}
                </td> */}
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">{item.brand}</td>
                  <td className="px-6 py-4">{item.model}</td>
                  <td className="px-6 py-4">
                    {item.stock}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isAvailable ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => {
                          navigate("/supplier/update-product", { state: item });
                        }}
                        //className="px-3 py-2 card-rounded w-[70px] bg-accent hover:bg-transparent hover: border-2 border-accent transition"
                        className="hover: border-2 border-accent card-rounded cursor-pointer hover:bg-accent justify-center items-center transition h-[30px] w-[100px]"
                      >
                        Edit
                      </button>

                      <ProductDeleteButton
                        productID={item.productID}
                        reload={() => {
                          setLoaded(false);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Loader />
        )}
      </div>

      <Link
        to="/supplier/add-product"
        className="fixed right-6 bottom-6 w-14 h-14 flex items-center justify-center
          rounded-full bg-accent text-white text-3xl shadow-xl
          hover:bg-gold hover:scale-105 transition-all duration-300"
      >
        <BiPlus />
      </Link>
    </div>
  );
}



