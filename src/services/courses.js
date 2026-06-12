import { serviceQuery, serviceCommand } from './serviceHelper'

export const courseService = {
  async getPublishedCourses(filters = {}) {
    return serviceQuery((supabase) => {
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

      return query
    })
  },

  async getCourseById(courseId) {
    return serviceQuery((supabase) =>
      supabase
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
    )
  },

  async getTeacherCourses(teacherId) {
    return serviceQuery((supabase) =>
      supabase
        .from('courses')
        .select(`
          *,
          lectures(count),
          enrollments(count)
        `)
        .eq('instructor_id', teacherId)
        .order('created_at', { ascending: false })
    )
  },

  async createCourse(courseData) {
    console.log('courseService.createCourse called with:', courseData)
    return serviceQuery((supabase) =>
      supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()
    )
  },

  async updateCourse(courseId, updates) {
    console.log('courseService.updateCourse called with:', courseId, updates)
    return serviceQuery((supabase) =>
      supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single()
    )
  },

  async deleteCourse(courseId) {
    console.log('courseService.deleteCourse called with:', courseId)
    return serviceCommand((supabase) =>
      supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
    )
  }
}
