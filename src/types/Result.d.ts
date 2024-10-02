export type Result = {
  id: number
  subject: string
  class: string
  teacher: string
  student: string
  type: 'exam' | 'assignment'
  date: string
  score: number
}
