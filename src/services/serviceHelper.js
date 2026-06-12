import { supabase } from './supabase'

export const serviceQuery = async (queryFn) => {
  try {
    const { data, error } = await queryFn(supabase)
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const serviceCommand = async (commandFn) => {
  try {
    const { error } = await commandFn(supabase)
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}
