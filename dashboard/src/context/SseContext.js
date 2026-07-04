import { createContext, useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

const SseContext = createContext(null);

export const SseProvider = ({ children }) => {
  const [source, setSource] = useState(null);

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/events`, { withCredentials: true });
    setSource(es);
    return () => es.close();
  }, []);

  return (
    <SseContext.Provider value={source}>
      {children}
    </SseContext.Provider>
  );
};

export default SseContext;
