import TeacherForm from './forms/TeacherForm'

const FormModalContent = ({
  table,
  type,
  id,
  data,
}: {
  table:
    | 'teacher'
    | 'student'
    | 'parent'
    | 'subject'
    | 'class'
    | 'lesson'
    | 'exam'
    | 'assignment'
    | 'result'
    | 'attendance'
    | 'event'
    | 'announcement'
  type: 'create' | 'update' | 'delete'
  id?: string
  data: any
}) => {
  return type === 'delete' && id ? (
    <form action="" className="p-4 flex flex-col gap-4">
      <span className="text-center font-medium">
        All data will be lost. Are you sure you want to delete this {table}?
      </span>
      <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none self-center">
        Delete
      </button>
    </form>
  ) : type === 'create' || type === 'update' ? (
    <TeacherForm type={type} data={data} />
  ) : (
    'Form not found!'
  )
}

export default FormModalContent
