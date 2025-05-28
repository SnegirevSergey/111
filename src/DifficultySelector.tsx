import React from 'react';
import { GameDifficulty } from './type.tsx';

interface DifficultySelectorProps {
  onSelect: (difficulty: GameDifficulty) => void;
  currentDifficulty: GameDifficulty;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  onSelect, 
  currentDifficulty 
}) => {
  const difficulties: GameDifficulty[] = ['easy', 'medium', 'hard'];
  const difficultyNames = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  };
  const difficultyDescriptions = {
    easy: 'Компьютер стреляет случайно',
    medium: 'Компьютер запоминает попадания',
    hard: 'Компьютер определяет направление кораблей'
  };

  return (
    <div className="difficulty-selector">
      {difficulties.map(difficulty => (
        <div 
          key={difficulty}
          className={`difficulty-option ${currentDifficulty === difficulty ? 'active' : ''}`}
          onClick={() => onSelect(difficulty)}
        >
          <h3>{difficultyNames[difficulty]}</h3>
          <p>{difficultyDescriptions[difficulty]}</p>
        </div>
      ))}
    </div>
  );
};

export default DifficultySelector;