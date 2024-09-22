import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const initialTeams = [
  { name: 'Team A', members: ['Alice', 'Bob', 'Charlie', 'Diana'], score: 0 },
  { name: 'Team B', members: ['Eve', 'Frank', 'Grace', 'Heidi'], score: 0 },
  { name: 'Team C', members: ['Ivy', 'Jack', 'Karl', 'Liam'], score: 0 },
  { name: 'Team D', members: ['Mona', 'Nina', 'Oscar', 'Paul'], score: 0 },
];

const App = () => {
  // Load initial state from localStorage or fallback to defaults
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
  const [timeLeft, setTimeLeft] = useState(loadState('timeLeft', 120)); // 2 minutes countdown in seconds
  const [progress, setProgress] = useState(100);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);
  const [showClue, setShowClue] = useState(false);
  const [lastCorrectTeamIndex, setLastCorrectTeamIndex] = useState(null);
  const [currentRound, setCurrentRound] = useState(loadState('currentRound', 1));
  const [gameOver, setGameOver] = useState(loadState('gameOver', false));
  const [answeredImages, setAnsweredImages] = useState(loadState('answeredImages', [])); // Store answered images

  const images = [
    { src: '/th_images/image1.jpg', answer: 'Answer1', clue: 'xyz' },
    { src: '/th_images/image2.jpg', answer: 'Answer2', clue: 'mnop' },
    { src: '/th_images/image3.jpg', answer: 'Answer3', clue: 'it will affect entire system will destroy!!' },
  ];

  const resetGame = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the game?");
    if (confirmReset) {
      // Reset teams and scores
      setTeams(initialTeams);
      setScores([0, 0, 0, 0]);
      setCurrentTeamIndex(0);
      setChancesLeft(3);
      setCurrentImageIndex(0);
      setTimeLeft(120);
      setShowClue(false);
      setLastCorrectTeamIndex(null);
      setCurrentRound(1);
      setAnsweredImages([]); // Reset answered images
      setGameOver(false); // Reset game over state
      
      // Clear local storage
      localStorage.removeItem('teams');
      localStorage.removeItem('scores');
      localStorage.removeItem('currentTeamIndex');
      localStorage.removeItem('chancesLeft');
      localStorage.removeItem('currentImageIndex');
      localStorage.removeItem('timeLeft');
      localStorage.removeItem('showClue');
      localStorage.removeItem('lastCorrectTeamIndex');
      localStorage.removeItem('currentRound');
      localStorage.removeItem('answeredImages');
    }
  };

  // Save game state to localStorage when changes occur
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('currentTeamIndex', JSON.stringify(currentTeamIndex));
    localStorage.setItem('chancesLeft', JSON.stringify(chancesLeft));
    localStorage.setItem('currentImageIndex', JSON.stringify(currentImageIndex));
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
    localStorage.setItem('currentRound', JSON.stringify(currentRound));
    localStorage.setItem('answeredImages', JSON.stringify(answeredImages)); // Save answered images
  }, [teams, currentTeamIndex, chancesLeft, currentImageIndex, scores, timeLeft, currentRound]);

  // Countdown Timer Logic
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
            return 120; // Reset timer
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
    const nextTeamIndex = (currentTeamIndex + 1) % initialTeams.length;
    setCurrentTeamIndex(nextTeamIndex);
    setTimeLeft(120);
    setShowClue(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userAnswer = event.target.answer.value;
  
    if (userAnswer === images[currentImageIndex].answer) {
      const newScores = [...scores];
      newScores[currentTeamIndex] += timeLeft > 30 ? 10 : 7;
      setScores(newScores);
  
      // Mark the current image as answered
      const updatedAnsweredImages = [...answeredImages, currentImageIndex];
      setAnsweredImages(updatedAnsweredImages);
  
      // Check if the game is over AFTER the answeredImages state has updated
      if (updatedAnsweredImages.length === images.length) {
        setGameOver(true); // Game over when all images have been answered
        return;
      }
  
      // Get the next image index and move to the next team
      const nextIndex = getNextImageIndex(updatedAnsweredImages);
      setCurrentImageIndex(nextIndex);
      
      setLastCorrectTeamIndex(currentTeamIndex);
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000);
  
      setChancesLeft(3);
      moveToNextTeam();
    } else if (chancesLeft > 1) {
      setChancesLeft(chancesLeft - 1);
    } else {
      moveToNextTeam();
    }
  
    event.target.reset();
  };
  
  // Update getNextImageIndex to accept the answeredImages list as a parameter
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
      case 0:
        return '1st';
      case 1:
        return '2nd';
      case 2:
        return '3rd';
      case 3:
        return '4th';
      default:
        return '';
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="app">
      <h1 className="title">Intake Team Treasure Hunt</h1>
  
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
          {/* Current Team */}
          <div className="current-team">
            <p className="current-team-p">Current Team: {initialTeams[currentTeamIndex].name}</p>
          </div>

          {/* Center Content */}
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
              <input type="text" name="answer" placeholder="Enter your answer" className="answer-box" autoFocus onFocus={(e) => e.target.select()} required /> &nbsp;&nbsp;
              <button type="submit" className="submit-btn">Submit</button>
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
          </div>
        </>
      )}

      <button onClick={resetGame} className="reset-btn">Reset Game</button>
    </div>
  );
};

export default App;