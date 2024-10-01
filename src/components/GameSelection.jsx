import React from 'react';

const GameSelection = ({ games, onSelectGame, onCreateNewGame }) => {
  return (
    <div>
      <h2>Выберите игру</h2>
      {games.map((game, index) => (
        <button key={index} onClick={() => onSelectGame(game)}>
          {game.name}
        </button>
      ))}
      <button onClick={onCreateNewGame}>Создать новую игру</button>
    </div>
  );
};

export default GameSelection;
