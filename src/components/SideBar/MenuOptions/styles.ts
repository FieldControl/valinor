import { styled } from '@siakit/core'
import { Flex } from '@siakit/layout'

export const Option = styled(Flex, {
  cursor: 'pointer',
  gap: '16px',
  padding: '0 0 0 8px',
  alignItems: 'center',
  display: 'flex',
  margin: '0 0 0 4px',
  flex: 1,
  borderRadius: '8px',
  minHeight: '32px',
  borderColor: '$amber10',
  border: '4px',
  backgroundColor: 'var(--color)',
  '&:hover': {
    backgroundColor: '$gray4',
  },
})
