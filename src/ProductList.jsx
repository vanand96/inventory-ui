import React from "react";
import URLSearchParams from "url-search-params";
import { Panel, Pagination, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import ProductFilter from "./ProductFilter.jsx";
import ProductTable from "./ProductTable.jsx";
import ProductView from "./ProductView.jsx";

import graphQLFetch from "./graphQLFetch.js";
import withToast from "./withToast.jsx";
import store from "./store.js";

const SECTION_SIZE = 5;

function PageLink({ params, page, activePage, children }) {
  params.set("page", page);
  if (page === 0) return React.cloneElement(children, { disabled: true });
  return (
    <LinkContainer
      isActive={() => page === activePage}
      to={{ search: `?${params.toString()}` }}
    >
      {children}
    </LinkContainer>
  );
}

class ProductList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get("category")) vars.category = params.get("category");

    const priceMin = parseInt(params.get("priceMin"), 10);
    if (!Number.isNaN(priceMin)) vars.priceMin = priceMin;
    const priceMax = parseInt(params.get("priceMax"), 10);
    if (!Number.isNaN(priceMax)) vars.priceMax = priceMax;

    const {
      params: { id },
    } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }

    let page = parseInt(params.get("page"), 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const query = `query productList(
      $category: ProductType
      $priceMin: Float
      $priceMax: Float
      $hasSelection: Boolean!
      $selectedId: Int!
      $page: Int
      ) {
        productList (
          category: $category 
          priceMin: $priceMin 
          priceMax: $priceMax
          page: $page
          ) {
            products {
          id name category price image
            }
            pages
        }
        product(id: $selectedId) @include (if : $hasSelection) {
          id name category price image
        }
      }`;

    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor() {
    super();
    const initialData = store.initialData || { prodctList: {} };
    const {
      productList: { products, pages },
      product: selectedProduct,
    } = initialData;

    delete store.initialData;
    this.state = {
      products,
      selectedProduct,
      pages,
    };
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  componentDidMount() {
    const { products } = this.state;
    if (products == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
      match: {
        params: { id: prevId },
      },
    } = prevProps;
    const {
      location: { search },
      match: {
        params: { id },
      },
    } = this.props;
    if (prevSearch !== search || prevId !== id) {
      this.loadData();
    }
  }

  async loadData() {
    const {
      location: { search },
      match,
      showError,
    } = this.props;
    const data = await ProductList.fetchData(match, search, showError);
    if (data) {
      this.setState({
        products: data.productList.products,
        selectedProduct: data.product,
        pages: data.productList.pages,
      });
    }
  }

  async deleteProduct(index) {
    const query = `mutation productDelete($id: Int!) {
      productDelete(id: $id)
    }`;
    const { products } = this.state;
    const {
      location: { pathname, search },
      history,
    } = this.props;
    const { showSuccess, showError } = this.props;
    const { id } = products[index];
    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.productDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.products];
        if (pathname === `/products/${id}`) {
          history.push({ pathname: "/products", search });
        }
        newList.splice(index, 1);
        return { products: newList };
      });
      const undoMessage = (
        <span>
          {`Deleted product ${id} successfully.`}
          <Button bsStyle="link" onClick={() => this.restoreProduct(id)}>
            UNDO
          </Button>
        </span>
      );
      showSuccess(undoMessage);
    } else {
      this.loadData();
    }
  }

  async restoreProduct(id) {
    const query = `mutation productRestore($id: Int!) {
      productRestore(id: $id)
    }`;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      showSuccess(`Product ${id} restored successfully.`);
      this.loadData();
    }
  }

  render() {
    const { products } = this.state;
    if (products == null) return null;

    const { selectedProduct, pages } = this.state;
    const {
      location: { search },
    } = this.props;

    const params = new URLSearchParams(search);
    let page = parseInt(params.get("page"), 10);
    if (Number.isNaN(page)) page = 1;
    const startPage = Math.floor((page - 1) / SECTION_SIZE) * SECTION_SIZE + 1;
    const endPage = startPage + SECTION_SIZE - 1;
    const prevSection = startPage === 1 ? 0 : startPage - SECTION_SIZE;
    const nextSection = endPage >= pages ? 0 : startPage + SECTION_SIZE;

    const items = [];
    for (let i = startPage; i <= Math.min(endPage, pages); i += 1) {
      params.set("page", i);
      items.push(
        <PageLink key={i} params={params} activePage={page} page={i}>
          <Pagination.Item>{i}</Pagination.Item>
        </PageLink>
      );
    }

    return (
      <React.Fragment>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filters</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ProductFilter urlBase="/products" />
          </Panel.Body>
        </Panel>
        <ProductTable products={products} deleteProduct={this.deleteProduct} />
        <ProductView product={selectedProduct} />
        <Pagination>
          <PageLink params={params} page={prevSection}>
            <Pagination.Item>{"<"}</Pagination.Item>
          </PageLink>
          {items}
          <PageLink params={params} page={nextSection}>
            <Pagination.Item>{">"}</Pagination.Item>
          </PageLink>
        </Pagination>
      </React.Fragment>
    );
  }
}

const ProductListWithToast = withToast(ProductList);
ProductListWithToast.fetchData = ProductList.fetchData;

export default ProductListWithToast;
