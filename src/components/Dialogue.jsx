import React from 'react';
import Message from './Message';
import Options from './Options';
import styles from '../styles/Dialogue.module.css';

const Dialogue = ({
  message,
  currentIndex,
  onNext,
  onOptionClick,
  options,
  fork,
}) => {
  const hasNext = currentIndex < message.length - 1 || fork;
  const showOptions = currentIndex === message.length - 1 && options;

  return (
    <div className={styles.dialogueContainer}>
      <Message text={message[currentIndex]} />
      {hasNext && (
        <button onClick={onNext} className={styles.nextButton}>
          Дальше
        </button>
      )}
      {showOptions && (
        <Options options={options} onOptionClick={onOptionClick} />
      )}
    </div>
  );
};

export default Dialogue;
