import { useEffect, useState } from "react";

export interface HeaderScrollState {
  scrolledPastHero: boolean;
}

function useHeaderScrollState(): HeaderScrollState {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolledPastHero(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrolledPastHero };
}

export default useHeaderScrollState;
