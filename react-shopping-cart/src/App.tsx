import React, { useState } from "react";
import { useQuery } from "react-query";
//Components
import Drawer from "@material-ui/core/Drawer";
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import Badge from "@material-ui/core/Badge";
import Item from "./Item/Item";
import Cart from "./Cart/Cart";
//styles
import { Wrapper, StyledButton } from "./App.styles";
//types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: string;
  title: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch("https://fakestoreapi.com/products")).json();
//.json is async so the first await is for it

const App = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);

  const { data, isLoading, error } = useQuery<CartItemType[]>(
    "products",
    getProducts
  );
  console.log(data);

  const getTotalItems = (items: CartItemType[]) =>
    items.reduce((counter: number, item) => counter + item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems((previousState) => {
      //1. is the item already added in the cart?
      const isItemInCart = previousState.find(
        (item) => item.id === clickedItem.id
      );

      if (isItemInCart) {
        return previousState.map((item) =>
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }
      //2. First time the item is added
      return [...previousState, { ...clickedItem, amount: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems((prev) =>
      prev.reduce((acumulator, item) => {
        if (item.id === id) {
          if (item.amount === 1) return acumulator;
          return [...acumulator, { ...item, amount: item.amount - 1 }];
        } else {
          return [...acumulator, item];
        }
      }, [] as CartItemType[])
    );
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <div>Something went wrong....</div>;

  return (
    <Wrapper>
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Cart
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
        ></Cart>
      </Drawer>
      <StyledButton onClick={() => setCartOpen(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color="error">
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {/* mark this grid as a container */}
        {data?.map((item) => (
          <Grid item key={item.id} xs={12} sm={4}>
            {/* mark this grid as an item */}
            <Item item={item} handleAddToCart={handleAddToCart}></Item>
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
};

export default App;
