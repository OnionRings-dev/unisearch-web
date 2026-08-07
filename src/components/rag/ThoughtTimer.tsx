import { useState, useEffect } from "react";

export const ThoughtTimer = () => {
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span className="text-sm opacity-80">{timer}s</span>;
};
