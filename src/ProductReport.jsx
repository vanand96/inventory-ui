import React from "react";
import { Panel, Table } from "react-bootstrap";

import ProductFilter from "./ProductFilter.jsx";
import withToast from "./withToast.jsx";
import graphQLFetch from "./graphQLFetch.js";
import store from "./store.js";

const categories = ["Shirts", "Jeans", "Jackets", "Sweaters", "Accessories"];

class ProductReport extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = {};
    if (params.get("category")) vars.category = params.get("category");

    const priceMin = parseInt(params.get("priceMin"), 1);
    if (!Number.isNaN(priceMin)) vars.priceMin = priceMin;
    const priceMax = parseInt(params.get("priceMax"), 100);
    if (!Number.isNaN(priceMax)) vars.priceMax = priceMax;

    const query = `query productList(
      $category: ProductType
      $priceMin: Float
      $priceMax: Float
    ) {
      productCounts(
        category: $category
        priceMin: $priceMin
        priceMax: $priceMax
      ) {
        name category price image
      }
    }`;
    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor(props) {
    super(props);
    const stats = store.initialData ? store.initialData.productCounts : null;
    delete store.initialData;
    this.state = { stats };
  }

  componentDidMount() {
    const { stats } = this.state;
    if (stats == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search },
    } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  async loadData() {
    const {
      location: { search },
      match,
      showError,
    } = this.props;
    const data = await ProductReport.fetchData(match, search, showError);
    if (data) {
      this.setState({ stats: data.productCounts });
    }
  }

  render() {
    const { stats } = this.state;
    if (stats == null) return null;

    const headerColumns = categories.map((category) => (
      <th key={category}>{category}</th>
    ));

    const statRows = stats.map((counts) => (
      <tr key={counts.name}>
        <td>{counts.name}</td>
        {categories.map((category) => (
          <td key={category}>{counts[category]}</td>
        ))}
      </tr>
    ));

    return (
      <>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter urlBase="/report" />
          </Panel.Body>
        </Panel>
        <Table bordered condensed hover responsive>
          <thead>
            <tr>
              <th />
              {headerColumns}
            </tr>
          </thead>
          <tbody>{statRows}</tbody>
        </Table>
      </>
    );
  }
}

const ProductReportWithToast = withToast(ProductReport);
ProductReportWithToast.fetchData = ProductReport.fetchData;

export default ProductReportWithToast;
