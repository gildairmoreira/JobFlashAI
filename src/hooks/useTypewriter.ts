import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseBeforeDelete?: number;
  loop?: boolean | number;
}

interface UseTypewriterReturn {
  displayText: string;
  cursorVisible: boolean;
  isDeleting: boolean;
  isDone: boolean;
}

export const useTypewriter = ({
  words,
  typeSpeed = 70,
  deleteSpeed = 50,
  pauseBeforeDelete = 2000,
  loop = true
}: UseTypewriterOptions): UseTypewriterReturn => {
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cursor blinking effect
  useEffect(() => {
    const blinkCursor = () => {
      setCursorVisible(prev => !prev);
      cursorTimeoutRef.current = setTimeout(blinkCursor, 530);
    };
    
    cursorTimeoutRef.current = setTimeout(blinkCursor, 530);
    
    return () => {
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, []);

  // Main typing effect
  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];
    
    const typeNextChar = () => {
      if (isWaiting) return;
      
      if (!isDeleting) {
        // Typing phase
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          timeoutRef.current = setTimeout(typeNextChar, typeSpeed);
        } else {
          // Word complete, wait before deleting
          setIsWaiting(true);
          timeoutRef.current = setTimeout(() => {
            setIsWaiting(false);
            setIsDeleting(true);
            typeNextChar();
          }, pauseBeforeDelete);
        }
      } else {
        // Deleting phase
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
          timeoutRef.current = setTimeout(typeNextChar, deleteSpeed);
        } else {
          // Word deleted, move to next word
          setIsDeleting(false);
          const nextIndex = (currentWordIndex + 1) % words.length;
          
          // Handle loop logic
          if (nextIndex === 0) {
            if (typeof loop === 'number') {
              const nextLoopCount = loopCount + 1;
              if (nextLoopCount >= loop) {
                setIsDone(true);
                return;
              }
              setLoopCount(nextLoopCount);
            } else if (loop === false) {
              setIsDone(true);
              return;
            }
          }
          
          setCurrentWordIndex(nextIndex);
          timeoutRef.current = setTimeout(typeNextChar, typeSpeed);
        }
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, typeSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [words, currentWordIndex, displayText, isDeleting, isWaiting, typeSpeed, deleteSpeed, pauseBeforeDelete, loop, loopCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, []);

  return { displayText, cursorVisible, isDeleting, isDone };
};