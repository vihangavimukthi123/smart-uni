import { useState } from "react"
import toast from "react-hot-toast"
import axios from "axios";

export default function ProductDeleteButton(props){

    const productID = props.productID;
    const reload = props.reload;
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        const token = localStorage.getItem("token");
        axios.delete(
          import.meta.env.VITE_BACKEND_URL + "/products/" + productID,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(() => {
          toast.success("Product deleted successfully");
          setIsDeleting(false);
          setIsMessageOpen(false);
          reload()
        }).catch(()=>{
            toast.error("Failed to delete product")
            setIsDeleting(false)
        })
    }

    return(
        <>
            <button onClick={()=>{setIsMessageOpen(true)}} className="text-white rounded-full cursor-pointer hover:bg-red-400 bg-red-800 justify-center items-center font-medium transition h-[30px] w-[100px]">
                Delete
            </button>
            {isMessageOpen && (
                <div className="fixed top-0 left-0 w-[100vw] h-screen bg-black/70 z-50 flex items-center justify-center">
                    <div className="w-[500px] h-[210px] bg-primary rounded-2xl relative flex flex-col items-center justify-center">
                        <button 
                            onClick={()=>{setIsMessageOpen(false);
                            }} 
                            className="w-[35px] h-[35px] bg-red-800 rounded-full text-white text-xl font-bold cursor-pointer hover:bg-red-600 absolute right-[-20px] top-[-20px]">
                                X
                        </button>

                        <h1 className="text-2xl text-center mb-6">Are sure you want to delete product {productID}?</h1>

                        <div className="w-full flex justify-center gap-10">
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete} className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                                    Delete
                            </button>

                            <button
                                onClick={()=>{
                                    setIsMessageOpen(false);
                                }}
                                className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition">
                                    Cancel
                            </button>
                        </div>
                    </div>
                
                </div>)}
        </>
    )
}


{/* <button onClick={() => {
                    const token = localStorage.getItem("token");

                    axios.delete(
                      import.meta.env.VITE_BACKEND_URL + "/products/" + item.productID,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      }
                    )
                    .then(() => {
                      toast.success("Product deleted successfully");
                      setLoaded(false)
                    })
                    }} className="text-white rounded-full cursor-pointer hover:bg-red-400 bg-red-800 justify-center items-center font-medium transition h-[30px] w-[100px]">
                      Delete
                  </button> */}

