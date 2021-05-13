import React from "react";

export default function ProductView({ product }) {
  if (product) {
    return (
      <div>
        <h3>Product View</h3>
        <pre>{product.name}</pre>
        <img src={product.image} width="500" height="600" align="center"></img>
      </div>
    );
  }
  return null;
}
