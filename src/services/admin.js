import { supabase } from './supabase'

export const adminService = {
  // Get all users
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get pending teacher approvals
  async getPendingTeachers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('approved', false)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Approve teacher
  async approveTeacher(teacherId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', teacherId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get platform analytics
  async getAnalytics() {
    try {
      const { count: totalStudents, error: studentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('approved', true)

      const { count: totalTeachers, error: teacherError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')
        .eq('approved', true)

      const { count: totalCourses, error: courseError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: totalEnrollments, error: enrollmentError } = await supabase
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

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}