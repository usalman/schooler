import FormModal from '@/components/FormModal'
import Pagination from '@/components/Pagination'
import Table from '@/components/Table'
import TableSearch from '@/components/TableSearch'
import { columns } from '@/shared/ClassListColumns'
import { role } from '@/lib/data'
import Image from 'next/image'
import { Class, Grade, Prisma, Teacher } from '@prisma/client'
import prisma from '@/lib/prisma'
import { ITEMS_PER_PAGE } from '@/lib/settings'

type ClassList = Class & { grade: Grade } & { supervisor: Teacher }

const renderRow = (item: ClassList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>
    <td className="hidden md:table-cell">{item.grade.level}</td>
    <td className="hidden md:table-cell">
      {item.supervisor?.name + ' ' + item.supervisor?.surname}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === 'admin' && (
          <>
            <FormModal table="class" type="update" data={item} />
            <FormModal table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
)
const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) => {
  const { page, ...queryParams } = searchParams
  const pageNumber = page ? +page : 1

  // URL PARAMS CONDITION

  const query: Prisma.ClassWhereInput = {}

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case 'supervisorId':
            query.supervisorId = value
            break
          case 'search':
            query.name = {
              contains: value,
              mode: 'insensitive',
            }
            break
          default:
            break
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        grade: true,
        supervisor: true,
      },
      take: ITEMS_PER_PAGE,
      skip: ITEMS_PER_PAGE * (pageNumber - 1),
    }),
    prisma.class.count({ where: query }),
  ])

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === 'admin' && <FormModal table="class" type="create" />}
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

export default ClassListPage
