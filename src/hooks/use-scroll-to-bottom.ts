import { useState, useEffect } from 'react';

const useScrollToBottom = (threshold = 200) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      console.log({ distanceFromBottom });
      setShowScrollButton(distanceFromBottom > threshold);
    };

    checkScrollPosition();

    window.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [threshold]);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return { showScrollButton, scrollToBottom };
};

export default useScrollToBottom;