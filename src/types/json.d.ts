type AnyJson = boolean | number | string | null | JsonArray | JsonMap
interface JsonMap {
  [key: string]: AnyJson
}
interface JsonArray extends Array<AnyJson> {}
type IsJSONObject<TKeys extends string = string> = { [Key in TKeys]: JSONValue }

/** see https://github.com/Microsoft/TypeScript/issues/1897 */
/** function doThing2<T>(params: IsJSONObject<keyof T>) {} */
