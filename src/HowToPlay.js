import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './HowToPlay.css';

function HowToPlay() {
  const navigate = useNavigate(); // Create a navigate function

  const handlePlayGame = () => {
    navigate('/'); // Navigate to the main game page
  };

  return (
    <div className="how-to-play">
      <h1>How to Play Treasure Hunt</h1>
      <ol>
        <li><strong>Teams & Turns:</strong> There are 4 teams (Team A, Team B, Team C, and Team D). Each team takes turns to guess the correct answer for the displayed image.</li>
        <li><strong>Answering:</strong> Type your answer in the provided input box and click the submit button.</li>
        <li><strong>Chances:</strong> Each team gets 3 chances to guess the answer. The number of remaining chances is displayed below the image.</li>
        <li><strong>Timer:</strong> Each team has 2 minutes to guess the answer. A progress bar shows how much time is left.</li>
        <li><strong>Clue:</strong> A clue is revealed automatically when the timer reaches 30 seconds.</li>
        <li><strong>Scoring:</strong> 
          <ul>
            <li>10 points are awarded for each correct answer.</li>
            <li>If a clue is revealed, only 7 points are awarded for the correct answer.</li>
          </ul>
        </li>
        <li><strong>Winning:</strong> The game continues until all images are answered. The team with the highest score wins.</li>
        <li><strong>Positions:</strong> From the second round onwards, team positions (1st, 2nd, 3rd, 4th) are displayed based on their scores.</li>
      </ol>
      {/* New Section */}
      <h2>Answer Rules:-</h2><br />
      <ol>
        <li><strong>Case Insensitivity:</strong> You can enter the answer in either lower or upper case. The answers are not case sensitive.</li>
        <li><strong>No Special Characters:</strong> Answers do not include any special characters or symbols. All answers should be plain text.</li>
        <li><strong>Answer Word Limit:</strong> Most answers consist of one or two words at maximum, but the majority of answers are single-word answers.</li>
      </ol>
      <div className="button-container">
        <button onClick={handlePlayGame} className="play-game-btn">Play the Game</button>
      </div>
    </div>
  );
}

export default HowToPlay;