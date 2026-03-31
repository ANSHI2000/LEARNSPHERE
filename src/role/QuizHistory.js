import React, { useState, useEffect } from 'react'
import { quizService } from '../services/quiz'
import { supabase } from '../services/supabase'
import './QuizHistory.css'

const QuizHistory = ({ courseId, userId, onBack }) => {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAttempt, setSelectedAttempt] = useState(null)

  useEffect(() => {
    loadAttempts()
  }, [courseId, userId])

  const loadAttempts = async () => {
    setLoading(true)
    try {
      if (!courseId) {
        // If no course selected, show all attempts for the user
        const { data: allAttempts, error: err } = await supabase
          .from('quiz_attempts')
          .select('*, quiz:quizzes(*)')
          .eq('student_id', userId)
          .order('completed_at', { ascending: false })
        
        if (err) {
          setError('Failed to load quiz attempts')
          console.error(err)
        } else {
          setAttempts(allAttempts || [])
        }
      } else {
        // Get all quizzes for the course
        const { data: quizzes, error: quizzesErr } = await quizService.getCourseQuizzes(courseId)
        
        if (quizzesErr) {
          setError('Failed to load quizzes')
          console.error(quizzesErr)
        } else {
          // Get attempts for each quiz
          let allAttempts = []
          for (const quiz of (quizzes || [])) {
            const { data: attempts, error: attErr } = await quizService.getStudentAttempts(userId, quiz.id)
            if (!attErr && attempts) {
              allAttempts = [...allAttempts, ...attempts.map(a => ({ ...a, quiz }))]
            }
          }
          // Sort by date descending
          allAttempts.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
          setAttempts(allAttempts)
        }
      }
    } catch (err) {
      setError('Error loading attempts')
      console.error(err)
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <div className="history-loading">Loading quiz history...</div>
  if (error) return <div className="history-error">{error}</div>

  return (
    <div className="quiz-history-container">
      <div className="history-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Quiz Attempts History</h2>
      </div>

      {attempts.length === 0 ? (
        <div className="no-attempts">
          <p>No quiz attempts yet.</p>
        </div>
      ) : (
        <div className="attempts-table">
          <table>
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Date</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className={attempt.passed ? 'passed-row' : 'failed-row'}>
                  <td>{attempt.quiz?.title || 'Quiz'}</td>
                  <td>{formatDate(attempt.completed_at)}</td>
                  <td>{attempt.score} / 100</td>
                  <td>
                    <span className={`percentage ${attempt.score >= 60 ? 'high' : 'low'}`}>
                      {Math.round(attempt.score)}%
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${attempt.passed ? 'passed' : 'failed'}`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => setSelectedAttempt(attempt)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAttempt && (
        <div className="attempt-detail-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedAttempt(null)}>×</button>
            <h3>{selectedAttempt.quiz?.title || 'Quiz'}</h3>
            <div className="detail-info">
              <p><strong>Date:</strong> {formatDate(selectedAttempt.completed_at)}</p>
              <p><strong>Score:</strong> {selectedAttempt.score} / 100</p>
              <p><strong>Percentage:</strong> {Math.round(selectedAttempt.score)}%</p>
              <p><strong>Status:</strong> {selectedAttempt.passed ? 'Passed ✓' : 'Failed'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizHistory
