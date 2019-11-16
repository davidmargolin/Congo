import React from "react";

const CartPage = () => {
  return (
    <span
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 1500,
          padding: 24,
          justifyContent: "flex-start"
        }}
      >
        <h4>12 items in your cart:</h4>
      </div>
    </span>
  );
};

export default CartPage;
