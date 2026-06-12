import { serviceQuery } from './serviceHelper'

export const quizService = {
  async getQuiz(quizId) {
    return serviceQuery((supabase) =>
      supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('id', quizId)
        .single()
    )
  },

  async getCourseQuizzes(courseId) {
    return serviceQuery((supabase) =>
      supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
    )
  },

  async createQuiz(quizData) {
    return serviceQuery((supabase) =>
      supabase
        .from('quizzes')
        .insert([quizData])
        .select()
        .single()
    )
  },

  async addQuestions(quizId, questions) {
    const questionsWithQuiz = questions.map(q => ({
      ...q,
      quiz_id: quizId
    }))

    return serviceQuery((supabase) =>
      supabase
        .from('quiz_questions')
        .insert(questionsWithQuiz)
        .select()
    )
  },

  async submitAttempt(studentId, quizId, answers, score, passed) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  },

  async getStudentAttempts(studentId, quizId) {
    return serviceQuery((supabase) =>
      supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', studentId)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false })
    )
  }
}
