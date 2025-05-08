import prisma from '@/lib/prisma'
import CountChart from './CountChart'
import Image from 'next/image'

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ['sex'],
    _count: true,
  })

  const boysCount = data.find((x) => x.sex === 'MALE')?._count || 0
  const girlsCount = data.find((x) => x.sex === 'FEMALE')?._count || 0

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <CountChart boys={boysCount} girls={girlsCount} />
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-Sky rounded-full" />
          <h1 className="font-bold">{boysCount}</h1>
          <h2 className="text-xs text-gray-300">
            Boys ({Math.round((boysCount / (boysCount + girlsCount)) * 100)})
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-Yellow rounded-full" />
          <h1 className="font-bold">{girlsCount}</h1>
          <h2 className="text-xs text-gray-300">
            Girls ({Math.round((girlsCount / (boysCount + girlsCount)) * 100)})
          </h2>
        </div>
      </div>
    </div>
  )
}

export default CountChartContainer
