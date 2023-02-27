import wbStyles from "@i-vresse/wb-form/dist/index.css";
import toastStyles from 'react-toastify/dist/ReactToastify.css'
import formStyles from './Form.css';

// Moved out of Form.client.tsx as this should be run on server side
export const haddock3Styles = () => [
  { rel: "stylesheet", href: wbStyles },
  { rel: "stylesheet", href: formStyles },
  { rel: "stylesheet", href: toastStyles}
];
