//supplierAddProductPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineProduct } from "react-icons/ai";
import toast from "react-hot-toast";
import api from "../../../api/axios";
import uploadFile from "../utils/mediaUpload";

export default function SupplierAddProductPage() {
  const [productID, setProductID] = useState("");
  const [name, setName] = useState("");
  const [altName, setAltName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  // const [labelPrice, setLabelPrice] = useState(0);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [stock, setStock] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const navigate = useNavigate();

  async function addProduct() {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("You must be logged in as admin to add product");
      navigate("/login");
      return;
    }

    console.log(files);

    const imagePromises = [];

    //10
    for (let i = 0; i < files.length; i++) {
      const promise = uploadFile(files[i]);
      imagePromises.push(promise);
    }

    const images = await Promise.all(imagePromises).catch((err) => {
      toast.error("Error uploading images. Please try again.");
      console.log("Error uploading images:");
      console.log(err);
      return;
    });

    if (
      productID == "" ||
      name == "" ||
      description == "" ||
      category == "" ||
      brand == "" ||
      model == ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const altNamesInArray = altName.split(",");
      // const imgInArray = images.split(",");
      await api.post(
        "/rental/products/",
        {
          productID: productID,
          name: name,
          altName: altNamesInArray,
          description: description,
          price: price,
          // labelPrice: labelPrice,
          images: images,
          category: category,
          brand: brand,
          model: model,
          stock: stock,
          isAvailable: isAvailable,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );
      toast.success("Product added successfully!");
      navigate("/supplier");
    } catch (err) {
      toast.error("Error adding product. Please try again.");
      console.log("Error adding product:");
      console.log(err);
    }
  }

  return (
    <div className="w-full flex justify-center p-[50px] overflow-y-scroll">
      <div className="bg-accent/20 card-rounded p-[40px] w-[800px] card-shadow overflow-y-visible">
        <h1 className="w-full mb-[20px] flex items-center gap-[5px]">
          {" "}
          <AiOutlineProduct /> Add New Product
        </h1>
        <div className="w-full bg-white p-[20px] flex flex-row flex-wrap justify-between card-rounded card-shadow">
          <div className="my-[10px] w-[30%]">
            <label>Product ID</label>
            <input
              type="text"
              value={productID}
              onChange={(e) => {
                setProductID(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
            <p className="-500 w-full">
              Provide a unique product ID
            </p>
          </div>

          <div className="my-[10px] w-[65%]">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          <div className="my-[10px] w-full">
            <label>Alternative Names</label>
            <input
              type="text"
              value={altName}
              onChange={(e) => {
                setAltName(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
            <p className="-500 w-full">
              Separate multiple names with commas
            </p>
          </div>

          <div className="my-[10px] w-full">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="w-full h-[100px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px] py-[10px]"
            />
          </div>

          <div className="my-[10px] w-[48%]">
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          {/* <div className="my-[10px] w-[48%]">
            <label>Labelled Price</label>
            <input
              type="number"
              value={labelPrice}
              onChange={(e) => {
                setLabelPrice(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div> */}

          <div className="my-[10px] w-full">
            <label>Images</label>
            <input
              type="file"
              multiple={true}
              onChange={(e) => {
                setFiles(Array.from(e.target.files));
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          <div className="my-[10px] flex-col w-[30%]">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            >
              <option value="">Select Category</option>
              <option value="Audio & Visual Equipment">
                Audio & Visual Equipment
              </option>
              <option value="Lighting & Effects">Lighting & Effects</option>
              <option value="Furniture & Seating">Furniture & Seating</option>
              <option value="Tents & Canopies">Tents & Canopies</option>
              <option value="Catering & Food Service">
                Catering & Food Service
              </option>
              <option value="Decor & Theming">Decor & Theming</option>
              <option value="Stage & Platforms">Stage & Platforms</option>
              <option value="Photo & Video Booths">Photo & Video Booths</option>
              <option value="Games & Entertainment">
                Games & Entertainment
              </option>
              <option value="Party Supplies">Party Supplies</option>
              <option value="Transportation & Parking">
                Transportation & Parking
              </option>
              <option value="Tents & Outdoor Gear">Tents & Outdoor Gear</option>
              <option value="Audio-Visual Accessories">
                Audio-Visual Accessories
              </option>
              <option value="Safety & Sanitation">Safety & Sanitation</option>
              <option value="Specialty Rentals">Specialty Rentals</option>
            </select>
          </div>

          <div className="my-[10px] w-[30%]">
            <label>Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          <div className="my-[10px] w-[30%]">
            <label>Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          <div className="my-[10px] w-[48%]">
            <label>Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
              }}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            />
          </div>

          <div className="my-[10px] flex-col items-center w-[40%]">
            <label>Available</label>
            <select
              value={isAvailable}
              onChange={(e) => setIsAvailable(e.target.value === "true")}
              className="w-full h-[40px] card-rounded focus:outline-none focus:ring-2 focus:ring-accent border-accent card-shadow px-[20px]"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <Link
            to="/supplier/products"
            className="w-[49%] h-[50px] bg-red-700 card-rounded flex justify-center items-center border-[2px] mt-[20px]"
          >
            Cancel
          </Link>

          <button
            onClick={addProduct}
            className="w-[49%] h-[50px] bg-accent card-rounded hover:bg-transparent hover: border-[2px] border-accent mt-[20px]"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}



