import React from 'react';
import OptionButton from './OptionButton';
import styles from '../styles/Options.module.css';

const Options = ({ options, onOptionClick }) => {
  return (
    <div className={styles.optionsContainer}>
      {options.map((option, index) => (
        <OptionButton
          key={index}
          option={option}
          onOptionClick={onOptionClick}
        />
      ))}
    </div>
  );
};

export default Options;
