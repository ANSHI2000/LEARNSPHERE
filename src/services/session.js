import { supabase } from './supabase'
import { serviceQuery } from './serviceHelper'

export const sessionService = {
  async getCourseSessions(courseId) {
    return serviceQuery((supabase) =>
      supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', courseId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
    )
  },

  async scheduleSession(sessionData) {
    return serviceQuery((supabase) =>
      supabase
        .from('live_sessions')
        .insert([sessionData])
        .select()
        .single()
    )
  },

  async markAttendance(studentId, sessionId) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  },

  async getStudentSessions(studentId) {
    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', studentId)

      if (enrollError) throw enrollError

      const courseIds = enrollments.map(e => e.course_id)

      if (courseIds.length === 0) {
        return { data: [], error: null }
      }

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
