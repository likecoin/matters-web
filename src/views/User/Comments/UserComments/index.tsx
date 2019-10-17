import gql from 'graphql-tag'
import _get from 'lodash/get'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from 'react-apollo'

import { Head, Icon, InfiniteScroll, Placeholder } from '~/components'
import { CommentDigest } from '~/components/CommentDigest'
import EmptyComment from '~/components/Empty/EmptyComment'

import {
  filterComments,
  getQuery,
  mergeConnections,
  toPath
} from '~/common/utils'
import IMAGE_LOGO_192 from '~/static/icon-192x192.png?url'
import ICON_CHEVRON_RIGHT from '~/static/icons/chevron-right.svg?sprite'

import { UserCommentFeed } from './__generated__/UserCommentFeed'
import { UserIdUser } from './__generated__/UserIdUser'
import styles from './styles.css'

const USER_ID = gql`
  query UserIdUser($userName: String!) {
    user(input: { userName: $userName }) {
      id
      displayName
      info {
        description
      }
    }
  }
`
const USER_COMMENT_FEED = gql`
  query UserCommentFeed(
    $id: ID!
    $after: String
    $hasDescendantComments: Boolean = false
  ) {
    node(input: { id: $id }) {
      ... on User {
        id
        commentedArticles(input: { first: 5, after: $after }) {
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              title
              slug
              author {
                id
                userName
              }
              mediaHash
              comments(input: { filter: { author: $id }, first: null }) {
                edges {
                  cursor
                  node {
                    ...FeedDigestComment
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${CommentDigest.Feed.fragments.comment}
`

const UserCommentsWrap = () => {
  const router = useRouter()
  const userName = getQuery({ router, key: 'userName' })

  const { data, loading } = useQuery<UserIdUser>(USER_ID, {
    variables: { userName }
  })

  if (loading) {
    return <Placeholder.ArticleDigestList />
  }

  if (!data || !data.user) {
    return null
  }

  return (
    <>
      <Head
        title={{
          zh_hant: `${data.user.displayName}發表的評論`,
          zh_hans: `${data.user.displayName}发表的评论`
        }}
        description={data.user.info.description}
        image={IMAGE_LOGO_192}
      />
      <UserComments user={data.user} />
    </>
  )
}

const UserComments = ({ user }: UserIdUser) => {
  if (!user || !user.id) {
    return null
  }

  const { data, loading, fetchMore } = useQuery<UserCommentFeed>(
    USER_COMMENT_FEED,
    {
      variables: { id: user.id }
    }
  )

  if (loading) {
    return <Placeholder.ArticleDigestList />
  }

  const connectionPath = 'node.commentedArticles'
  const { edges, pageInfo } =
    (data &&
      data.node &&
      data.node.__typename === 'User' &&
      data.node.commentedArticles &&
      data.node.commentedArticles) ||
    {}

  if (!edges || edges.length <= 0 || !pageInfo) {
    return <EmptyComment />
  }

  const loadMore = () =>
    fetchMore({
      variables: {
        after: pageInfo.endCursor
      },
      updateQuery: (previousResult, { fetchMoreResult }) =>
        mergeConnections({
          oldData: previousResult,
          newData: fetchMoreResult,
          path: connectionPath
        })
    })

  return (
    <InfiniteScroll hasNextPage={pageInfo.hasNextPage} loadMore={loadMore}>
      <ul className="article-list">
        {edges.map(articleEdge => {
          const commentEdges = articleEdge.node.comments.edges

          if (!commentEdges) {
            return null
          }

          const articlePath = toPath({
            page: 'articleDetail',
            userName: articleEdge.node.author.userName || '',
            slug: articleEdge.node.slug,
            mediaHash: articleEdge.node.mediaHash || ''
          })
          const filteredComments = filterComments(
            (commentEdges || []).map(({ node }) => node)
          )

          return (
            <li key={articleEdge.cursor} className="article-item">
              <Link {...articlePath}>
                <a>
                  <h3>
                    {articleEdge.node.title}
                    <Icon
                      id={ICON_CHEVRON_RIGHT.id}
                      viewBox={ICON_CHEVRON_RIGHT.viewBox}
                      style={{ width: 12, height: 12 }}
                    />
                  </h3>
                </a>
              </Link>

              <ul className="comment-list">
                {filteredComments &&
                  filteredComments.map(comment => (
                    <li key={comment.id}>
                      <CommentDigest.Feed comment={comment} hasLink />
                    </li>
                  ))}
              </ul>
            </li>
          )
        })}

        <style jsx>{styles}</style>
      </ul>
    </InfiniteScroll>
  )
}

export default UserCommentsWrap
