export type ExamRecord = {
  code: string
  levelName: string
  departmentName: string
  courseId: string
  courseCode: string
  courseName: string
  yearName: string
  sectionName: string
  title: string
  subject: string
  examDate: string
  duration: string
  questionsFileName: string
  questionsFileType: string
  questionsFile: Blob | null
  answerKeyFileName: string
  answerKeyFile: Blob | null
  createdAt: string
}

const databaseName = 'papsi-student-exams'
const storeName = 'exams'
let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('This browser does not support exam storage.'))
  }
  if (databasePromise) return databasePromise

  const promise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, { keyPath: 'code' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(
      request.error ?? new Error('Could not open local exam storage.'),
    )
    request.onblocked = () => reject(
      new Error('Exam storage is blocked by another browser tab. Close other SIS tabs and try again.'),
    )
  }).catch((error: unknown) => {
    databasePromise = undefined
    throw error
  })
  databasePromise = promise
  return promise
}

function completeTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(
      transaction.error ?? new Error('Could not save exam data.'),
    )
    transaction.onabort = () => reject(
      transaction.error ?? new Error('Exam data transaction was aborted.'),
    )
  })
}

export async function getExamByCode(code: string) {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, 'readonly')
  const result = await new Promise<ExamRecord | undefined>((resolve, reject) => {
    const request = transaction.objectStore(storeName).get(code)
    request.onsuccess = () => resolve(request.result as ExamRecord | undefined)
    request.onerror = () => reject(
      request.error ?? new Error('Could not look up that exam code.'),
    )
  })
  await completeTransaction(transaction)
  return result
}

export async function getAllExams() {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, 'readonly')
  const result = await new Promise<ExamRecord[]>((resolve, reject) => {
    const request = transaction.objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as ExamRecord[])
    request.onerror = () => reject(
      request.error ?? new Error('Could not load saved exams.'),
    )
  })
  await completeTransaction(transaction)
  return result
}

export async function saveExam(exam: ExamRecord) {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, 'readwrite')
  transaction.objectStore(storeName).put(exam)
  await completeTransaction(transaction)
}

export async function removeExam(code: string) {
  const database = await openDatabase()
  const transaction = database.transaction(storeName, 'readwrite')
  transaction.objectStore(storeName).delete(code)
  await completeTransaction(transaction)
}

export async function generateExamCode() {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const randomValues = crypto.getRandomValues(new Uint8Array(8))
    const code = Array.from(randomValues, (value) => alphabet[value % alphabet.length])
      .slice(0, 6)
      .join('')
    if (!(await getExamByCode(code))) return code
  }
  throw new Error('Could not generate a unique exam code. Please try again.')
}
