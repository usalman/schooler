import { auth } from '@clerk/nextjs/server'

export const getUserRole = async () => {
  const { sessionClaims } = await auth()
  const role: string = (sessionClaims?.metadata as { role: string })?.role
  return role
}
