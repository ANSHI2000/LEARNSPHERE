import { supabase } from './supabase'

export const sessionService = {
  // Get upcoming sessions for a course
  async getCourseSessions(courseId) {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', courseId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Schedule session (teacher only)
  async scheduleSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .insert([sessionData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark attendance
  async markAttendance(studentId, sessionId) {
    try {
      const { data, error } = await supabase
        .from('session_attendance')
        .upsert(
          {
            student_id: studentId,
            session_id: sessionId,
            attended: true,
            joined_at: new Date().toISOString()
          },
          { onConflict: 'student_id, session_id' }
        )
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get student's upcoming sessions
  async getStudentSessions(studentId) {
    try {
      // Get enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', studentId)

      if (enrollError) throw enrollError

      const courseIds = enrollments.map(e => e.course_id)

      if (courseIds.length === 0) {
        return { data: [], error: null }
      }

      // Get sessions from enrolled courses
      const { data, error } = await supabase
        .from('live_sessions')
        .select(`
          *,
          course:courses(title)
        `)
        .in('course_id', courseIds)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
