'use server'

import { revalidatePath } from 'next/cache'
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from './formValidationSchemas'
import prisma from './prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { getUserRole } from './utils'

type CurrentState = { success: boolean; error: boolean }

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    })

    // revalidatePath('/list/subjects')
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    })

    // revalidatePath("/list/subjects");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    })

    // revalidatePath("/list/subjects");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    })

    // revalidatePath("/list/class");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    })

    // revalidatePath("/list/class");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    })

    // revalidatePath("/list/class");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const clerkC = await clerkClient()
    const user = await clerkC.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'teacher' },
    })

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    })

    // revalidatePath("/list/teachers");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true }
  }

  try {
    const clerkC = await clerkClient()
    await clerkC.users.updateUser(data.id, {
      username: data.username,
      // ...(data.password !== '' && { password: data.password }),
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
    })
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        // ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    })
    // revalidatePath("/list/teachers");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string
  try {
    const clerkC = await clerkClient()
    await clerkC.users.deleteUser(id)

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    })

    // revalidatePath("/list/teachers");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    })

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true }
    }

    const clerkC = await clerkClient()
    const user = await clerkC.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'student' },
    })

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    })

    // revalidatePath("/list/students");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true }
  }
  try {
    const clerkC = await clerkClient()
    const user = await clerkC.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== '' && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    })

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    })
    // revalidatePath("/list/students");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string
  try {
    const clerkC = await clerkClient()
    await clerkC.users.deleteUser(id)

    await prisma.student.delete({
      where: {
        id: id,
      },
    })

    // revalidatePath("/list/students");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { currentUserId, role } = await getUserRole()

  try {
    if (role === 'teacher') {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: currentUserId!,
          id: data.lessonId,
        },
      })

      if (!teacherLesson) {
        return { success: false, error: true }
      }
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    })

    // revalidatePath("/list/subjects");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

// TODO: Update exam isn'
export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { currentUserId, role } = await getUserRole()
  try {
    if (role === 'teacher') {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: currentUserId!,
          id: data.lessonId,
        },
      })

      if (!teacherLesson) {
        return { success: false, error: true }
      }
    }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    })

    // revalidatePath("/list/subjects");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get('id') as string

  const { currentUserId, role } = await getUserRole()

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        ...(role === 'teacher'
          ? { lesson: { teacherId: currentUserId! } }
          : {}),
      },
    })

    // revalidatePath("/list/subjects");
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}
