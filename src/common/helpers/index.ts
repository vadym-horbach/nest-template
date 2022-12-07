import CallSite = NodeJS.CallSite

export const parseStack = (belowFn?: (...a: any[]) => any, depth: number = 0): CallSite[] => {
  const oldLimit = Error.stackTraceLimit
  Error.stackTraceLimit = 7

  const dummyObject: { stack: CallSite[] } = { stack: [] }

  const v8Handler = Error.prepareStackTrace

  Error.prepareStackTrace = (err, v8StackTrace): CallSite[] => {
    return v8StackTrace || []
  }

  Error.captureStackTrace(dummyObject, belowFn || parseStack)

  let v8StackTrace = dummyObject.stack || []
  const localDepth = depth > v8StackTrace.length - 2 ? v8StackTrace.length - 2 : depth
  v8StackTrace = v8StackTrace.slice(localDepth + 1)
  Error.prepareStackTrace = v8Handler
  Error.stackTraceLimit = oldLimit

  return v8StackTrace
}

export const getCaller = () => {
  const [first] = parseStack(getCaller)
  const functionName = first?.getFunctionName()

  if (!functionName) {
    throw new Error("Can't get Caller")
  }

  return functionName
}

export const isUUID = (string: string) => {
  const pattern = /^[0-9A-F]{8}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{12}$/i

  return pattern.test(string)
}

export function inverseRecord<T extends string, E extends string>(
  record: Record<T, E>,
): Record<E, T> {
  const invertedRecord: Record<string, T> = {}
  Object.entries(record).forEach((data) => {
    const [key, value] = data
    invertedRecord[value as E] = key as T
  })

  return invertedRecord
}
