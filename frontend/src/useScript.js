import { useState, useEffect } from 'react';

function useScript(src) {
  const [state, setState] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    // 检查脚本是否已经存在
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      setState({ loaded: true, error: false });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => setState({ loaded: true, error: false });
    script.onerror = () => setState({ loaded: true, error: true });

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [src]);

  return [state.loaded, state.error];
}

export default useScript;





