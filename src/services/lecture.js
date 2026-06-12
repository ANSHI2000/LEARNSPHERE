import { supabase } from './supabase'
import { serviceQuery, serviceCommand } from './serviceHelper'

export const lectureService = {
  async getCourseLectures(courseId) {
    return serviceQuery((supabase) =>
      supabase
        .from('lectures')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
    )
  },

  async addLecture(lectureData) {
    return serviceQuery((supabase) =>
      supabase
        .from('lectures')
        .insert([lectureData])
        .select()
        .single()
    )
  },

  async updateLecture(lectureId, updates) {
    return serviceQuery((supabase) =>
      supabase
        .from('lectures')
        .update(updates)
        .eq('id', lectureId)
        .select()
        .single()
    )
  },

  async deleteLecture(lectureId) {
    return serviceCommand((supabase) =>
      supabase
        .from('lectures')
        .delete()
        .eq('id', lectureId)
    )
  },

  async trackProgress(studentId, lectureId, completed, lastPosition = null) {
    return serviceQuery((supabase) =>
      supabase
        .from('lecture_progress')
        .upsert(
          {
            student_id: studentId,
            lecture_id: lectureId,
            last_position: lastPosition,
            completed: completed,
            completed_at: completed ? new Date().toISOString() : null
          },
          { onConflict: 'student_id, lecture_id' }
        )
        .select()
        .single()
    )
  },

  async getLectureProgress(studentId, courseId) {
    try {
      const { data: lectures, error: lecturesError } = await supabase
        .from('lectures')
        .select('id')
        .eq('course_id', courseId)

      if (lecturesError) throw lecturesError

      const lectureIds = lectures.map(l => l.id)

      if (lectureIds.length === 0) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('lecture_progress')
        .select(`
          *,
          lecture:lectures(*)
        `)
        .eq('student_id', studentId)
        .in('lecture_id', lectureIds)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async calculateCourseProgress(studentId, courseId) {
    try {
      const { data: lectures, error: lecturesError } = await supabase
        .from('lectures')
        .select('id')
        .eq('course_id', courseId)

      if (lecturesError) throw lecturesError

      if (lectures.length === 0) {
        return { progress: 0, error: null }
      }

      const { data: completedLectures, error: progressError } = await supabase
        .from('lecture_progress')
        .select('lecture_id')
        .eq('student_id', studentId)
        .eq('completed', true)
        .in('lecture_id', lectures.map(l => l.id))

      if (progressError) throw progressError

      const progress = Math.round((completedLectures.length / lectures.length) * 100)
      return { progress, error: null }
    } catch (error) {
      return { progress: 0, error }
    }
  }
}
