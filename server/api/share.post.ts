import { supabase } from '../dbAuth'
import { customAlphabet } from 'nanoid'

export default defineEventHandler(async (event) => {
  const { shared_data } = await readBody(event)

  // Generate a random 11 character string
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 11)

  const generatedUUID = nanoid()
  // Use the postData here

  // Make a fetch to Supabase to insert the data
  const { data, error } = await supabase
    .from('shared_links_table')
    .insert([
      { shared_data: shared_data, shared_link: generatedUUID },
    ])
    .select()

  
  return { data, error };
})
