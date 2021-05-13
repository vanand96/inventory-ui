import React from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import {
  Col,
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ButtonToolbar,
  Button,
  Alert,
} from "react-bootstrap";
import graphQLFetch from "./graphQLFetch.js";
import NumInput from "./NumInput.jsx";
import TextInput from "./TextInput.jsx";
import withToast from "./withToast.jsx";
import store from "./store.js";
import UserContext from "./UserContext.js";

class ProductEdit extends React.Component {
  static async fetchData(match, search, showError) {
    const query = `query product($id: Int!) {
      product(id: $id) {
        id category name price image
      }
    }`;

    const {
      params: { id },
    } = match;
    const result = await graphQLFetch(query, { id }, showError);
    return result;
  }

  constructor() {
    super();
    const product = store.initialData ? store.initialData.product : null;
    delete store.initialData;
    this.state = {
      product,
      invalidFields: {},
      showingValidation: false,
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
  }

  componentDidMount() {
    const { product } = this.state;
    if (product == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id: prevId },
      },
    } = prevProps;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }

  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState((prevState) => ({
      product: { ...prevState.product, [name]: value },
    }));
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { product, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    const query = `mutation productUpdate(
      $id: Int!, 
      $changes: ProductUpdateInputs!
      ) {
      productUpdate(
        id:$id, 
        changes:$changes
        ) {
        id name category price
      }
    }`;

    const { id, name, ...changes } = product;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { changes, id }, showError);
    if (data) {
      this.setState({ product: data.productUpdate });
      showSuccess("Updated product successfully"); // eslint-disable-line no-alert
    }
  }

  async loadData() {
    const { match, showError } = this.props;
    const data = await ProductEdit.fetchData(match, null, showError);
    this.setState({ product: data ? data.product : {}, invalidFields: {} });
  }

  showValidation() {
    this.setState({ showingValidation: true });
  }
  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  render() {
    const { product } = this.state;
    if (product == null) return null;
    const {
      product: { id },
    } = this.state;
    const {
      match: {
        params: { id: propsId },
      },
    } = this.props;

    if (id == null) {
      if (propsId != null) {
        return <h3>{`Product with ID ${propsId} not found.`}</h3>;
      }
      return null;
    }

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    const {
      product: { name, category },
    } = this.state;
    const {
      product: { price, image },
    } = this.state;

    const user = this.context;
    return (
      <Panel>
                
        <Panel.Heading>
          <Panel.Title>{`Editing product: ${id}`}</Panel.Title>        
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>
                Category
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="category"
                  value={category}
                  onChange={this.onChange}
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Sweaters">Sweaters</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Accessories">Accessories</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup validationState={invalidFields.name ? "error" : null}>
              <Col componentClass={ControlLabel} sm={3}>
                Name
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="name"
                  value={name}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>
                Price
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  name="price"
                  value={price}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>
                Image
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="image"
                  value={image}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                <ButtonToolbar>
                  <Button
                    disabled={!user.signedIn}
                    bsStyle="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                  <LinkContainer to="/products">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                </ButtonToolbar>
              </Col>
            </FormGroup>
                        
            <FormGroup>
              <Col smOffset={3} sm={9}>
                {validationMessage}
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {" | "}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </Panel.Footer>
      </Panel>
    );
  }
}

ProductEdit.contextType = UserContext;
const ProductEditWithToast = withToast(ProductEdit);
ProductEditWithToast.fetchData = ProductEdit.fetchData;
export default ProductEditWithToast;
