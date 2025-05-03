import FormModal from '@/components/FormModal'
import Pagination from '@/components/Pagination'
import Table from '@/components/Table'
import TableSearch from '@/components/TableSearch'
import { columns } from '@/shared/LessonListColumns'
import Image from 'next/image'
import { Class, Lesson, Prisma, Subject, Teacher } from '@prisma/client'
import prisma from '@/lib/prisma'
import { ITEMS_PER_PAGE } from '@/lib/settings'
import { getUserRole } from '@/lib/utils'

type LessonList = Lesson & { subject: Subject; teacher: Teacher; class: Class }

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) => {
  const role = (await getUserRole()).role

  // only admin and teacher should see the actions column
  if (!(role === 'admin') && columns[columns.length - 1].header === 'Actions') {
    columns.length = columns.length - 1
  }

  const { page, ...queryParams } = searchParams
  const pageNumber = page ? +page : 1

  // URL PARAMS CONDITION

  const query: Prisma.LessonWhereInput = {}

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case 'teacherId':
            query.teacherId = value
            break
          case 'classId':
            query.classId = parseInt(value)
            break
          case 'search':
            query.OR = [
              {
                subject: {
                  name: {
                    contains: value,
                    mode: 'insensitive',
                  },
                },
              },
              {
                teacher: {
                  name: {
                    contains: value,
                    mode: 'insensitive',
                  },
                },
              },
            ]
            break
          default:
            break
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        // we only need one or two columns from these tables;
        // to increase speed, we specify the necessary column names in 'select' option
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEMS_PER_PAGE,
      skip: ITEMS_PER_PAGE * (pageNumber - 1),
    }),
    prisma.lesson.count({ where: query }),
  ])

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class?.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + ' ' + item.teacher.surname}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <FormModal table="lesson" type="update" data={item} />
              <FormModal table="lesson" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === 'admin' && <FormModal table="lesson" type="create" />}
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

export default LessonListPage
