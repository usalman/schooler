export const columns = [
  {
    header: 'Subject Name',
    accessor: 'name',
  },
  {
    header: 'Class',
    accessor: 'class',
  },
  {
    header: 'Teacher',
    accessor: 'teacher',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Due Date',
    accessor: 'dueDate',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Actions',
    accessor: 'actions',
  },
]
