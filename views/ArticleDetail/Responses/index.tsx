import gql from 'graphql-tag'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _merge from 'lodash/merge'
import { withRouter, WithRouterProps } from 'next/router'
import { useEffect, useState } from 'react'
import { QueryResult } from 'react-apollo'

import { LoadMore, Spinner, Translate } from '~/components'
import { ArticleDigest } from '~/components/ArticleDigest'
import { CommentDigest } from '~/components/CommentDigest'
import EmptyResponse from '~/components/Empty/EmptyResponse'
import CommentForm from '~/components/Form/CommentForm'
import { Query } from '~/components/GQL'
import { ArticleDetailResponses } from '~/components/GQL/fragments/response'
import { ArticleResponses as ArticleResponsesType } from '~/components/GQL/queries/__generated__/ArticleResponses'
import ARTICLE_RESPONSES from '~/components/GQL/queries/articleResponses'
import { useScrollTo } from '~/components/Hook'
import { Switch } from '~/components/Switch'

import { TEXT, UrlFragments } from '~/common/enums'
import { filterResponses, getQuery, mergeConnections } from '~/common/utils'

import styles from './styles.css'

const SUBSCRIBE_RESPONSES = gql`
  subscription ArticleCommentAdded(
    $id: ID!
    $before: String
    $cursor: String
    $first: Int!
    $includeAfter: Boolean
    $includeBefore: Boolean
    $hasDescendantComments: Boolean = true
    $hasArticleDigestActionAuthor: Boolean = false
    $hasArticleDigestActionBookmark: Boolean = true
    $hasArticleDigestActionTopicScore: Boolean = false
    $articleOnly: Boolean
  ) {
    nodeEdited(input: { id: $id }) {
      id
      ... on Article {
        id
        ...ArticleDetailResponses
      }
    }
  }
  ${ArticleDetailResponses}
`

const Main: React.FC<WithRouterProps> = ({ router }) => {
  const mediaHash = getQuery({ router, key: 'mediaHash' })
  const uuid = getQuery({ router, key: 'post' })
  const [articleOnlyMode, setArticleOnlyMode] = useState<boolean>(false)

  let fragment = ''
  let before = null
  if (process.browser) {
    fragment = window.location.hash.replace('#', '')
    before = fragment === UrlFragments.COMMENTS ? null : fragment
  }

  if (!mediaHash && !uuid) {
    return <EmptyResponse articleOnlyMode={articleOnlyMode} />
  }

  const queryVariables = {
    mediaHash,
    uuid,
    before: before || undefined,
    first: before ? null : 8,
    includeBefore: !!before,
    articleOnly: articleOnlyMode
  }

  return (
    <Query
      query={ARTICLE_RESPONSES}
      variables={queryVariables}
      fetchPolicy="cache-and-network"
      errorPolicy="none"
      notifyOnNetworkStatusChange
    >
      {({
        data,
        loading,
        fetchMore,
        subscribeToMore,
        refetch
      }: QueryResult & { data: ArticleResponsesType }) => {
        if (!data || !data.article) {
          return <Spinner />
        }

        const connectionPath = 'article.responses'
        const { edges, pageInfo } = _get(data, connectionPath, {
          edges: {},
          pageInfo: {}
        })
        const loadMore = () =>
          fetchMore({
            variables: {
              cursor: pageInfo.endCursor,
              before: null,
              first: 8,
              articleOnly: articleOnlyMode
            },
            updateQuery: (previousResult, { fetchMoreResult }) =>
              mergeConnections({
                oldData: previousResult,
                newData: fetchMoreResult,
                path: connectionPath
              })
          })
        const { responseCount } = _get(data, 'article', 0)
        const responses = filterResponses(
          (edges || []).map(({ node }: { node: any }) => node)
        )

        const changeMode = () => setArticleOnlyMode(!articleOnlyMode)

        useEffect(() => {
          if (data.article.live) {
            subscribeToMore({
              document: SUBSCRIBE_RESPONSES,
              variables: {
                id: data.article.id,
                first: edges.length,
                articleOnly: articleOnlyMode
              },
              updateQuery: (prev, { subscriptionData }) =>
                _merge(prev, {
                  article: subscriptionData.data.nodeEdited
                })
            })
          }
        })

        const getScrollOptions = (param: string) => {
          switch (param) {
            case 'comments': {
              return { offset: -10 }
            }
            default: {
              return { offset: -80 }
            }
          }
        }

        useScrollTo({
          enable: !!fragment,
          selector: `#${fragment}`,
          trigger: [router],
          ...getScrollOptions(fragment)
        })

        return (
          <section className="comments" id="comments">
            <header>
              <h2>
                <Translate
                  zh_hant={TEXT.zh_hant.response}
                  zh_hans={TEXT.zh_hans.response}
                />
                <span className="count">{responseCount}</span>
              </h2>
              <div className="switch">
                <Switch
                  onChange={changeMode}
                  checked={articleOnlyMode}
                  extraClass="narrow"
                />
                <span>
                  <Translate
                    zh_hant={TEXT.zh_hant.collectedOnly}
                    zh_hans={TEXT.zh_hans.collectedOnly}
                  />
                </span>
              </div>
            </header>

            <section>
              <CommentForm
                articleId={data.article.id}
                articleMediaHash={data.article.mediaHash}
                submitCallback={refetch}
              />
            </section>

            <section className="all-comments">
              {!responses ||
                (responses.length <= 0 && (
                  <EmptyResponse articleOnlyMode={articleOnlyMode} />
                ))}
              <ul>
                {responses.map(response => (
                  <li key={response.id}>
                    {_has(response, 'title') ? (
                      <ArticleDigest.Response
                        article={response}
                        hasAuthor
                        hasBookmark
                      />
                    ) : (
                      <CommentDigest.Feed
                        comment={response}
                        hasComment
                        inArticle
                      />
                    )}
                  </li>
                ))}
              </ul>

              {pageInfo.hasNextPage && (
                <LoadMore onClick={() => loadMore()} loading={loading} />
              )}
            </section>

            <style jsx>{styles}</style>
          </section>
        )
      }}
    </Query>
  )
}

export default withRouter(Main)