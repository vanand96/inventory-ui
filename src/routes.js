import ProductList from "./ProductList.jsx";
import ProductReport from "./ProductReport.jsx";
import ProductEdit from "./ProductEdit.jsx";
import About from "./About.jsx";
import NotFound from "./NotFound.jsx";
const routes = [
  { path: "/products/:id?", component: ProductList },
  { path: "/edit/:id", component: ProductEdit },
  { path: "/report", component: ProductReport },
  { path: "/about", component: About },
  { path: "*", component: NotFound },
];
export default routes;
