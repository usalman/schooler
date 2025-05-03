import { auth } from '@clerk/nextjs/server'

export const getUserRole = async () => {
  const { userId, sessionClaims } = await auth()
  const currentUserId: string = userId!
  const role: string = (sessionClaims?.metadata as { role: string })?.role

  return { currentUserId, role }
}
