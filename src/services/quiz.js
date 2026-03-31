import { supabase } from './supabase'

export const quizService = {
  // Get quiz with questions
  async getQuiz(quizId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('id', quizId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get quizzes for a course
  async getCourseQuizzes(courseId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create quiz (teacher only)
  async createQuiz(quizData) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([quizData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Add questions to quiz (teacher only)
  async addQuestions(quizId, questions) {
    try {
      const questionsWithQuiz = questions.map(q => ({
        ...q,
        quiz_id: quizId
      }))

      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuiz)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Submit quiz attempt
  async submitAttempt(studentId, quizId, answers, score, passed) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            student_id: studentId,
            quiz_id: quizId,
            answers,
            score,
            passed,
            completed_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get student's quiz attempts
  async getStudentAttempts(studentId, quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', studentId)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
