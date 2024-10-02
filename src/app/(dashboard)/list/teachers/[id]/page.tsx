const SingleTeacherPage = ({ teacherId }: { teacherId: string }) => {
  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">left</div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3">right</div>
    </div>
  )
}

export default SingleTeacherPage
