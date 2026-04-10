import { useState } from "react"
import toast from "react-hot-toast"
import api from "../../../api/axios";

export default function ProductDeleteButton(props){

    const productID = props.productID;
    const reload = props.reload;
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await api.delete("/rental/products/" + productID);
            toast.success("Product deleted successfully");
            setIsDeleting(false);
            setIsMessageOpen(false);
            reload();
        } catch (error) {
            toast.error("Failed to delete product");
            setIsDeleting(false);
        }
    }

    return(
        <>
            <button 
              onClick={() => setIsMessageOpen(true)} 
              className="btn btn-danger btn-sm"
              style={{ width: '100px' }}
            >
                Delete
            </button>
            {isMessageOpen && (
                <div className="modal-overlay">
                    <div className="modal anim-scaleIn" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="gradient-text" style={{ fontSize: '1.25rem' }}>Confirm Deletion</h2>
                            <button 
                                onClick={() => setIsMessageOpen(false)} 
                                className="btn btn-ghost btn-sm"
                                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body flex flex-col items-center gap-md" style={{ padding: 'var(--space-xl)' }}>
                            <div 
                                className="flex items-center justify-center"
                                style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    color: 'var(--rose)',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: 'var(--space-sm)'
                                }}
                            >
                                !
                            </div>
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Are you sure you want to delete <br/>
                                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{productID}</span>?
                            </p>
                            <p className="text-xs" style={{ color: 'var(--rose)', textAlign: 'center' }}>
                                This action is permanent and cannot be undone.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setIsMessageOpen(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDelete} 
                                className="btn btn-danger"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

