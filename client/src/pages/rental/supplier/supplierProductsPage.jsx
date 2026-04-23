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
    <div className="flex flex-col gap-md">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="gradient-text">Product Inventory</h1>
          <p>Manage and track all your rental items in one place.</p>
        </div>
        <div className="page-header-actions">
          <Link to="/supplier/add-product" className="btn btn-primary">
            <BiPlus style={{ fontSize: '1.2rem' }} /> Add Product
          </Link>
        </div>
      </div>

      <div className="table-wrapper" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {loaded ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Stock</th>
                <th>Availability</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody style={{ color: 'var(--text-primary)' }}>
              {products.map((item) => (
                <tr key={item.productID}>
                  <td>
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        objectCover: 'cover',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </td>

                  <td><code className="text-xs font-bold">{item.productID}</code></td>
                  <td className="font-semibold">{item.name}</td>
                  <td>
                    <span className="font-bold">Rs. {item.price.toLocaleString()}</span>
                  </td>
                  <td><span className="badge badge-indigo">{item.category}</span></td>
                  <td>{item.brand}</td>
                  <td>{item.model}</td>
                  <td>{item.stock}</td>

                  <td>
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center items-center gap-sm">
                      <button
                        onClick={() => navigate("/supplier/update-product", { state: item })}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100px' }}
                      >
                        Edit
                      </button>

                      <ProductDeleteButton
                        productID={item.productID}
                        reload={() => setLoaded(false)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        )}
      </div>

    </div>
  );
}



