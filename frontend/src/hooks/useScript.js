import { useState, useEffect } from 'react';

export default function useScript(src) {
  const [state, setState] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
      if (document.querySelector(`script[src="${src}"]`)) {
        setState({ loaded: true, error: false });
      } else {


        const script = document.createElement('script');
        script.src = src;
        script.async = true;
      

        script.onload = () => setState({ loaded: true, error: false });
        script.onerror = () => setState({ loaded: true, error: true });
      

        document.body.appendChild(script);
      }

  }, [src]);


  return [state.loaded, state.error];
}




