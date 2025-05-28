import React from 'react';
import { PlayerScore } from './type.tsx';

interface LeaderboardProps {
  scores: PlayerScore[];
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onBack }) => {
  return (
    <div className="leaderboard">
      <h2>Таблица рейтинга</h2>
      <table>
        <thead>
          <tr>
            <th>Игрок</th>
            <th>Победы</th>
            <th>Поражения</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id}>
              <td>{score.name}</td>
              <td>{score.wins}</td>
              <td>{score.losses}</td>
              <td>{score.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="back-button" onClick={onBack}>
        Назад
      </button>
    </div>
  );
};

export default Leaderboard;