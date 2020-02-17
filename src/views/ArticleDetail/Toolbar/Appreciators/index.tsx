import gql from 'graphql-tag'
import _get from 'lodash/get'

import { Translate } from '~/components'
import { Avatar } from '~/components/Avatar'

import { numAbbr } from '~/common/utils'

import AppreciatorsDialog from './AppreciatorsDialog'
import styles from './styles.css'

import { AppreciatorsArticle } from './__generated__/AppreciatorsArticle'

const fragments = {
  article: gql`
    fragment AppreciatorsArticle on Article {
      id
      appreciationsReceived(input: { first: 5 }) {
        totalCount
        edges {
          cursor
          node {
            ... on Transaction {
              sender {
                id
                userName
                displayName
                ...AvatarUser
              }
            }
          }
        }
      }
    }
    ${Avatar.fragments.user}
  `
}

const Appreciators = ({ article }: { article: AppreciatorsArticle }) => {
  const edges = article.appreciationsReceived.edges
  const count = numAbbr(article.appreciationsReceived.totalCount)

  if (!edges || edges.length <= 0) {
    return null
  }

  return (
    <AppreciatorsDialog count={count}>
      {({ open }) => (
        <button
          type="button"
          className="container"
          aria-label="查看所有讚賞者"
          onClick={open}
        >
          <section className="avatar-list">
            {edges
              .slice(0, 5)
              .map(
                ({ node, cursor }) =>
                  node.sender && (
                    <Avatar user={node.sender} size="md" key={cursor} />
                  )
              )}
          </section>
          <section className="name-list">
            <p>
              {edges
                .slice(0, 3)
                .map(({ node }) => node.sender?.displayName)
                .join('、')}
            </p>

            <p className="highlight">
              <Translate
                zh_hant={`等 ${count} 人贊賞了作品`}
                zh_hans={`等 ${count} 人赞赏了作品`}
              />
            </p>
          </section>

          <style jsx>{styles}</style>
        </button>
      )}
    </AppreciatorsDialog>
  )
}

Appreciators.fragments = fragments

export default Appreciators
