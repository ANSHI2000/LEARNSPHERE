import React, { useState, useEffect } from 'react'
import { quizService } from '../services/quiz'
import './QuizPlayer.css'

const QuizPlayer = ({ quiz, userId, courseId, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60) // Convert to seconds
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleAutoSubmit = async () => {
    if (!submitted) {
      await submitQuiz()
    }
  }

  const submitQuiz = async () => {
    setLoading(true)
    
    try {
      // Calculate score based on answers
      let score = 0
      quiz.questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          score++
        }
      })
      
      const totalPoints = Math.round((score / quiz.questions.length) * 100)
      const isPassed = totalPoints >= (quiz.passing_score || 60)
      
      const { data, error } = await quizService.submitAttempt(
        userId,
        quiz.id,
        answers,
        totalPoints,
        isPassed
      )

      if (error) {
        alert('Error submitting quiz: ' + error.message)
      } else {
        setSubmitted(true)
        onComplete({
          ...data,
          score_percentage: totalPoints,
          total_score: score,
          max_score: quiz.questions.length
        })
      }
    } catch (err) {
      console.error('Submit error:', err)
      alert('Failed to submit quiz')
    }
    
    setLoading(false)
  }

  if (submitted) {
    return <div className="quiz-submitted">Quiz submitted! Check results...</div>
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="quiz-player-container">
      <div className="quiz-player-header">
        <div>
          <h2>{quiz.title}</h2>
        </div>
        <div className="quiz-timer" style={{ color: timeLeft < 300 ? '#d32f2f' : '#333' }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="quiz-player-content">
        <div className="question-header">
          <h3>Question {currentQuestion + 1} of {quiz.questions.length}</h3>
        </div>

        <div className="question-text">
          <p>{question.question_text}</p>
        </div>

        <div className="question-options">
          {question.options && question.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleAnswerSelect(question.id, option)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="quiz-player-footer">
        <button 
          className="nav-btn"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>

        <div className="question-counter">
          {currentQuestion + 1} / {quiz.questions.length}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            className="nav-btn"
            onClick={handleNext}
          >
            Next →
          </button>
        ) : (
          <button 
            className="submit-btn"
            onClick={submitQuiz}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      <button className="back-btn" onClick={onBack}>← Back</button>
    </div>
  )
}

export default QuizPlayer
