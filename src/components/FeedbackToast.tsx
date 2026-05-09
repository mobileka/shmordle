import { useEffect, useState } from 'react';

import styles from './FeedbackToast.module.css';

interface Props {
  message: string;
  show: boolean;
}

export function FeedbackToast({ message, show }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible && !show) return null;

  return (
    <div className={`${styles.toast} ${show ? styles.enter : styles.exit}`}>
      {message}
    </div>
  );
}
