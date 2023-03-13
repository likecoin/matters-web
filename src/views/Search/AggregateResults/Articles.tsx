import { useEffect } from 'react'

import {
  LATER_SEARCH_RESULTS_LENGTH,
  MAX_SEARCH_RESULTS_LENGTH,
} from '~/common/enums'
import { analytics, mergeConnections } from '~/common/utils'
import {
  ArticleDigestFeed,
  EmptySearch,
  InfiniteScroll,
  List,
  Spinner,
  Translate,
  usePublicQuery,
  useRoute,
} from '~/components'
import { SearchAggregateArticlesPublicQuery } from '~/gql/graphql'

import EndOfResults from './EndOfResults'
import { SEARCH_AGGREGATE_ARTICLES_PUBLIC } from './gql'
import styles from './styles.css'

const AggregateArticleResults = () => {
  const { getQuery } = useRoute()
  const q = getQuery('q')
  // TODO: Just test for team, will be removed when release
  const version = getQuery('version')
  const coefficients = getQuery('coefficients')

  /**
   * Data Fetching
   */
  // public data
  const { data, loading, fetchMore } =
    usePublicQuery<SearchAggregateArticlesPublicQuery>(
      SEARCH_AGGREGATE_ARTICLES_PUBLIC,
      {
        variables: {
          key: q,
          version: version === '' ? undefined : version,
          coefficients: coefficients === '' ? undefined : coefficients,
        },
      }
    )

  useEffect(() => {
    analytics.trackEvent('load_more', {
      type: 'search_article',
      location: 0,
    })
  }, [])

  // pagination
  const connectionPath = 'search'
  const { edges, pageInfo } = data?.search || {}

  /**
   * Render
   */
  if (loading) {
    return <Spinner />
  }

  if (!edges || edges.length <= 0 || !pageInfo) {
    return (
      <EmptySearch
        description={
          <Translate
            zh_hant="沒有找到相關文章，換個關鍵詞試試？"
            zh_hans="没有找到相关文章，换个关键词试试？"
            en="No articles found. Try a different keyword?"
          />
        }
      />
    )
  }

  // load next page
  const loadMore = () => {
    analytics.trackEvent('load_more', {
      type: 'search_article',
      location: edges?.length || 0,
    })

    return fetchMore({
      variables: {
        first:
          edges.length === MAX_SEARCH_RESULTS_LENGTH - 10
            ? 10
            : LATER_SEARCH_RESULTS_LENGTH,
        after: pageInfo?.endCursor,
      },
      updateQuery: (previousResult, { fetchMoreResult }) =>
        mergeConnections({
          oldData: previousResult,
          newData: fetchMoreResult,
          path: connectionPath,
        }),
    })
  }

  return (
    <section className="aggregate-section">
      <InfiniteScroll
        hasNextPage={
          pageInfo.hasNextPage && edges.length < MAX_SEARCH_RESULTS_LENGTH
        }
        loadMore={loadMore}
      >
        <List>
          {edges.map(
            ({ node, cursor }, i) =>
              node.__typename === 'Article' && (
                <List.Item key={cursor + node.id}>
                  <ArticleDigestFeed
                    article={node}
                    is="link"
                    isConciseFooter={true}
                    hasCircle={false}
                    hasFollow={false}
                    onClick={() =>
                      analytics.trackEvent('click_feed', {
                        type: 'search_article',
                        contentType: 'article',
                        location: i,
                        id: node.id,
                      })
                    }
                    onClickAuthor={() => {
                      analytics.trackEvent('click_feed', {
                        type: 'search_article',
                        contentType: 'user',
                        location: i,
                        id: node.author.id,
                      })
                    }}
                  />
                </List.Item>
              )
          )}
        </List>
      </InfiniteScroll>
      {(!pageInfo.hasNextPage || edges.length >= MAX_SEARCH_RESULTS_LENGTH) && (
        <EndOfResults />
      )}
      <style jsx>{styles}</style>
    </section>
  )
}

export default AggregateArticleResults
