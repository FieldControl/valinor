import { Flex } from '@siakit/layout'
import { Text } from '@siakit/text'

import { Circle } from './styles'

interface Props {
  language: string
}

export function LanguageValidation({ language }: Props) {
  const languageColors = {
    JavaScript: '$amber10',
    TypeScript: '$blue10',
    'Objective-C': '$blue10',
    HTML: '$red10',
    Blade: '$red10',
    Svelte: '$red10',
    Elm: '$cyan10',
    Dart: '$grass10',
    WebAssembly: '$teal10',
    Go: '$teal10',
    Makefile: '$green10',
    HCL: '$purple10',
    'C++': '$crimson10',
    Twig: '$yellow10',
    C: '$gray10',
    CSS: '$violet10',
    Java: '$brown10',
    CoffeeScript: '$indigo10',
    Less: '$indigo10',
    Python: '$indigo10',
    Astro: '$orange10',
    Pug: '$brown10',
    Ruby: '$orange10',
    'C#': '$green10',
    Shell: '$green10',
    Vue: '$green10',
    QML: '$green10',
    SCSS: '$pink10',
    PHP: '$purple10',
    R: '$blue10',
    Smarty: '$amber10',
    Clojure: '$crimson10',
    Liquid: '$blue10',
    'Jupyter Notebook': '$orange10',
    Puppet: '$violet10',
    Slash: '$blue10',
    Dockerfile: '$indigo10',
    Erlang: '$pink10',
    Assembly: '$brown10',
    Julia: '$violet10',
    Hack: '$gray10',
    Jinja: '$red10',
    Nginx: '$green10',
  }

  const color = (languageColors as any)[language] || ''

  if (color) {
    return (
      <Flex align="center" gap={8}>
        <Circle css={{ backgroundColor: color }} />
        <Flex align="center" gap>
          <Text>{language}</Text>
          <Text>.</Text>
        </Flex>
      </Flex>
    )
  } else {
    return ''
  }
}
