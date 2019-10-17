import gql from 'graphql-tag'
import _get from 'lodash/get'
import { useMutation } from 'react-apollo'
import { DraftDetailQuery_node_Draft } from '~/views/Me/DraftDetail/__generated__/DraftDetailQuery'

import { Translate } from '~/components/Language'
import { Modal } from '~/components/Modal'

import PublishSlide from './PublishSlide'
import styles from './styles.css'

/**
 * This component is for publishing modal.
 *
 * Usage:
 *
 * ```jsx
 *   <PublishModal
 *     close={close}
 *     draftId={draftId}
 *   />
 * ```
 */

interface Props extends ModalInstanceProps {
  draft: DraftDetailQuery_node_Draft
}

const PUBLISH_ARTICLE = gql`
  mutation PublishArticle($draftId: ID!) {
    publishArticle(input: { id: $draftId }) {
      id
      publishState
      scheduledAt
    }
  }
`

export const PublishModal: React.FC<Props> = ({ close, draft }) => {
  const draftId = draft.id
  const hasContent = draft.content && draft.content.length > 0
  const hasTitle = draft.title && draft.title.length > 0
  const isUnpublished = draft.publishState === 'unpublished'
  const publishable = draftId && isUnpublished && hasContent && hasTitle

  const [publish] = useMutation(PUBLISH_ARTICLE, {
    optimisticResponse: {
      publishArticle: {
        id: draftId,
        scheduledAt: new Date(Date.now() + 1000).toISOString(),
        publishState: 'pending',
        __typename: 'Draft'
      }
    }
  })

  return (
    <section>
      <Modal.Content layout="full-width" spacing="none">
        <PublishSlide />
      </Modal.Content>

      <div className="buttons">
        <Modal.FooterButton onClick={close} bgColor="white">
          <Translate zh_hant="暫存作品" zh_hans="暫存作品" />
        </Modal.FooterButton>

        <Modal.FooterButton
          disabled={!publishable}
          onClick={async () => {
            const { data } = await publish({ variables: { draftId } })
            const state = _get(
              data,
              'publishArticle.publishState',
              'unpublished'
            )

            if (state === 'pending') {
              close()
            }
          }}
        >
          <Translate zh_hant="發佈作品" zh_hans="发布作品" />
        </Modal.FooterButton>
      </div>

      <style jsx>{styles}</style>
    </section>
  )
}
