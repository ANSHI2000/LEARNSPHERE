import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as apiClient from '../api/apiClient';
import './QuizTake.css';

const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Fetch quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await apiClient.quizAPI.getById(quizId);
        const quizData = response.data || response;
        setQuiz(quizData);
        setStartTime(Date.now());
        // Set default timer - 1 minute per question (adjust as needed)
        const duration = (quizData.questions?.length || 10) * 60;
        setTimeRemaining(duration);
      } catch (err) {
        setError('Failed to load quiz. ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quiz || submitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers({
      ...answers,
      [questionId]: selectedOption
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async (finalAnswers = answers) => {
    try {
      setSubmitted(true);
      const response = await apiClient.quizAPI.submitAttempt(
        parseInt(quizId),
        finalAnswers
      );
      
      const scoreValue = response.data?.score || response.score || response.data?.attempt?.score || 0;
      setScore(scoreValue);
      setAnswers(finalAnswers);
    } catch (err) {
      setError('Failed to submit quiz. ' + err.message);
      setSubmitted(false);
    }
  };

  if (loading) return <div className="quiz-container"><p className="loading">Loading quiz...</p></div>;
  if (error) return <div className="quiz-container"><div className="error-message">{error}</div></div>;
  if (!quiz) return <div className="quiz-container"><p className="error-message">Quiz not found</p></div>;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (submitted && score !== null) {
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h2>Quiz Completed!</h2>
          <div className={`result-score ${score >= 60 ? 'pass' : 'fail'}`}>
            <h3>Your Score: {score}%</h3>
            <p>{score >= 60 ? '✅ Passed!' : '❌ Failed'}</p>
          </div>
          <div className="result-details">
            <p>Total Questions: {questions.length}</p>
            <p>Time Taken: {Math.round((Date.now() - startTime) / 1000)} seconds</p>
          </div>
          <button className="btn-primary" onClick={() => navigate(-1)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>{quiz.title}</h2>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className={`timer ${timeRemaining < 60 ? 'warning' : ''}`}>
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="quiz-content">
        {currentQuestion ? (
          <div className="question-container">
            <h3>{currentQuestion.question}</h3>
            <div className="options">
              {currentQuestion.options && (() => {
                try {
                  const optionsArray = typeof currentQuestion.options === 'string' 
                    ? JSON.parse(currentQuestion.options) 
                    : currentQuestion.options;
                  
                  return optionsArray.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={answers[currentQuestion.id] === index.toString()}
                        onChange={() => handleAnswerChange(currentQuestion.id, index.toString())}
                        disabled={submitted}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ));
                } catch (e) {
                  console.error('Failed to parse options:', e);
                  return <p className="error-message">Failed to load options</p>;
                }
              })()}
            </div>
          </div>
        ) : null}
      </div>

      <div className="quiz-navigation">
        <button 
          className="btn-secondary" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitted}
        >
          ← Previous
        </button>
        
        <div className="question-indicators">
          {questions.map((q, index) => (
            <button
              key={index}
              className={`indicator ${index === currentQuestionIndex ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestionIndex(index)}
              disabled={submitted}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="submit-section">
          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              className="btn-submit" 
              onClick={() => handleSubmit()}
              disabled={submitted}
            >
              ✓ Submit Quiz
            </button>
          ) : (
            <button 
              className="btn-secondary" 
              onClick={handleNextQuestion}
              disabled={submitted}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <div className="quiz-stats">
        <p>📝 Answered: {Object.keys(answers).length}/{questions.length}</p>
      </div>
    </div>
  );
};

export default QuizTake;
