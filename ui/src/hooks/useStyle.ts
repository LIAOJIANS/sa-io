import { computed, CSSProperties } from 'vue'

export type IStylePropertties = { [k in keyof CSSProperties]: string | number | undefined | null }

export function useStyles(
  getter: (styles: IStylePropertties) => IStylePropertties | void
) {
  return computed(() => {
    const style = {}
    return getter(style) || style
  })
}