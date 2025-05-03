import FormModal from '@/components/FormModal'
import Pagination from '@/components/Pagination'
import Table from '@/components/Table'
import TableSearch from '@/components/TableSearch'
import { columns } from '@/shared/ResultListColumns'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { ITEMS_PER_PAGE } from '@/lib/settings'
import { Prisma } from '@prisma/client'
import { getUserRole } from '@/lib/utils'

type ResultList = {
  id: number
  title: string
  studentName: string
  studentSurname: string
  teacherName: string
  teacherSurname: string
  score: number
  className: string
  startTime: Date
}

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) => {
  const role = (await getUserRole()).role
  const currentUserId = (await getUserRole()).currentUserId

  // only admin and teacher should see the actions column
  if (
    !(role === 'admin' || role === 'teacher') &&
    columns[columns.length - 1].header === 'Actions'
  ) {
    columns.length = columns.length - 1
  }

  const { page, ...queryParams } = searchParams
  const pageNumber = page ? +page : 1

  // URL PARAMS CONDITION

  const query: Prisma.ResultWhereInput = {}

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case 'studentId':
            query.studentId = value
            break
          case 'search':
            query.OR = [
              { exam: { title: { contains: value, mode: 'insensitive' } } },
              { student: { name: { contains: value, mode: 'insensitive' } } },
            ]
            break
          default:
            break
        }
      }
    }
  }

  // ROLE CONDITION

  switch (role) {
    case 'admin':
      break
    case 'teacher':
      query.OR = [
        {
          exam: { lesson: { teacherId: currentUserId! } },
        },
        {
          assignment: { lesson: { teacherId: currentUserId! } },
        },
      ]
      break
    case 'student':
      query.studentId = currentUserId!
      break
    case 'parent':
      query.student = {
        parentId: currentUserId!,
      }
    default:
      break
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEMS_PER_PAGE,
      skip: ITEMS_PER_PAGE * (pageNumber - 1),
    }),
    prisma.result.count({ where: query }),
  ])

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment
    if (!assessment) return null
    const isExam = 'startTime' in assessment

    return {
      id: item.id,
      title: assessment.title,
      studentName: item.student.name,
      studentSurname: item.student.surname,
      teacherName: assessment.lesson.teacher.name,
      teacherSurname: assessment.lesson.teacher.surname,
      score: item.score,
      className: assessment.lesson.class.name,
      startTime: isExam ? assessment.startTime : assessment.startDate,
    }
  })

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.studentName + ' ' + item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">
        {item.teacherName + ' ' + item.teacherSurname}
      </td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat('en-US').format(item.startTime)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <FormModal table="result" type="update" data={item} />
              <FormModal table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === 'admin' || role === 'teacher') && (
              <FormModal table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={pageNumber} count={count} />
    </div>
  )
}

export default ResultListPage
