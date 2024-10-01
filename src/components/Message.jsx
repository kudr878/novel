import React from 'react';
import styles from '../styles/Message.module.css';

const Message = ({ text }) => {
  return <p className={styles.messageText}>{text}</p>;
};

export default Message;
