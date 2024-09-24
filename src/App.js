import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const initialTeams = [
  { name: 'Team A', members: ['Alice', 'Bob', 'Charlie', 'Diana'], score: 0 },
  { name: 'Team B', members: ['Eve', 'Frank', 'Grace', 'Heidi'], score: 0 },
  { name: 'Team C', members: ['Ivy', 'Jack', 'Karl', 'Liam'], score: 0 },
  { name: 'Team D', members: ['Mona', 'Nina', 'Oscar', 'Paul'], score: 0 },
];

const App = () => {
  const loadState = (key, fallback) => {
    const savedState = localStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : fallback;
  };

  const [teams, setTeams] = useState(loadState('teams', initialTeams));
  const [currentTeamIndex, setCurrentTeamIndex] = useState(loadState('currentTeamIndex', 0));
  const [chancesLeft, setChancesLeft] = useState(loadState('chancesLeft', 3));
  const [currentImageIndex, setCurrentImageIndex] = useState(loadState('currentImageIndex', 0));
  const [scores, setScores] = useState(loadState('scores', [0, 0, 0, 0]));
  const [showCongrats, setShowCongrats] = useState(false);
  const [timeLeft, setTimeLeft] = useState(loadState('timeLeft', 120));
  const [progress, setProgress] = useState(100);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);
  const [showClue, setShowClue] = useState(false);
  const [lastCorrectTeamIndex, setLastCorrectTeamIndex] = useState(null);
  const [currentRound, setCurrentRound] = useState(loadState('currentRound', 1));
  const [gameOver, setGameOver] = useState(loadState('gameOver', false));
  const [answeredImages, setAnsweredImages] = useState(loadState('answeredImages', []));
  const [isExtraTurn, setIsExtraTurn] = useState(loadState('isExtraTurn', false));

  const images = [
    { src: '/th_images/image1t.jpg', answer: 'antivirus', clue: 'Its the superhero that keeps your digital world safe from bad guys.' },
    { src: '/th_images/image2t.jpg', answer: 'bluetooth', clue: 'This is Wireless connection Technology to transfer the files.' },
    { src: '/th_images/image3t.jpg', answer: 'robot', clue: 'Its like a game where you can design, customize, and command your very own.' },
    { src: '/th_images/image222t.jpg', answer: 'pc', clue: 'Without this we cant play this game' },
  ];

  const resetGame = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the game?");
    if (confirmReset) {
      setTeams(initialTeams);
      setScores([0, 0, 0, 0]);
      setCurrentTeamIndex(0);
      setChancesLeft(3);
      setCurrentImageIndex(0);
      setTimeLeft(120);
      setShowClue(false);
      setLastCorrectTeamIndex(null);
      setCurrentRound(1);
      setAnsweredImages([]);
      setGameOver(false);
      setIsExtraTurn(false);
      localStorage.clear();
    }
  };

  const howToPlay = () => {
    window.open('/how-to-play', '_blank');
  };

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('currentTeamIndex', JSON.stringify(currentTeamIndex));
    localStorage.setItem('chancesLeft', JSON.stringify(chancesLeft));
    localStorage.setItem('currentImageIndex', JSON.stringify(currentImageIndex));
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
    localStorage.setItem('currentRound', JSON.stringify(currentRound));
    localStorage.setItem('answeredImages', JSON.stringify(answeredImages));
    localStorage.setItem('isExtraTurn', JSON.stringify(isExtraTurn));
  }, [teams, currentTeamIndex, chancesLeft, currentImageIndex, scores, timeLeft, currentRound, answeredImages, isExtraTurn]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) {
            if (prevTime === 30) {
              setShowClue(true);
            }
            return prevTime - 1;
          } else {
            moveToNextTeam();
            return 120;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentTeamIndex]);

  useEffect(() => {
    setProgress((timeLeft / 120) * 100);
  }, [timeLeft]);

  const moveToNextTeam = () => {
    setChancesLeft(3);
    setTimeLeft(120);
    setShowClue(false);
    
    // Always move to the next team, regardless of extra turn status
    const nextTeamIndex = (currentTeamIndex + 1) % initialTeams.length;
    setCurrentTeamIndex(nextTeamIndex);
    
    // Reset the extra turn flag
    setIsExtraTurn(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userAnswer = event.target.answer.value;
  
    if (userAnswer.toLowerCase() === images[currentImageIndex].answer.toLowerCase()) 
    {
      const newScores = [...scores];
      newScores[currentTeamIndex] += timeLeft > 30 ? 10 : 7;
      setScores(newScores);
  
      const updatedAnsweredImages = [...answeredImages, currentImageIndex];
      setAnsweredImages(updatedAnsweredImages);
  
      if (updatedAnsweredImages.length === images.length) {
        setGameOver(true);
        return;
      }
  
      const nextIndex = getNextImageIndex(updatedAnsweredImages);
      setCurrentImageIndex(nextIndex);
      
      setLastCorrectTeamIndex(currentTeamIndex);
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000);
  
      if (!isExtraTurn) {
        // If it's not already an extra turn, give an extra turn
        setIsExtraTurn(true);
        setTimeLeft(120);
        setChancesLeft(3);
        setShowClue(false);
      } else {
        // If it was an extra turn, move to the next team
        moveToNextTeam();
      }
    } else if (chancesLeft > 1) {
      setChancesLeft(chancesLeft - 1);
    } else {
      // If the team fails, move to the next team
      moveToNextTeam();
    }
  
    event.target.reset();
  };
  
  const getNextImageIndex = (answeredImages) => {
    let nextIndex = currentImageIndex;
    while (answeredImages.includes(nextIndex)) {
      nextIndex = (nextIndex + 1) % images.length;
    }
    return nextIndex;
  };

  const sortedTeams = [...teams].map((team, index) => ({ ...team, score: scores[index] }))
    .sort((a, b) => b.score - a.score);

  const getPositionText = (index) => {
    switch (index) {
      case 0: return '1st';
      case 1: return '2nd';
      case 2: return '3rd';
      case 3: return '4th';
      default: return '';
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="app">
      <h1 className="title">Intake Team Treasure Hunt Game</h1>
  
      {showCongrats && lastCorrectTeamIndex !== null && teams[lastCorrectTeamIndex] && (
        <div className="congrats">
          <p>Congratulations {teams[lastCorrectTeamIndex].name}!</p>
        </div>
      )}
  
      <div className="teams-container">
        {sortedTeams.map((team, index) => (
          <div className={`team-box ${index < 2 ? 'top' : 'bottom'}-${index % 2 === 0 ? 'left' : 'right'}`} key={team.name}>
            <p className="team-name">{team.name} - {getPositionText(index)}</p>
            <ul>
              {team.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
            <p className="score">Score: {team.score}</p>
          </div>
        ))}
      </div>
  
      {gameOver ? (
        <div className="game-over">
          <p>Game Over! All images have been answered.</p>
        </div>
      ) : (
        <>
          <div className="current-team">
            <p className="current-team-p">Current Team: {initialTeams[currentTeamIndex].name}</p>
            {isExtraTurn && <p className="extra-turn-indicator">Extra Turn!</p>}
          </div>

          <div className="center-content">
            <div className="timer-progress">
              <div className={`timer-bar ${timeLeft <= 30 ? 'warning' : ''}`} style={{ width: `${progress}%` }}>
                <span className="timer-text">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
              </div>
            </div>

            {images[currentImageIndex] && (
              <img src={images[currentImageIndex].src} alt="Current" className="center-image" />
            )}

            <form onSubmit={handleSubmit}>
              <input type="text" name="answer" placeholder="Enter your answer" className="answer-box" autoFocus onFocus={(e) => e.target.select()} required autoComplete="off" />
              &nbsp;&nbsp;<button type="submit" className="submit-btn">Submit</button>
            </form>

            {showClue && <p className="clue-text">Clue: {images[currentImageIndex].clue}</p>}

            <div className="play-pause-chances-row">
              <div className="chances-progress">
                <div className={`chances-bar ${chancesLeft === 3 ? 'green' : chancesLeft === 2 ? 'yellow' : 'red'}`}
                  style={{ width: `${(chancesLeft / 3) * 100}%` }}>
                  <span className="chances-text">Chances left: {chancesLeft}</span>
                </div>
              </div>
              <button onClick={togglePlayPause} className={`play-pause-btn ${isPlaying ? 'pause' : 'play'}`}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="button-container-app">
              <button onClick={resetGame} className="reset-btn">Reset Game</button>
              <button onClick={howToPlay} className="how-to-play-btn">How to Play</button>
            </div>
          </div>
        </>
      )}

      
    </div>
  );
};

export default App;