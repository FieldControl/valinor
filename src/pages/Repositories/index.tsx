import { useEffect, useRef, useState } from 'react'

import { format } from 'date-fns'
import { Eye, GitFork, Star } from 'phosphor-react'
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
import { Tooltip } from '@siakit/tooltip'

import { Empty } from '../../components/Empty'
import { getValidationErrors } from '../../helpers/getValidationErrors'
import api from '../../services/api'
import { LanguageValidation } from './Language'

export type licenseProps = {
  key: string
  name: string
  node_id: string
  spdx_id: string
  url: string
}

export type ownerProps = {
  avatar_url: string
  events_url: string
  followers_url: string
  following_url: string
  gists_url: string
  gravatar_id: string
  html_url: string
  id: number
  login: string
  node_id: string
  organizations_url: string
  received_events_url: string
  repos_url: string
  site_admin: boolean
  starred_url: string
  subscriptions_url: string
  type: string
  url: string
}

export type gitProps = {
  allow_forking: boolean
  archive_url: string
  archived: boolean
  assignees_url: string
  blobs_url: string
  branches_url: string
  clone_url: string
  collaborators_url: string
  comments_url: string
  commits_url: string
  compare_url: string
  contents_url: string
  contributors_url: string
  created_at: string
  default_branch: string
  deployments_url: string
  description: string
  disabled: boolean
  downloads_url: string
  events_url: string
  fork: boolean
  forks: number
  forks_count: number
  forks_url: string
  full_name: string
  git_commits_url: string
  git_refs_url: string
  git_tags_url: string
  git_url: string
  has_discussions: boolean
  has_downloads: boolean
  has_issues: boolean
  has_pages: boolean
  has_projects: boolean
  has_wiki: boolean
  homepage: string
  hooks_url: string
  html_url: string
  id: number
  is_template: boolean
  issue_comment_url: string
  issue_events_url: string
  issues_url: string
  keys_url: string
  labels_url: string
  language: string
  languages_url: string
  license: licenseProps
  merges_url: string
  milestones_url: string
  mirror_url: null
  name: string
  node_id: string
  notifications_url: string
  open_issues: number
  open_issues_count: number
  owner: ownerProps
  private: boolean
  pulls_url: string
  pushed_at: string
  releases_url: string
  score: number
  size: number
  ssh_url: string
  stargazers_count: number
  stargazers_url: string
  statuses_url: string
  subscribers_url: string
  subscription_url: string
  svn_url: string
  tags_url: string
  teams_url: string
  topics: []
  trees_url: string
  updated_at: string
  url: string
  visibility: string
  watchers: number
  watchers_count: number
  web_commit_signoff_required: boolean
}

export function Repositories() {
  const formRef = useRef<FormHandles>(null)
  const [getData, setGetData] = useState<gitProps[]>([])
  const [showShimmer, setShowShimmer] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('bootstrap')
  const [searchText, setSearchText] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  function formatarNumero(numero: number) {
    if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    } else {
      return numero.toString()
    }
  }

  useEffect(() => {
    async function loadGit(): Promise<void> {
      try {
        setShowShimmer(true)
        const response = await api.get('/search/repositories', {
          params: {
            page: currentPage,
            per_page: perPage,
            q: search,
          },
        })
        setGetData(response.data.items)
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

    loadGit()
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
          <Button onClick={() => setSearch(searchText || 'bootstrap')}>
            Buscar
          </Button>
        </Flex>
      </Flex>
      {showShimmer === false ? (
        <Flex flex direction="column" overflow padding="0 16px 16px 16px" gap>
          {getData.length === 0 && <Empty />}
          {getData?.map((value) => (
            <Card
              key={value.id}
              padding
              gap={8}
              direction="column"
              flexWrap="wrap"
            >
              <Flex gap>
                <img
                  src={value?.owner?.avatar_url}
                  alt=""
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                  }}
                />
                <LinkButton
                  size="lg"
                  onClick={() => window.open(value?.html_url)}
                >
                  {value?.full_name}
                </LinkButton>
              </Flex>
              <Tooltip align="center" content="Description">
                <Flex>
                  <Text>
                    {value?.description
                      ?.replace(/(<([^>]+)>)/gi, '')
                      .slice(0, 138)}
                  </Text>
                  <Text>{value?.description?.length > 138 ? '...' : ''}</Text>
                </Flex>
              </Tooltip>

              {value?.topics.length > 0 && (
                <Flex gap={8} flexWrap="wrap">
                  {value?.topics?.map((button) => (
                    <Button
                      css={{ borderRadius: '20px' }}
                      size="sm"
                      key={0}
                      onClick={() =>
                        window.open(`https://github.com/topics/${button}`)
                      }
                    >
                      {button}
                    </Button>
                  ))}
                </Flex>
              )}
              <Flex gap align="center">
                {value?.language && (
                  <Flex>
                    <LanguageValidation language={value?.language} />
                  </Flex>
                )}
                <Tooltip content="Stars">
                  <Flex
                    gap={4}
                    align="baseline"
                    css={{
                      color: '$primary11',
                    }}
                  >
                    <Star size={14} />
                    <LinkButton
                      onClick={() =>
                        window.open(
                          `https://github.com/${value?.full_name}/stargazers`,
                        )
                      }
                    >
                      <Flex>{formatarNumero(value?.stargazers_count)}</Flex>
                    </LinkButton>
                  </Flex>
                </Tooltip>

                {value?.forks_count > 1 && (
                  <>
                    <Text>.</Text>
                    <Tooltip content="Forks">
                      <Flex gap={4} align="baseline">
                        <GitFork size={14} />
                        <Text>{value?.forks}</Text>
                      </Flex>
                    </Tooltip>
                  </>
                )}
                {value?.watchers_count >= 1 && (
                  <>
                    <Text>.</Text>
                    <Tooltip content="Watchers">
                      <Flex gap={4} align="baseline">
                        <Eye size={14} />
                        <Text>{value?.watchers_count}</Text>
                      </Flex>
                    </Tooltip>
                  </>
                )}
                <Text>.</Text>
                <Flex gap={4}>
                  <Text size="xs">Updated on</Text>
                  <Text size="xs">
                    {format(new Date(value?.updated_at), 'dd-MM-yyyy')}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))}
          {getData.length !== 0 && (
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
