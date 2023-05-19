import gql from 'graphql-tag'

import { ArticleDigestFeed, TagDigest, UserDigest } from '~/components'

export const SEARCH_AGGREGATE_ARTICLES_PUBLIC = gql`
  query SearchAggregateArticlesPublic(
    $key: String!
    $first: first_Int_min_0 = 30
    $after: String
  ) {
    search(input: { type: Article, first: $first, key: $key, after: $after }) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ... on Article {
            ...ArticleDigestFeedArticlePublic
          }
        }
      }
    }
  }
  ${ArticleDigestFeed.fragments.article.public}
`

export const SEARCH_AGGREGATE_TAGS_PUBLIC = gql`
  query SearchAggregateTagsPublic(
    $key: String!
    $first: first_Int_min_0 = 30
    $after: String
  ) {
    search(input: { type: Tag, first: $first, key: $key, after: $after }) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ... on Tag {
            ...TagDigestConciseTag
          }
        }
      }
    }
  }
  ${TagDigest.Concise.fragments.tag}
`

export const SEARCH_AGGREGATE_USERS_PUBLIC = gql`
  query SearchAggregateUsersPublic(
    $key: String!
    $first: first_Int_min_0 = 30
    $after: String
  ) {
    search(input: { type: User, first: $first, key: $key, after: $after }) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ... on User {
            ...UserDigestConciseUser
          }
        }
      }
    }
  }
  ${UserDigest.Concise.fragments.user}
`
