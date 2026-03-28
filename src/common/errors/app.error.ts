import type { IAppError } from "./interface.error"

export type CommonCode = "FORBIDDEN_ROLE"
export type UserCode = "USER_NOT_FOUND"
export type FileCode = "FILE_NOT_FOUND"
export type CourseCode = "COURSE_NOT_FOUND"
export type CourseNotInDraftStatus = "COURSE_NOT_IN_DRAFT_STATUS"
export type ChapterCode = "CHAPTER_NOT_FOUND"
export type LessonCode = "LESSON_NOT_FOUND"
export type BadRequest = "BAD_REQUEST"

export type AppCode = CommonCode | CourseNotInDraftStatus | UserCode | FileCode | CourseCode | ChapterCode | LessonCode | BadRequest

export const APP_ERROR: Record<AppCode, IAppError> = {
  USER_NOT_FOUND: {
    code: "0001",
    status: 404,
    message: "User not found",
  },
  FILE_NOT_FOUND: {
    code: "0002",
    status: 404,
    message: "File not found",
  },
  COURSE_NOT_FOUND: {
    code: "0003",
    status: 404,
    message: "Course not found",
  },
  CHAPTER_NOT_FOUND: {
    code: "0004",
    status: 404,
    message: "Chapter not found",
  },
  LESSON_NOT_FOUND: {
    code: "0005",
    status: 404,
    message: "Lesson not found",
  },
  FORBIDDEN_ROLE: {
    code: "0006",
    status: 403,
    message: "You do not have permission to access this resource",
  },
  BAD_REQUEST: {
    code: "0007",
    status: 409,
    message: "Bad request",
  },
  COURSE_NOT_IN_DRAFT_STATUS: {
    code: "0008",
    status: 400,
    message: "Bad request",
  },
}
