import { supabase } from './supabase'

export const authService = {
  // Sign up new user
  async signUp(email, password, fullName, role) {
    console.log('Attempting sign up for:', email, role)
    
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        console.log('User already exists:', existingUser)
        throw new Error('An account with this email already exists')
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      console.log('Auth user created:', authData)

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
            approved: role === 'student' ? true : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // If profile creation fails, we should clean up the auth user
        // But for now, just throw the error
        throw profileError
      }

      console.log('Profile created successfully')
      return { data: authData, error: null }
      
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      return { 
        data: { 
          user: data.user, 
          profile 
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError
        
        return { 
          data: { 
            session, 
            profile 
          }, 
          error: null 
        }
      }
      
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}