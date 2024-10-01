import React from 'react';
import styles from '../styles/OptionButton.module.css';

const OptionButton = ({ option, onOptionClick }) => {
  return (
    <button
      className={styles.optionButton}
      onClick={() => onOptionClick(option)}
    >
      {option.text}
    </button>
  );
};

export default OptionButton;
