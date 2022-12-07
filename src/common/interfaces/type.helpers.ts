export type T_WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type T_WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type T_PickOne<T> = {
  [P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>>
}[keyof T]
export type T_ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never
export type T_Nullable<T> = T | null | undefined

export type T_PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...T_PathsToStringProps<T[K]>]
    }[Extract<keyof T, string>]
export type T_Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${T_Join<Extract<R, string[]>, D>}`
    : never
  : string
