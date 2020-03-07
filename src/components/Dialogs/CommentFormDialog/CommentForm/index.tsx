import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Button, Dialog, Spinner, Translate } from '~/components'
import { useMutation } from '~/components/GQL'
import CLIENT_PREFERENCE from '~/components/GQL/queries/clientPreference'

import { ADD_TOAST, ANALYTICS_EVENTS, TEXT } from '~/common/enums'
import { analytics, dom, subscribePush, trimLineBreaks } from '~/common/utils'

import styles from './styles.css'

import { ClientPreference } from '~/components/GQL/queries/__generated__/ClientPreference'
import { CommentDraft } from './__generated__/CommentDraft'
import { PutComment } from './__generated__/PutComment'

const CommentEditor = dynamic(() => import('~/components/Editor/Comment'), {
  ssr: false,
  loading: Spinner
})

export const PUT_COMMENT = gql`
  mutation PutComment($input: PutCommentInput!) {
    putComment(input: $input) {
      id
      content
    }
  }
`

const COMMENT_DRAFT = gql`
  query CommentDraft($id: ID!) {
    commentDraft(input: { id: $id }) @client(always: true) {
      id
      content
    }
  }
`

export interface CommentFormProps {
  commentId?: string
  articleId: string
  replyToId?: string
  parentId?: string

  defaultContent?: string | null
  submitCallback?: () => void
  closeDialog: () => void
  title?: React.ReactNode
  context?: React.ReactNode
}

const CommentForm: React.FC<CommentFormProps> = ({
  commentId,
  articleId,
  replyToId,
  parentId,

  defaultContent,
  submitCallback,
  closeDialog,
  title = <Translate id="putComment" />,
  context
}) => {
  const commentDraftId = `${articleId}:${commentId || 0}:${parentId ||
    0}:${replyToId || 0}`
  const formId = `comment-form-${commentDraftId}`

  const { data, client } = useQuery<CommentDraft>(COMMENT_DRAFT, {
    variables: { id: commentDraftId }
  })
  const { data: clientPreferenceData } = useQuery<ClientPreference>(
    CLIENT_PREFERENCE
  )

  const [putComment] = useMutation<PutComment>(PUT_COMMENT)
  const [isSubmitting, setSubmitting] = useState(false)
  const [content, setContent] = useState(
    data?.commentDraft.content || defaultContent || ''
  )

  const isValid = !!trimLineBreaks(content)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const mentions = dom.getAttributes('data-id', content)
    const input = {
      id: commentId,
      comment: {
        content: trimLineBreaks(content),
        replyTo: replyToId,
        articleId,
        parentId,
        mentions
      }
    }

    const push = clientPreferenceData?.clientPreference.push
    const skipPushButton = !push || !push.supported || push.enabled

    event.preventDefault()
    setSubmitting(true)

    try {
      await putComment({ variables: { input } })
      setContent('')
      closeDialog()

      window.dispatchEvent(
        new CustomEvent(ADD_TOAST, {
          detail: {
            color: 'green',
            content: skipPushButton ? (
              <Translate zh_hant="評論已送出" zh_hans="评论已送出" />
            ) : (
              <Translate id="pushDescription" />
            ),
            customButton: !skipPushButton && (
              <Button onClick={subscribePush}>
                <Translate id="confirmPush" />
              </Button>
            ),
            buttonPlacement: 'center'
          }
        })
      )

      if (submitCallback) {
        submitCallback()
      }
    } catch (e) {
      console.error(e)
    }

    setSubmitting(false)
  }

  const onUpdate = ({ content: newContent }: { content: string }) => {
    setContent(newContent)

    client.writeData({
      id: `CommentDraft:${commentDraftId}`,
      data: { content: newContent }
    })
  }

  return (
    <>
      <Dialog.Header
        title={title}
        close={closeDialog}
        rightButton={
          <Dialog.Header.RightButton
            type="submit"
            form={formId}
            disabled={isSubmitting || !isValid}
            text={<Translate zh_hant="送出" zh_hans="送出" />}
            loading={isSubmitting}
          />
        }
      />

      <Dialog.Content hasGrow>
        {context && <section className="context">{context}</section>}

        <form
          id={formId}
          onSubmit={handleSubmit}
          onFocus={() => {
            analytics.trackEvent(ANALYTICS_EVENTS.COMMENT_EDITOR_CHANGE, {
              state: 'focus',
              level: parentId ? 2 : 1,
              operation: commentId ? 'edit' : 'create'
            })
          }}
          onBlur={() => {
            analytics.trackEvent(ANALYTICS_EVENTS.COMMENT_EDITOR_CHANGE, {
              state: 'blur',
              level: parentId ? 2 : 1,
              operation: commentId ? 'update' : 'create'
            })
          }}
          aria-label={TEXT.zh_hant.putComment}
        >
          <CommentEditor content={content} update={onUpdate} />
        </form>
      </Dialog.Content>

      <style jsx>{styles}</style>
    </>
  )
}

export default CommentForm