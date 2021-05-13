import React from "react";
import { withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import {
  Button,
  Glyphicon,
  Tooltip,
  OverlayTrigger,
  Table,
} from "react-bootstrap";

import UserContext from "./UserContext.js";

// eslint-disable-next-line react/prefer-stateless-function
class ProductRowPlain extends React.Component {
  render() {
    const {
      product,
      location: { search },
      deleteProduct,
      index,
    } = this.props;
    const user = this.context;
    const disabled = !user.signedIn;

    const selectLocation = { pathname: `/products/${product.id}`, search };

    const editTooltip = (
      <Tooltip id="close-tooltip" placement="top">
        Edit Product
      </Tooltip>
    );

    const deleteTooltip = (
      <Tooltip id="delete-tooltip" placement="top">
        Delete Product
      </Tooltip>
    );

    function onDelete(e) {
      e.preventDefault();
      deleteProduct(index);
    }

    const tableRow = (
      <tr>
        <td>{product.id}</td>
        <td>{product.category}</td>
        <td>{product.name}</td>
        <td>{product.price}</td>
        <td>
          {/* <Link to={`/view/${product.id}`}>View</Link>
          {" | "} */}
          <LinkContainer to={`/edit/${product.id}`}>
            <OverlayTrigger delayShow={1000} overlay={editTooltip}>
              <Button bsSize="xsmall">
                <Glyphicon glyph="edit" />
              </Button>
            </OverlayTrigger>
          </LinkContainer>{" "}
          <OverlayTrigger delayShow={1000} overlay={deleteTooltip}>
            <Button bsSize="xsmall" onClick={onDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );

    return <LinkContainer to={selectLocation}>{tableRow}</LinkContainer>;
  }
}

ProductRowPlain.contextType = UserContext;
const ProductRow = withRouter(ProductRowPlain);
delete ProductRow.contextType;

export default function ProductTable({ products, deleteProduct }) {
  const productRows = products.map((product, index) => (
    <ProductRow
      key={product.id}
      product={product}
      deleteProduct={deleteProduct}
      index={index}
    />
  ));

  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Category</th>
          <th>Name</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>{productRows}</tbody>
    </Table>
  );
}
