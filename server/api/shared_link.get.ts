import { supabase } from '../dbAuth'
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (!query.share) {
    return { error: 'No share query parameter provided' }
  } 

  let { data: shared_links_table, error } = await supabase
    .from('shared_links_table')
    .select('shared_data')
    .eq('shared_link', query.share)

  if (error) {
    return { error }
  }

  if (shared_links_table !== null && !shared_links_table.length) {
    return { error: 'No matching share found' }
  }

  return { data: shared_links_table !== null ? shared_links_table[0].shared_data : null }
})
