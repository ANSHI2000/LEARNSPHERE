import { supabase } from './supabase'

export const assignmentService = {
  // Get assignments for a course
  async getCourseAssignments(courseId) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create assignment (teacher only)
  async createAssignment(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Submit assignment
  async submitAssignment(studentId, assignmentId, submissionUrl) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([
          {
            student_id: studentId,
            assignment_id: assignmentId,
            submission_url: submissionUrl,
            status: 'submitted'
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

  // Grade assignment (teacher only)
  async gradeAssignment(submissionId, grade, feedback) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get student's submissions
  async getStudentSubmissions(studentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:assignments(
            *,
            course:courses(title)
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}