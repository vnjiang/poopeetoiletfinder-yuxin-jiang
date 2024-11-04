import { useState, useEffect } from 'react';

//create and export a hook to load external script
export default function useScript(src) {
  const [state, setState] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
      // check if the script is already exist in file
      if (document.querySelector(`script[src="${src}"]`)) {
        setState({ loaded: true, error: false });//if yes, set the state to loaded and no error
      } else {

        //if no, create a new script element
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
      
         // and deal the success loading and failure 
        script.onload = () => setState({ loaded: true, error: false });
        script.onerror = () => setState({ loaded: true, error: true });
      
        // append the script to the body of the document
        document.body.appendChild(script);
      }

  }, [src]);

   // return the loaded and error state values
  return [state.loaded, state.error];
}




