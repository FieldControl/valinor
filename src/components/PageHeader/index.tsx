import { useState, useEffect } from 'react'

import { Moon, PaintBrushBroad, Sun } from 'phosphor-react'

import { Button } from '@siakit/button'
import { useTheme } from '@siakit/core'
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
  DropdownLabel,
} from '@siakit/dropdown'
import { TextInput } from '@siakit/form-components'
import { Flex } from '@siakit/layout'
import { LinkButton } from '@siakit/link-button'
import { Tooltip } from '@siakit/tooltip'

import { Colors } from './Colors'

export function PageHeader() {
  const { theme, toggleTheme, changeColor } = useTheme()
  const [themeIcon, setThemeIcon] = useState(false)
  const [changeTheme, setChangeTheme] = useState(false)

  useEffect(() => {
    if (theme === 'dark') {
      setThemeIcon(true)
      setChangeTheme(true)
    } else {
      setThemeIcon(false)
      setChangeTheme(false)
    }
  }, [theme, changeTheme])

  return (
    <Flex flex maxHeight={64} align="center" padding gap>
      <Tooltip content="My repository">
        <Flex
          css={{ cursor: 'pointer' }}
          onClick={() => window.open('https://github.com/PauloEduardo1994')}
        >
          {themeIcon === true ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="52"
              height="52"
              viewBox="0,0,256,256"
            >
              <g
                fill="#ffffff"
                fillRule="nonzero"
                stroke="none"
                strokeWidth="1"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit="10"
                strokeDasharray=""
                strokeDashoffset="0"
                fontFamily="none"
                fontWeight="none"
                fontSize="none"
                textAnchor="none"
              >
                <g transform="scale(3.55556,3.55556)">
                  <path d="M36,12c13.255,0 24,10.745 24,24c0,10.656 -6.948,19.685 -16.559,22.818c0.003,-0.009 0.007,-0.022 0.007,-0.022c0,0 -1.62,-0.759 -1.586,-2.114c0.038,-1.491 0,-4.971 0,-6.248c0,-2.193 -1.388,-3.747 -1.388,-3.747c0,0 10.884,0.122 10.884,-11.491c0,-4.481 -2.342,-6.812 -2.342,-6.812c0,0 1.23,-4.784 -0.426,-6.812c-1.856,-0.2 -5.18,1.774 -6.6,2.697c0,0 -2.25,-0.922 -5.991,-0.922c-3.742,0 -5.991,0.922 -5.991,0.922c-1.419,-0.922 -4.744,-2.897 -6.6,-2.697c-1.656,2.029 -0.426,6.812 -0.426,6.812c0,0 -2.342,2.332 -2.342,6.812c0,11.613 10.884,11.491 10.884,11.491c0,0 -1.097,1.239 -1.336,3.061c-0.76,0.258 -1.877,0.576 -2.78,0.576c-2.362,0 -4.159,-2.296 -4.817,-3.358c-0.649,-1.048 -1.98,-1.927 -3.221,-1.927c-0.817,0 -1.216,0.409 -1.216,0.876c0,0.467 1.146,0.793 1.902,1.659c1.594,1.826 1.565,5.933 7.245,5.933c0.617,0 1.876,-0.152 2.823,-0.279c-0.006,1.293 -0.007,2.657 0.013,3.454c0.034,1.355 -1.586,2.114 -1.586,2.114c0,0 0.004,0.013 0.007,0.022c-9.61,-3.133 -16.558,-12.162 -16.558,-22.818c0,-13.255 10.745,-24 24,-24z"></path>
                </g>
              </g>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="52"
              height="52"
              viewBox="0 0 72 72"
            >
              <path d="M36,12c13.255,0,24,10.745,24,24c0,10.656-6.948,19.685-16.559,22.818c0.003-0.009,0.007-0.022,0.007-0.022	s-1.62-0.759-1.586-2.114c0.038-1.491,0-4.971,0-6.248c0-2.193-1.388-3.747-1.388-3.747s10.884,0.122,10.884-11.491	c0-4.481-2.342-6.812-2.342-6.812s1.23-4.784-0.426-6.812c-1.856-0.2-5.18,1.774-6.6,2.697c0,0-2.25-0.922-5.991-0.922	c-3.742,0-5.991,0.922-5.991,0.922c-1.419-0.922-4.744-2.897-6.6-2.697c-1.656,2.029-0.426,6.812-0.426,6.812	s-2.342,2.332-2.342,6.812c0,11.613,10.884,11.491,10.884,11.491s-1.097,1.239-1.336,3.061c-0.76,0.258-1.877,0.576-2.78,0.576	c-2.362,0-4.159-2.296-4.817-3.358c-0.649-1.048-1.98-1.927-3.221-1.927c-0.817,0-1.216,0.409-1.216,0.876s1.146,0.793,1.902,1.659	c1.594,1.826,1.565,5.933,7.245,5.933c0.617,0,1.876-0.152,2.823-0.279c-0.006,1.293-0.007,2.657,0.013,3.454	c0.034,1.355-1.586,2.114-1.586,2.114s0.004,0.013,0.007,0.022C18.948,55.685,12,46.656,12,36C12,22.745,22.745,12,36,12z"></path>
            </svg>
          )}
        </Flex>
      </Tooltip>
      <Flex flex gap={8} justify="end">
        {changeTheme === false ? (
          <Flex
            onClick={() => {
              toggleTheme('dark')
              setChangeTheme(true)
            }}
            gap={8}
            align="center"
            css={{
              backgroundColor: '$gray3',
              height: '32px',
              width: '32px',
              borderRadius: '8px',
              justifyContent: 'center',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <Moon size={18} weight="bold" />
          </Flex>
        ) : (
          <Flex
            onClick={() => {
              toggleTheme('light')
              setChangeTheme(false)
            }}
            gap={8}
            align="center"
            css={{
              backgroundColor: '$gray3',
              height: '32px',
              width: '32px',
              borderRadius: '8px',
              justifyContent: 'center',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <Sun size={18} weight="bold" />
          </Flex>
        )}
        <Dropdown>
          <DropdownTrigger>
            <Flex
              onClick={() => {
                toggleTheme('dark')
                setChangeTheme(true)
              }}
              gap={8}
              align="center"
              css={{
                backgroundColor: '$gray3',
                height: '32px',
                width: '32px',
                borderRadius: '8px',
                justifyContent: 'center',
                cursor: 'pointer',
                alignItems: 'center',
              }}
            >
              <PaintBrushBroad size={18} weight="bold" />
            </Flex>
          </DropdownTrigger>
          <DropdownContent side="bottom" align="end">
            <DropdownLabel>Colors: input / button / select...</DropdownLabel>
            <Flex direction="column">
              <Flex padding="16px 16px 0 16px" gap={8} justify="around">
                <Colors
                  theme="$purple9"
                  onClick={() => changeColor('purple')}
                />
                <Colors theme="$amber9" onClick={() => changeColor('amber')} />
                <Colors theme="$blue9" onClick={() => changeColor('blue')} />
                <Colors theme="$teal9" onClick={() => changeColor('teal')} />
              </Flex>
              <Flex padding="16px 16px 0 16px" gap={8} justify="around">
                <Colors theme="$brown9" onClick={() => changeColor('brown')} />
                <Colors
                  theme="$crimson9"
                  onClick={() => changeColor('crimson')}
                />
                <Colors theme="$cyan9" onClick={() => changeColor('cyan')} />
                <Colors theme="$grass9" onClick={() => changeColor('grass')} />
              </Flex>
              <Flex padding="16px 16px 0 16px" gap={8} justify="around">
                <Colors theme="$gray9" onClick={() => changeColor('gray')} />
                <Colors theme="$green9" onClick={() => changeColor('green')} />
                <Colors
                  theme="$indigo9"
                  onClick={() => changeColor('indigo')}
                />
                <Colors theme="$lime9" onClick={() => changeColor('lime')} />
              </Flex>
              <Flex padding="16px 16px 0 16px" gap={8} justify="around">
                <Colors theme="$mint9" onClick={() => changeColor('mint')} />
                <Colors
                  theme="$orange9"
                  onClick={() => changeColor('orange')}
                />
                <Colors theme="$pink9" onClick={() => changeColor('pink')} />
                <Colors theme="$plum9" onClick={() => changeColor('plum')} />
              </Flex>
              <Flex padding="16px 16px 0 16px" gap={8} justify="around">
                <Colors theme="$red9" onClick={() => changeColor('red')} />
                <Colors theme="$sky9" onClick={() => changeColor('sky')} />
                <Colors theme="none" onClick={() => undefined} />
                <Colors theme="none" onClick={() => undefined} />
              </Flex>
              <Flex padding="32px 16px 0 16px" gap={8} direction="column">
                <Flex justify="around">
                  <LinkButton size="sm" onClick={() => undefined}>
                    Example
                  </LinkButton>

                  <Button size="sm" onClick={() => undefined}>
                    Example
                  </Button>
                </Flex>
                <TextInput
                  title="Example"
                  placeholder="Example"
                  value=""
                  onChange={() => undefined}
                />
              </Flex>
            </Flex>
          </DropdownContent>
        </Dropdown>
      </Flex>
    </Flex>
  )
}
