import { supabase } from './supabase'

export const lectureService = {
  // Get lectures for a course
  async getCourseLectures(courseId) {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Add lecture (teacher only)
  async addLecture(lectureData) {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .insert([lectureData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update lecture (teacher only)
  async updateLecture(lectureId, updates) {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .update(updates)
        .eq('id', lectureId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete lecture (teacher only)
  async deleteLecture(lectureId) {
    try {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', lectureId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Track lecture progress
  async trackProgress(studentId, lectureId, completed, lastPosition = null) {
    try {
      const { data, error } = await supabase
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

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get lecture progress for student in a course
  async getLectureProgress(studentId, courseId) {
    try {
      // First get all lectures in the course
      const { data: lectures, error: lecturesError } = await supabase
        .from('lectures')
        .select('id')
        .eq('course_id', courseId)

      if (lecturesError) throw lecturesError

      const lectureIds = lectures.map(l => l.id)

      if (lectureIds.length === 0) {
        return { data: [], error: null }
      }

      // Then get progress for these lectures
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

  // Calculate course progress based on completed lectures
  async calculateCourseProgress(studentId, courseId) {
    try {
      // Get all lectures in course
      const { data: lectures, error: lecturesError } = await supabase
        .from('lectures')
        .select('id')
        .eq('course_id', courseId)

      if (lecturesError) throw lecturesError

      if (lectures.length === 0) {
        return { progress: 0, error: null }
      }

      // Get completed lectures
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