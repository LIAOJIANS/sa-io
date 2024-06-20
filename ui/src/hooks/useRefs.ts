import { Ref, shallowReactive } from "vue";

type RefValueType<V> = V extends { use: { ref: () => Ref<infer Refer | null> } } ? Refer :
  V extends new (...args: any[]) => infer Refer ? Refer : V

export default function useRefs<T extends { [k: string]: any }>(config: T): {
  refs: {
    [k in keyof T]: RefValueType<T[k]> | null | undefined
  },
  onRef: {
    [k in keyof T]: (val: any) => void
  }
} {
  const refs = shallowReactive((() => {
    const obj = {} as any

    for (let key in config) {
      obj[key] = undefined
    }

    return obj
  })())

  const onRef = (() => {
    const obj = {} as any
    for (let key in config) {
      obj[key] = (refer: any) => { refs[key] = refer }
    }
    return obj
  })()

  return {
    refs,
    onRef
  } as any
}