import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'ecommerce_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever cart state changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Helper to extract uniform ID
  const getItemId = (item) => item.id || item._id || item.productId;

  /**
   * Add a product to the cart
   * @param {Object} product
   * @param {number} [quantity=1]
   */
  const addToCart = (product, quantity = 1) => {
    const productId = getItemId(product);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => getItemId(item) === productId
      );

      if (existingIndex > -1) {
        // Product already in cart, increment quantity
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity;
        const newQty = currentQty + quantity;

        // Respect stock if defined
        const maxStock = updated[existingIndex].stock ?? Infinity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, maxStock)
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            id: productId,
            productId: productId,
            name: product.name,
            price: Number(product.price) || 0,
            stock: product.stock ?? 999,
            description: product.description || '',
            image: product.image || null,
            quantity: Math.max(1, quantity)
          }
        ];
      }
    });
  };

  /**
   * Remove item entirely from cart
   * @param {string} productId
   */
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => getItemId(item) !== productId));
  };

  /**
   * Increase item quantity by 1
   * @param {string} productId
   */
  const increaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (getItemId(item) === productId) {
          const maxStock = item.stock ?? Infinity;
          if (item.quantity < maxStock) {
            return { ...item, quantity: item.quantity + 1 };
          }
        }
        return item;
      })
    );
  };

  /**
   * Decrease item quantity by 1 (removes if reaches 0)
   * @param {string} productId
   */
  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (getItemId(item) === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  /**
   * Explicitly set item quantity
   * @param {string} productId
   * @param {number} quantity
   */
  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (getItemId(item) === productId) {
          const maxStock = item.stock ?? Infinity;
          return { ...item, quantity: Math.min(qty, maxStock) };
        }
        return item;
      })
    );
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Total price calculation
   */
  const cartTotal = cart.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  /**
   * Total count of individual items
   */
  const totalItems = cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    cartTotal,
    totalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
