import { serviceQuery } from './serviceHelper'

export const assignmentService = {
  async getCourseAssignments(courseId) {
    return serviceQuery((supabase) =>
      supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true })
    )
  },

  async createAssignment(assignmentData) {
    return serviceQuery((supabase) =>
      supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single()
    )
  },

  async submitAssignment(studentId, assignmentId, submissionUrl) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  },

  async gradeAssignment(submissionId, grade, feedback) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  },

  async getStudentSubmissions(studentId) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  }
}
