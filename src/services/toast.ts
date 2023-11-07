import { useToast } from '@siakit/toast'

interface Props {
  message: string
}

export function Toast({ message }: Props) {
  const { addToast } = useToast()

  const toast = addToast({
    title: 'Error',
    description: message,
    type: 'error',
  })

  return toast
}
