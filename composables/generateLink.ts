import { customAlphabet } from 'nanoid'

export const useGenerateLink = (length: number) => {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length)
  
  const generatedUUID = nanoid()

  return generatedUUID
}
