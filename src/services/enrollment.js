import { serviceQuery } from './serviceHelper'

export const enrollmentService = {
  async enrollStudent(studentId, courseId) {
    return serviceQuery((supabase) =>
      supabase
        .from('enrollments')
        .insert([
          {
            student_id: studentId,
            course_id: courseId,
            progress: 0
          }
        ])
        .select()
        .single()
    )
  },

  async getStudentCourses(studentId) {
    return serviceQuery((supabase) =>
      supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            *,
            instructor:profiles!instructor_id(full_name),
            lectures(count)
          )
        `)
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false })
    )
  },

  async updateProgress(enrollmentId, progress) {
    return serviceQuery((supabase) =>
      supabase
        .from('enrollments')
        .update({ progress })
        .eq('id', enrollmentId)
        .select()
        .single()
    )
  },

  async isEnrolled(studentId, courseId) {
    try {
      const { data, error } = await (await import('./supabase')).supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (error) throw error
      return { data: !!data, error: null }
    } catch (error) {
      return { data: false, error }
    }
  }
}
