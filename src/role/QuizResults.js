import React, { useState, useEffect } from 'react'
import './QuizResults.css'

const QuizResults = ({ quizResult, quiz, onBack, onRetake }) => {
  const [showReview, setShowReview] = useState(false)
  const [reviewAnswers, setReviewAnswers] = useState({})

  useEffect(() => {
    // Parse review answers if available
    if (quizResult.answers) {
      setReviewAnswers(quizResult.answers)
    }
  }, [quizResult])

  const scorePercentage = quizResult.score_percentage || quizResult.score || 0
  const isPassed = scorePercentage >= (quiz.passing_score || 60)
  const score = quizResult.total_score || quizResult.score || 0
  const maxScore = quizResult.max_score || 100

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h2>Quiz Results</h2>
      </div>

      <div className={`score-display ${isPassed ? 'passed' : 'failed'}`}>
        <div className="score-circle">
          <div className="score-text">{Math.round(scorePercentage)}%</div>
        </div>
        <div className="score-details">
          <h3>{isPassed ? 'Passed! 🎉' : 'Need Improvement'}</h3>
          <p>Score: {score} / {maxScore}</p>
          {quiz.passing_score && (
            <p>Passing Score: {quiz.passing_score}%</p>
          )}
        </div>
      </div>

      <div className="results-info">
        <div className="info-box">
          <h4>Attempt Details</h4>
          <p><strong>Date:</strong> {new Date(quizResult.completed_at || quizResult.created_at).toLocaleDateString()}</p>
          <p><strong>Score:</strong> {score}%</p>
          {quiz.passing_score && (
            <p><strong>Passing Score:</strong> {quiz.passing_score}%</p>
          )}
          <p><strong>Questions Answered:</strong> {Object.keys(reviewAnswers).length} / {quiz.questions?.length || 'N/A'}</p>
        </div>
      </div>

      {!isPassed && (
        <div className="attempt-again-prompt">
          <p>You can retake this quiz to improve your score.</p>
        </div>
      )}

      <div className="results-actions">
        {!isPassed && (
          <button className="retake-btn" onClick={onRetake}>
            Retake Quiz
          </button>
        )}
        <button className="review-btn" onClick={() => setShowReview(!showReview)}>
          {showReview ? 'Hide Review' : 'Review Answers'}
        </button>
        <button className="back-btn" onClick={onBack}>
          Back to Course
        </button>
      </div>

      {showReview && (
        <div className="review-section">
          <h3>Answer Review</h3>
          {quiz.questions && quiz.questions.map((question, index) => (
            <div key={question.id} className="review-item">
              <h4>Question {index + 1}: {question.question_text}</h4>
              <div className="review-answer">
                <p><strong>Your Answer:</strong> {reviewAnswers[question.id] || 'Not answered'}</p>
                {question.correct_answer && (
                  <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizResults
