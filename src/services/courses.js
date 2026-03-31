import { supabase } from './supabase'

export const courseService = {
  // Get all published courses
  async getPublishedCourses(filters = {}) {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, email),
          enrollments(count)
        `)
        .eq('status', 'published')

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get course by ID with all details
  async getCourseById(courseId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, email, avatar_url),
          lectures(*),
          quizzes(
            *,
            questions:quiz_questions(*)
          ),
          assignments(*),
          live_sessions(*)
        `)
        .eq('id', courseId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get teacher's courses
  async getTeacherCourses(teacherId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lectures(count),
          enrollments(count)
        `)
        .eq('instructor_id', teacherId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create new course (teacher only)
  async createCourse(courseData) {
    console.log('courseService.createCourse called with:', courseData)
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      console.log('Insert successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('createCourse error:', error)
      return { data: null, error }
    }
  },

  // Update course (teacher only)
  async updateCourse(courseId, updates) {
    console.log('courseService.updateCourse called with:', courseId, updates)
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      console.log('Update successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('updateCourse error:', error)
      return { data: null, error }
    }
  },

  // Delete course (teacher only) - ADD THIS FUNCTION
  async deleteCourse(courseId) {
    console.log('courseService.deleteCourse called with:', courseId)
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }
      console.log('Delete successful')
      return { error: null }
    } catch (error) {
      console.error('deleteCourse error:', error)
      return { error }
    }
  }
}