import { ReactNode } from 'react'

import { Flex } from '@siakit/layout'

import { Option } from './styles'

interface Props {
  children: ReactNode
  onClick: () => void
  color?: string
  event?: boolean
  disabled: boolean
}

export function MenuOptions({
  children,
  onClick,
  color,
  event,
  disabled,
}: Props) {
  return (
    <Flex flex justify="center">
      {event === true ? (
        <Flex
          css={{
            backgroundColor: '$primary9',
            width: '4px',
            maxHeight: '24px',
            borderRadius: '10px',
            margin: '4px 0 0 0',
          }}
        />
      ) : (
        <Flex
          css={{
            width: '4px',
            minHeight: '24px',
          }}
        />
      )}
      <Option
        css={{
          backgroundColor: color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={disabled ? undefined : onClick}
      >
        {children}
      </Option>
    </Flex>
  )
}
