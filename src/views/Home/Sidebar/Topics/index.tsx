import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'

import { Label, Placeholder, Translate } from '~/components'
import { ArticleDigest } from '~/components/ArticleDigest'
import { QueryError } from '~/components/GQL'

import { ANALYTICS_EVENTS, FEED_TYPE, TEXT } from '~/common/enums'
import { analytics } from '~/common/utils'

import ViewAllLink from '../ViewAllLink'
import { SidebarTopics } from './__generated__/SidebarTopics'
import styles from './styles.css'

export const SIDEBAR_TOPICS = gql`
  query SidebarTopics(
    $hasArticleDigestActionAuthor: Boolean = false
    $hasArticleDigestActionBookmark: Boolean = false
    $hasArticleDigestCover: Boolean = false
    $hasArticleDigestActionTopicScore: Boolean = true
  ) {
    viewer {
      id
      recommendation {
        topics(input: { first: 5 }) {
          edges {
            cursor
            node {
              ...SidebarDigestArticle
            }
          }
        }
      }
    }
  }
  ${ArticleDigest.Sidebar.fragments.article}
`

const Topics = () => {
  const { data, loading, error } = useQuery<SidebarTopics>(SIDEBAR_TOPICS)
  const edges = data && data.viewer && data.viewer.recommendation.topics.edges

  if (loading) {
    return <Placeholder.Sidebar />
  }

  if (error) {
    return <QueryError error={error} />
  }

  if (!edges || edges.length <= 0) {
    return null
  }

  return (
    <>
      <header>
        <Label>
          <Translate
            zh_hant={TEXT.zh_hant.hotTopics}
            zh_hans={TEXT.zh_hans.hotTopics}
          />
        </Label>
        <ViewAllLink type="topics" />
      </header>

      <ol>
        {edges
          .filter(({ node }) => !!node.mediaHash)
          .map(({ node, cursor }, i) => (
            <li
              key={cursor}
              onClick={() =>
                analytics.trackEvent(ANALYTICS_EVENTS.CLICK_FEED, {
                  type: FEED_TYPE.TOPICS,
                  location: i
                })
              }
            >
              <ArticleDigest.Sidebar article={node} hasTopicScore />
            </li>
          ))}
      </ol>

      <style jsx>{styles}</style>
    </>
  )
}

export default Topics