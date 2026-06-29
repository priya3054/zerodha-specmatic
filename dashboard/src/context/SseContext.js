import { createContext, useEffect, useRef } from "react";

const SseContext = createContext(null);

export const SseProvider = ({ children }) => {
  const esRef = useRef(null);

  useEffect(() => {
    const es = new EventSource("/events", { withCredentials: true });
    esRef.current = es;
    return () => es.close();
  }, []);

  return (
    <SseContext.Provider value={esRef}>
      {children}
    </SseContext.Provider>
  );
};

export default SseContext;
