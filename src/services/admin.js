import { serviceQuery, serviceCommand } from './serviceHelper'

export const adminService = {
  async getAllUsers() {
    return serviceQuery((supabase) =>
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
    )
  },

  async getUsersByRole(role) {
    return serviceQuery((supabase) =>
      supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })
    )
  },

  async getPendingTeachers() {
    return serviceQuery((supabase) =>
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('approved', false)
    )
  },

  async approveTeacher(teacherId) {
    return serviceQuery((supabase) =>
      supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', teacherId)
        .select()
        .single()
    )
  },

  async getAnalytics() {
    try {
      const { count: totalStudents, error: studentError } = await (await import('./supabase')).supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('approved', true)

      const { count: totalTeachers, error: teacherError } = await (await import('./supabase')).supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')
        .eq('approved', true)

      const { count: totalCourses, error: courseError } = await (await import('./supabase')).supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: totalEnrollments, error: enrollmentError } = await (await import('./supabase')).supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })

      if (studentError || teacherError || courseError || enrollmentError) {
        throw new Error('Failed to fetch analytics')
      }

      return {
        data: {
          totalStudents: totalStudents || 0,
          totalTeachers: totalTeachers || 0,
          totalCourses: totalCourses || 0,
          totalEnrollments: totalEnrollments || 0
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async deleteUser(userId) {
    return serviceCommand((supabase) =>
      supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
    )
  },

  async updateUserRole(userId, newRole) {
    return serviceQuery((supabase) =>
      supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single()
    )
  }
}
