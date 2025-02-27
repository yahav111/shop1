import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  function addToCart(product) {
    // scanario 1: product already in cart
    const index = cart.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      const newCart = [...cart];
      newCart[index].quantity += 1;

      return setCart(newCart);
    }
    // scanario 2: product not in cart
    setCart([...cart, { quantity: 1, ...product }]);
  }

  useEffect(() => {
    console.log(cart);
  }, [cart]);

  const DeleteCart = (product) => {
    const copyCart = [...cart];
    const NewCart = copyCart.filter((item) => item.id !== product.id);
    return setCart(NewCart);
  };

  // const clickPlus = (product) => {
  //   const copyCart = [...cart];
  //   const index = cart.findIndex((item) => item.id === product.id);
  //   const newCart = (copyCart[index].quantity += 1);
  //   return setCart(newCart);
  // };

  const clickPlus = (product) => {
    const copyCart = [...cart];
    const index = copyCart.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      copyCart[index].quantity += 1;
      // console.log(copyCart);
      setCart(copyCart);
    }
  };

  const clickMinus = (product) => {
    const copyCart = [...cart];
    const index = copyCart.findIndex((item) => item.id === product.id);
    if (index !== -1 && copyCart[index].quantity > 1) {
      copyCart[index].quantity -= 1;
      setCart(copyCart);
    }
  };

  const ClearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    const newCart = [...cart];
    const total = newCart.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    setTotalPrice(total);
  }, [cart]);

  const value = {
    showCart,
    setShowCart,
    cart,
    addToCart,
    DeleteCart,
    clickPlus,
    clickMinus,
    ClearCart,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
