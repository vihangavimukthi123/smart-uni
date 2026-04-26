import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderMetadata, setOrderMetadata] = useState(null); // Stores delivery/contact for editing

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === (product.productID || product.id));

      if (existing) {
        return prev.map((item) =>
          item.id === (product.productID || product.id)
            ? {
                ...item,
                qty: item.qty + qty,
                total: (item.qty + qty) * item.pricePerDay,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.productID || product.id,
          name: product.name,
          pricePerDay: product.price,
          qty: qty,
          total: product.price * qty,
          image: (() => {
            const img = product.images?.[0] || product.image;
            if (!img) return "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=800&h=600&fit=crop";
            if (img.startsWith('http')) return img;
            const normalized = img.replace(/\\/g, '/');
            return normalized.startsWith('/') ? normalized : `/${normalized}`;
          })(),
          supplierEmail: product.supplierEmail,
          dates: "Select dates",
        },
      ];
    });
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: Math.max(1, item.qty + delta),
              total: item.pricePerDay * Math.max(1, item.qty + delta),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setEditingOrderId(null);
    setOrderMetadata(null);
  };

  const loadOrderIntoCart = (order) => {
    setEditingOrderId(order._id);
    setOrderMetadata({
      rentalDates: order.rentalDates,
      deliveryDetails: order.deliveryDetails,
      contactInfo: order.contactInfo
    });
    const items = order.items.map(item => ({
      id: item.productId,
      name: item.name,
      pricePerDay: item.price,
      qty: item.qty,
      total: item.price * item.qty,
      image: (() => {
        const img = item.image;
        if (!img) return "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=800&h=600&fit=crop";
        if (img.startsWith('http')) return img;
        const normalized = img.replace(/\\/g, '/');
        return normalized.startsWith('/') ? normalized : `/${normalized}`;
      })(),
      supplierEmail: item.supplierEmail,
    }));
    setCartItems(items);
  };

  const reorderIntoCart = (order) => {
    setEditingOrderId(null);
    setOrderMetadata(null); // Clear all metadata so user must fill details again
    const items = order.items.map(item => ({
      id: item.productId,
      name: item.name,
      pricePerDay: item.price,
      qty: item.qty,
      total: item.price * item.qty,
      image: (() => {
        const img = item.image;
        if (!img) return "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=800&h=600&fit=crop";
        if (img.startsWith('http')) return img;
        const normalized = img.replace(/\\/g, '/');
        return normalized.startsWith('/') ? normalized : `/${normalized}`;
      })(),
      supplierEmail: item.supplierEmail,
    }));
    setCartItems(items);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeItem, 
      updateQty, 
      clearCart, 
      editingOrderId, 
      orderMetadata,
      loadOrderIntoCart,
      reorderIntoCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);