import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import wbStyles from "@i-vresse/wb-form/dist/index.css";
import formStyles from './Form.css';

// Moved out of Form.client.tsx as this should be run on server side
export const haddock3Styles = () => [
  { rel: "stylesheet", href: bootstrapStyles },
  { rel: "stylesheet", href: wbStyles },
  { rel: "stylesheet", href: formStyles },
];
