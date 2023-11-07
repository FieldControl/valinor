import { useEffect, useRef, useState } from 'react'

import { format } from 'date-fns'
import * as Yup from 'yup'

import { Button } from '@siakit/button'
import { Card } from '@siakit/card'
import { TextInput } from '@siakit/form-components'
import { FormHandles } from '@siakit/form-unform'
import { Flex } from '@siakit/layout'
import { LinkButton } from '@siakit/link-button'
import { Pagination } from '@siakit/pagination'
import { Rectangle } from '@siakit/shimmer'
import { Text } from '@siakit/text'

import { Empty } from '../../components/Empty'
import { getValidationErrors } from '../../helpers/getValidationErrors'
import api from '../../services/api'

export type userProps = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export type assigneeProps = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: number
}

export type assigneesProps = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: number
}[]

export type reactionsProps = {
  url: string
  total_count: number
  '+1': number
  '-1': number
  laugh: number
  hooray: number
  confused: number
  heart: number
  rocket: number
  eyes: number
}

export type issuesProps = {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: userProps
  labels: []
  state: string
  locked: boolean
  assignee: assigneeProps
  assignees: assigneesProps
  milestone: null
  comments: number
  created_at: string
  updated_at: string
  closed_at: null
  author_association: string
  active_lock_reason: null
  body: null
  reactions: reactionsProps
  timeline_url: string
  performed_via_github_app: null
  state_reason: null
  score: number
}

export function Issues() {
  const [getIssues, setGetIssues] = useState<issuesProps[]>([])
  const [showShimmer, setShowShimmer] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('node')
  const [totalCount, setTotalCount] = useState(0)
  const formRef = useRef<FormHandles>(null)
  const [searchText, setSearchText] = useState('')

  function extractRepositoryName(url: string): string | null {
    const prefixo = 'https://api.github.com/repos/'
    const indice = url.indexOf(prefixo)

    if (indice !== -1) {
      return url.slice(indice + prefixo.length)
    } else {
      return null
    }
  }

  useEffect(() => {
    async function loadIssues(): Promise<void> {
      try {
        setShowShimmer(true)
        const response = await api.get('/search/issues', {
          params: {
            page: currentPage,
            per_page: perPage,
            q: search,
          },
        })

        setGetIssues(response.data.items)
        setTotalCount(response.data.total_count)
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)

          formRef.current?.setErrors(errors)
        }
      } finally {
        setShowShimmer(false)
      }
    }

    loadIssues()
  }, [currentPage, perPage, search])

  return (
    <Flex flex direction="column">
      <Flex padding="16px" justify="end">
        <Flex width={420} gap>
          <TextInput
            placeholder="Digite aqui o nome do repositório"
            value={searchText}
            onChange={setSearchText}
          />
          <Button onClick={() => setSearch(searchText || 'node')}>
            Buscar
          </Button>
        </Flex>
      </Flex>
      {showShimmer === false ? (
        <Flex flex direction="column" overflow padding="0 16px 16px 16px" gap>
          {getIssues.length === 0 && <Empty />}
          {getIssues?.map((value) => (
            <Card
              key={value.id}
              padding
              gap={8}
              direction="column"
              flexWrap="wrap"
            >
              {value?.repository_url && (
                <LinkButton
                  onClick={() =>
                    window.open(
                      `https://github.com/${extractRepositoryName(
                        value?.repository_url,
                      )}`,
                    )
                  }
                >
                  {extractRepositoryName(value?.repository_url)}
                </LinkButton>
              )}
              <Flex gap={8} css={{ color: '$green11' }}>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  className="Octicon-sc-9kayk9-0 eHtbSv"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                </svg>
                <LinkButton
                  size="lg"
                  onClick={() => window.open(value?.html_url)}
                >
                  {value?.title}
                </LinkButton>
              </Flex>
              {value?.body && (
                <Flex>
                  <Text>
                    {(value as any)?.body
                      ?.replace(/(<([^>]+)>)/gi, '')
                      .slice(0, 218)}
                  </Text>
                  <Text>{(value as any)?.body?.length > 218 ? '...' : ''}</Text>
                </Flex>
              )}
              {value?.user && (
                <Flex gap={8}>
                  <img
                    src={value?.user?.avatar_url}
                    alt=""
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                    }}
                  />
                  <Text>{value?.user?.login}</Text>
                  <Text>.</Text>
                  <Text>
                    Opened {format(new Date(value?.created_at), 'dd-MM-yyyy')}
                  </Text>
                  <Text>.</Text>
                  <LinkButton onClick={() => window.open(value?.html_url)}>
                    #{value?.number}
                  </LinkButton>
                </Flex>
              )}
            </Card>
          ))}
          {getIssues.length !== 0 && (
            <Flex>
              <Pagination
                totalCount={totalCount}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
                perPage={perPage}
                perPageChange={(page) => {
                  setPerPage(page)
                }}
              />
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex flex direction="column" overflow padding gap>
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
          <Rectangle height="130px" width="100%" />
        </Flex>
      )}
    </Flex>
  )
}
