'use client'

import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState } from 'react'

const localizer = momentLocalizer(moment)

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[]
}) => {
  const [view, setView] = useState<View>('work_week')
  const handleOnChangeView = (selectedView: View) => setView(selectedView)
  return (
    <Calendar
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={['day', 'work_week']}
      view={view}
      style={{ height: '98%' }}
      onView={handleOnChangeView}
      min={new Date(2024, 1, 0, 8, 0, 0)}
      max={new Date(2024, 1, 0, 17, 0, 0)}
    />
  )
}

export default BigCalendar
