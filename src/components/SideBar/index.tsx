import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Heading } from '@siakit/heading'
import { Flex } from '@siakit/layout'
import { Text } from '@siakit/text'

import { MenuOptions } from './MenuOptions'

export function Sidebar() {
  const history = useNavigate()
  const [code, setCode] = useState<string>('')
  const [repositories, setRepositories] = useState('')
  const [issues, setIssues] = useState('')
  const [pullRequests, setPullRequests] = useState('')
  const [discussions, setDiscussions] = useState('')
  const [users, setUsers] = useState('')
  const [commits, setCommits] = useState('')
  const [packages, setPackages] = useState('')
  const [wikis, setWikis] = useState('')
  const [topics, setTopics] = useState('')
  const [marketplace, setMarketplace] = useState('')

  function ResetColors() {
    setCode('')
    setRepositories('')
    setIssues('')
    setPullRequests('')
    setDiscussions('')
    setUsers('')
    setCommits('')
    setPackages('')
    setWikis('')
    setTopics('')
    setMarketplace('')
  }

  return (
    <Flex direction="column" flex padding>
      <Flex padding="0 16px 8px 0">
        <Heading size="xs">Filter by</Heading>
      </Flex>
      <Flex>
        <Flex direction="column" flex>
          <MenuOptions
            disabled
            color={code}
            event={code !== ''}
            onClick={() => {
              history('/code')
              ResetColors()
              setCode('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>
            </svg>
            <Text>Code</Text>
          </MenuOptions>
          <MenuOptions
            disabled={false}
            color={repositories}
            event={repositories !== ''}
            onClick={() => {
              history('/repositories')
              ResetColors()
              setRepositories('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            <Text>Repositories</Text>
          </MenuOptions>
          <MenuOptions
            disabled={false}
            color={issues}
            event={issues !== ''}
            onClick={() => {
              history('/issues')
              ResetColors()
              setIssues('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
            </svg>
            <Text>Issues</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={pullRequests}
            event={pullRequests !== ''}
            onClick={() => {
              history('/pullrequests')
              ResetColors()
              setPullRequests('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
            </svg>
            <Text>Pull requests</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={discussions}
            event={discussions !== ''}
            onClick={() => {
              history('/discussions')
              ResetColors()
              setDiscussions('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm13 2a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.458 1.458 0 0 1-2.487 1.03L9.22 12.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.22 2.22v-2.19a.75.75 0 0 1 .75-.75h1a.25.25 0 0 0 .25-.25Z"></path>
            </svg>
            <Text>Discussions</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={users}
            event={users !== ''}
            onClick={() => {
              history('/users')
              ResetColors()
              setUsers('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"></path>
            </svg>
            <Text>Users</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={commits}
            event={commits !== ''}
            onClick={() => {
              history('/commits')
              ResetColors()
              setCommits('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path>
            </svg>
            <Text>Commits</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={packages}
            event={packages !== ''}
            onClick={() => {
              history('/registrypackages')
              ResetColors()
              setPackages('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"></path>
            </svg>
            <Text>Packages</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={wikis}
            event={wikis !== ''}
            onClick={() => {
              history('/wikis')
              ResetColors()
              setWikis('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"></path>
            </svg>
            <Text>Wikis</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={topics}
            event={topics !== ''}
            onClick={() => {
              history('/topics')
              ResetColors()
              setTopics('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M7.75 0a.75.75 0 0 1 .75.75V3h3.634c.414 0 .814.147 1.13.414l2.07 1.75a1.75 1.75 0 0 1 0 2.672l-2.07 1.75a1.75 1.75 0 0 1-1.13.414H8.5v5.25a.75.75 0 0 1-1.5 0V10H2.75A1.75 1.75 0 0 1 1 8.25v-3.5C1 3.784 1.784 3 2.75 3H7V.75A.75.75 0 0 1 7.75 0Zm4.384 8.5a.25.25 0 0 0 .161-.06l2.07-1.75a.248.248 0 0 0 0-.38l-2.07-1.75a.25.25 0 0 0-.161-.06H2.75a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h9.384Z"></path>
            </svg>
            <Text>Topics</Text>
          </MenuOptions>
          <MenuOptions
            disabled
            color={marketplace}
            event={marketplace !== ''}
            onClick={() => {
              history('/marketplace')
              ResetColors()
              setMarketplace('$gray3')
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              className="Octicon-sc-9kayk9-0 gnpiwr"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M14.184 1.143v-.001l1.422 2.464a1.75 1.75 0 0 1-.757 2.451L3.104 11.713a1.75 1.75 0 0 1-2.275-.702l-.447-.775a1.75 1.75 0 0 1 .53-2.32L11.682.573a1.748 1.748 0 0 1 2.502.57Zm-4.709 9.32h-.001l2.644 3.863a.75.75 0 1 1-1.238.848l-1.881-2.75v2.826a.75.75 0 0 1-1.5 0v-2.826l-1.881 2.75a.75.75 0 1 1-1.238-.848l2.049-2.992a.746.746 0 0 1 .293-.253l1.809-.87a.749.749 0 0 1 .944.252ZM9.436 3.92h-.001l-4.97 3.39.942 1.63 5.42-2.61Zm3.091-2.108h.001l-1.85 1.26 1.505 2.605 2.016-.97a.247.247 0 0 0 .13-.151.247.247 0 0 0-.022-.199l-1.422-2.464a.253.253 0 0 0-.161-.119.254.254 0 0 0-.197.038ZM1.756 9.157a.25.25 0 0 0-.075.33l.447.775a.25.25 0 0 0 .325.1l1.598-.769-.83-1.436-1.465 1Z"></path>
            </svg>
            <Text>Marketplace</Text>
          </MenuOptions>
        </Flex>
      </Flex>
    </Flex>
  )
}
