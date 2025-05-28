import React from 'react';

type RulesPageProps = {
  onBack: () => void;
};

const RulesPage: React.FC<RulesPageProps> = ({ onBack }) => {
  return (
    <div className="rules-page">
      <h2>Правила игры "Морской бой"</h2>
      <ol>
        <li>Игра ведется на двух квадратных полях 10×10.</li>
        <li>Каждый игрок размещает свои корабли на своем поле.</li>
        <li>Корабли не могут соприкасаться друг с другом.</li>
        <li>Игроки по очереди стреляют по координатам на поле противника.</li>
        <li>Побеждает тот, кто первым потопит все корабли противника.</li>
      </ol>
      <button className="back-button" onClick={onBack}>
        Назад к игре
      </button>
    </div>
  );
};

export default RulesPage;