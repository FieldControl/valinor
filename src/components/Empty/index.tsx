import Lottie from 'react-lottie'

import { Heading } from '@siakit/heading'
import { Flex } from '@siakit/layout'
import { Text } from '@siakit/text'

import EmptyLottie from '../../lottie/cXgXwPdpWs.json'

export function Empty() {
  return (
    <Flex flex>
      <Flex flex direction="column" justify="center" align="center">
        <Lottie
          height={120}
          width={120}
          isClickToPauseDisabled
          options={{
            autoplay: true,
            loop: false,
            animationData: EmptyLottie,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
        />
        <Heading size="xxs">Sem dados de busca</Heading>
        <Text>Por favor, informe outro dado para buscar.</Text>
      </Flex>
    </Flex>
  )
}
