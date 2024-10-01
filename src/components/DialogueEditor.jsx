import React, { useState, useEffect } from 'react';
import styles from '../styles/DialogueEditor.module.css';

const DialogueEditor = ({ dialogues, onSave }) => {
  const [localDialogues, setLocalDialogues] = useState(dialogues || {});

  useEffect(() => {
    setLocalDialogues(dialogues || {});
  }, [dialogues]);

  const getMaxForkCode = (dialogue, max = 0) => {
    if (dialogue.forkCode && dialogue.forkCode > max) {
      max = dialogue.forkCode;
    }
    if (dialogue.fork && dialogue.fork > max) {
      max = dialogue.fork;
    }
    if (dialogue.options) {
      dialogue.options.forEach((option) => {
        if (option.next) {
          max = getMaxForkCode(option.next, max);
        }
        if (option.fork && option.fork > max) {
          max = option.fork;
        }
      });
    }
    return max;
  };

  const [maxForkCode, setMaxForkCode] = useState(0);

  useEffect(() => {
    const maxCode = getMaxForkCode(localDialogues);
    setMaxForkCode(maxCode);
  }, [localDialogues]);

  const generateForkCode = () => {
    setMaxForkCode((prevMax) => prevMax + 1);
    return maxForkCode + 1;
  };

  const handleChange = (path, value) => {
    const newDialogues = { ...localDialogues };
    let current = newDialogues;
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setLocalDialogues(newDialogues);
  };

  const handleDeleteOption = (path, index) => {
    const options = getValueByPath([...path, 'options']) || [];
    options.splice(index, 1);
    handleChange([...path, 'options'], options);
  };

  const handleAddOption = (path) => {
    const newOption = {
      text: 'Новая опция',
      next: {
        message: ['Новый диалог'],
        forkCode: generateForkCode(),
        options: [],
      },
    };
    handleChange(
      [...path, 'options'],
      [...(getValueByPath([...path, 'options']) || []), newOption]
    );
  };

  const getValueByPath = (path) => {
    let current = localDialogues;
    for (let i = 0; i < path.length; i++) {
      if (current[path[i]] !== undefined) {
        current = current[path[i]];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleCollapse = (path) => {
    const key = path.join('-');
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderEditor = (dialogue, path = []) => {
    if (!dialogue) return null;

    const isCollapsed = collapsedSections[path.join('-')];

    return (
      <div className={`${styles.dialogueContainer} ${styles.card}`}>
        <div className={styles.sectionHeader}>
          <button
            className={styles.collapseButton}
            onClick={() => toggleCollapse(path)}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
          Диалог {dialogue.forkCode ? `(Код: ${dialogue.forkCode})` : ''}
        </div>
        {!isCollapsed && (
          <>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Сообщение:</label>
              <textarea
                className={styles.textarea}
                value={
                  Array.isArray(dialogue.message)
                    ? dialogue.message.join('\n')
                    : ''
                }
                onChange={(e) =>
                  handleChange([...path, 'message'], e.target.value.split('\n'))
                }
              />
            </div>
            {dialogue.forkCode && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Код диалога: {dialogue.forkCode}
                </label>
              </div>
            )}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Переход к диалогу после этого сообщения:
              </label>
              <input
                className={styles.input}
                type="number"
                value={dialogue.fork || ''}
                onChange={(e) =>
                  handleChange(
                    [...path, 'fork'],
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
            </div>
            {dialogue.options && (
              <div className={styles.fieldGroup}>
                <h4 className={styles.subSectionHeader}>Опции:</h4>
                {dialogue.options.map((option, index) => {
                  const optionPath = [...path, 'options', index];
                  const optionIsCollapsed =
                    collapsedSections[optionPath.join('-')];

                  return (
                    <div
                      key={index}
                      className={`${styles.optionContainer} ${styles.card}`}
                    >
                      <div className={styles.optionHeader}>
                        <button
                          className={styles.collapseButton}
                          onClick={() => toggleCollapse(optionPath)}
                        >
                          {optionIsCollapsed ? '▼' : '▲'}
                        </button>
                        Опция {index + 1}
                        <button
                          className={`${styles.deleteButton} ${styles.smallButton}`}
                          onClick={() => handleDeleteOption(path, index)}
                        >
                          &#x1F5D1;
                        </button>
                      </div>
                      {!optionIsCollapsed && (
                        <>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Текст опции:</label>
                            <input
                              className={styles.input}
                              type="text"
                              value={option.text || ''}
                              onChange={(e) =>
                                handleChange(
                                  [...path, 'options', index, 'text'],
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                              Действие при выборе опции:
                            </label>
                            <select
                              className={styles.input}
                              value={'fork' in option ? 'jump' : 'continue'}
                              onChange={(e) => {
                                const newType = e.target.value;
                                if (newType === 'jump') {
                                  handleChange([...path, 'options', index], {
                                    ...option,
                                    next: undefined,
                                    fork: option.fork ?? '',
                                  });
                                } else if (newType === 'continue') {
                                  const newForkCode =
                                    option.next?.forkCode || generateForkCode();
                                  handleChange([...path, 'options', index], {
                                    ...option,
                                    fork: undefined,
                                    next: option.next || {
                                      message: ['Новый диалог'],
                                      forkCode: newForkCode,
                                      options: [],
                                    },
                                  });
                                }
                              }}
                            >
                              <option value="continue">
                                Продолжить диалог
                              </option>
                              <option value="jump">Переход к диалогу</option>
                            </select>
                          </div>
                          {'fork' in option && (
                            <div className={styles.fieldGroup}>
                              <label className={styles.label}>
                                Переход к диалогу при выборе этой опции:
                              </label>
                              <input
                                className={styles.input}
                                type="number"
                                value={option.fork || ''}
                                onChange={(e) =>
                                  handleChange(
                                    [...path, 'options', index, 'fork'],
                                    e.target.value
                                      ? parseInt(e.target.value, 10)
                                      : undefined
                                  )
                                }
                              />
                            </div>
                          )}
                          {'next' in option && option.next && (
                            <div className={styles.fieldGroup}>
                              {renderEditor(option.next, [
                                ...path,
                                'options',
                                index,
                                'next',
                              ])}
                            </div>
                          )}
                          {!option.next && !('fork' in option) && (
                            <button
                              className={`${styles.button} ${styles.smallButton}`}
                              onClick={() => {
                                const newForkCode = generateForkCode();
                                handleChange(
                                  [...path, 'options', index, 'next'],
                                  {
                                    message: ['Новый диалог'],
                                    forkCode: newForkCode,
                                    options: [],
                                  }
                                );
                              }}
                            >
                              Добавить следующий диалог
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                <button
                  className={styles.button}
                  onClick={() => handleAddOption(path)}
                >
                  &#x271A; Добавить опцию
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!localDialogues) {
    return <div>Загрузка редактора...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <h3 className={styles.editorHeader}>Редактор диалогов</h3>
      {renderEditor(localDialogues)}
      <button className={styles.button} onClick={() => onSave(localDialogues)}>
        Сохранить
      </button>
    </div>
  );
};

export default DialogueEditor;
