import { supabase } from './supabase'

export const enrollmentService = {
  // Enroll student in course
  async enrollStudent(studentId, courseId) {
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get student's enrolled courses
  async getStudentCourses(studentId) {
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update course progress
  async updateProgress(enrollmentId, progress) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .update({ progress })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Check if student is enrolled
  async isEnrolled(studentId, courseId) {
    try {
      const { data, error } = await supabase
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