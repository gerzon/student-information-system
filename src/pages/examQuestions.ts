export function parseExamQuestions(text: string) {
  const lines = text.split(/\r?\n/)
  const numberedQuestions: string[] = []
  let currentQuestion: string[] = []

  for (const line of lines) {
    if (/^\s*(?:(?:question|q)\s*)?\d{1,3}[.)]\s+/i.test(line) && currentQuestion.length) {
      numberedQuestions.push(currentQuestion.join('\n').trim())
      currentQuestion = [line]
    } else {
      currentQuestion.push(line)
    }
  }
  if (currentQuestion.length) numberedQuestions.push(currentQuestion.join('\n').trim())

  const numbered = numberedQuestions.filter(Boolean)
  if (numbered.length > 1) return numbered
  return text
    .split(/\n\s*\n/)
    .map((question) => question.trim())
    .filter(Boolean)
}

export function shuffleQuestionIndexes(length: number) {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[randomIndex]] = [indexes[randomIndex], indexes[index]]
  }
  if (indexes.length > 1 && indexes.every((value, index) => value === index)) {
    const firstIndex = indexes.shift()
    if (firstIndex !== undefined) indexes.push(firstIndex)
  }
  return indexes
}
