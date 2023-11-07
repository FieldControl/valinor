import { Flex } from '@siakit/layout'

interface Props {
  onClick: () => void
  theme: string
}

export function Colors({ onClick, theme }: Props) {
  return (
    <Flex
      onClick={onClick}
      css={{
        borderRadius: '50%',
        backgroundColor: theme,
        width: '32px',
        height: '32px',
        cursor: 'pointer',
      }}
    />
  )
}
