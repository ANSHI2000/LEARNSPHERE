import React, { useState, useEffect } from 'react'
import { quizService } from '../services/quiz'
import './QuizList.css'

const QuizList = ({ courseId, userId, onSelectQuiz, onBack }) => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, attempted, not-attempted, passed, failed

  useEffect(() => {
    loadQuizzes()
  }, [courseId])

  const loadQuizzes = async () => {
    setLoading(true)
    const { data, error: err } = await quizService.getCourseQuizzes(courseId)
    
    if (err) {
      setError('Failed to load quizzes')
      console.error(err)
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const filterQuizzes = () => {
    if (filter === 'all') return quizzes
    // Add filtering logic based on quiz attempts
    return quizzes
  }

  if (loading) return <div className="quiz-loading">Loading quizzes...</div>
  if (error) return <div className="quiz-error">{error}</div>

  const filteredQuizzes = filterQuizzes()

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Available Quizzes</h2>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="no-quizzes">
          <p>No quizzes available for this course yet.</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-description">{quiz.description}</p>
              
              <div className="quiz-info">
                <span className="info-item">
                  <strong>Questions:</strong> {quiz.questions?.length || 0}
                </span>
                <span className="info-item">
                  <strong>Duration:</strong> {quiz.time_limit} mins
                </span>
                {quiz.passing_score && (
                  <span className="info-item">
                    <strong>Pass Score:</strong> {quiz.passing_score}%
                  </span>
                )}
              </div>

              <button 
                className="take-quiz-btn"
                onClick={() => onSelectQuiz(quiz)}
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizList
