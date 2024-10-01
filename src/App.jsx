import React, { useState, useEffect } from 'react';
import Dialogue from './components/Dialogue';
import DialogueEditor from './components/DialogueEditor';
import GameSelection from './components/GameSelection';
import styles from './styles/App.module.css';
import DialogueTree from './components/DialogueTree';

const App = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [dialogues, setDialogues] = useState(null);
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState('dialogue');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch('config/games.json')
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) =>
        console.error('Ошибка при загрузке списка игр:', error)
      );
  }, []);

  useEffect(() => {
    if (selectedGame) {
      fetch(`/${selectedGame.dialogueFile}`)
        .then((response) => response.json())
        .then((data) => {
          setDialogues(data);
          setCurrentDialogue(data);
          setCurrentIndex(0);
        })
        .catch((error) =>
          console.error('Ошибка при загрузке диалогов:', error)
        );
    }
  }, [selectedGame]);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  const handleCreateNewGame = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const newGame = {
            name: file.name,
            dialogueFile: file.name,
          };
          setGames([...games, newGame]);
          setSelectedGame(newGame);
          setDialogues(data);
          setCurrentDialogue(data);
          setCurrentIndex(0);
        } catch (err) {
          console.error('Ошибка при загрузке файла диалогов:', err);
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  const toggleView = () => {
    setView(view === 'dialogue' ? 'tree' : 'dialogue');
  };

  const toggleEditing = () => {
    setEditing(!editing);
  };

  const buildDialogueMap = (dialogue, map = {}) => {
    if (!dialogue) return map;
    if (dialogue.forkCode) {
      map[dialogue.forkCode] = dialogue;
    }
    if (dialogue.options) {
      dialogue.options.forEach((option) => {
        if (option.next) {
          buildDialogueMap(option.next, map);
        }
      });
    }
    return map;
  };

  const dialogueMap = React.useMemo(() => {
    if (dialogues) {
      return buildDialogueMap(dialogues);
    } else {
      return {};
    }
  }, [dialogues]);

  const handleFork = (forkCode, toLastMessage = false) => {
    const nextDialogue = dialogueMap[forkCode];
    if (nextDialogue) {
      setCurrentDialogue(nextDialogue);
      if (toLastMessage) {
        setCurrentIndex(nextDialogue.message.length - 1);
      } else {
        setCurrentIndex(0);
      }
    } else {
      console.error(`Диалог с forkCode ${forkCode} не найден.`);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentDialogue.message.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentDialogue.fork) {
      handleFork(currentDialogue.fork); 
    }
  };

  const handleOptionClick = (option) => {
    if (option.fork) {
      handleFork(option.fork, true);
    } else if (option.next) {
      setCurrentDialogue(option.next);
      setCurrentIndex(0);
    }
  };

  const handleSaveDialogues = (updatedDialogues) => {
    setDialogues(updatedDialogues);
    setCurrentDialogue(updatedDialogues);
    setCurrentIndex(0);

    const dataStr = JSON.stringify(updatedDialogues, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = selectedGame.dialogueFile || 'dialogues.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!selectedGame) {
    return (
      <GameSelection
        games={games}
        onSelectGame={handleSelectGame}
        onCreateNewGame={handleCreateNewGame}
      />
    );
  }

  if (!dialogues || !currentDialogue) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.appContainer}>
      <button onClick={toggleView} className={styles.toggleButton}>
        {view === 'dialogue'
          ? 'Показать дерево диалогов'
          : 'Вернуться к диалогу'}
      </button>
      <button onClick={toggleEditing} className={styles.toggleButton}>
        {editing ? 'Закончить редактирование' : 'Редактировать диалог'}
      </button>
      {editing ? (
        <DialogueEditor dialogues={dialogues} onSave={handleSaveDialogues} />
      ) : view === 'dialogue' ? (
        <Dialogue
          message={currentDialogue.message}
          currentIndex={currentIndex}
          onNext={handleNext}
          onOptionClick={handleOptionClick}
          options={currentDialogue.options}
          fork={currentDialogue.fork}
        />
      ) : (
        <DialogueTree dialogues={dialogues} />
      )}
    </div>
  );
};

export default App;
