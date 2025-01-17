import { useFormik } from 'formik'
import _pickBy from 'lodash/pickBy'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import CIRCLE_COVER from '@/public/static/images/circle-cover.svg'
import {
  ASSET_TYPE,
  ENTITY_TYPE,
  MAX_CIRCLE_DISPLAY_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '~/common/enums'
import {
  parseFormSubmitErrors,
  toPath,
  validateCircleDisplayName,
  validateDescription,
} from '~/common/utils'
import {
  AvatarUploader,
  CoverUploader,
  Dialog,
  Form,
  LanguageContext,
  Layout,
  toast,
  useMutation,
} from '~/components'
import PUT_CIRCLE from '~/components/GQL/mutations/putCircle'
import { PutCircleMutation } from '~/gql/graphql'

import styles from './styles.module.css'

interface FormProps {
  circle: Pick<
    PutCircleMutation['putCircle'],
    'id' | 'avatar' | 'cover' | 'displayName' | 'description' | '__typename'
  >
  type: 'edit' | 'create'
  purpose: 'dialog' | 'page'
  closeDialog?: () => void
}

interface FormValues {
  avatar: string | null
  cover: string | null
  displayName: string
  description: string
}

/**
 * To identify `cover` is changed since it may be `null`
 */
const UNCHANGED_FIELD = 'UNCHANGED_FIELD'

const Init: React.FC<FormProps> = ({ circle, type, purpose, closeDialog }) => {
  const router = useRouter()
  const [update] = useMutation<PutCircleMutation>(PUT_CIRCLE, undefined, {
    showToast: false,
  })
  const { lang } = useContext(LanguageContext)
  const isInPage = purpose === 'page'

  const isCreate = type === 'create'
  const formId = 'edit-circle-profile-form'
  const titleId = isCreate ? 'circleCreation' : 'basicProfile'

  const intl = useIntl()
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = useFormik<FormValues>({
    initialValues: {
      avatar: UNCHANGED_FIELD,
      cover: UNCHANGED_FIELD,
      displayName: circle.displayName || '',
      description: circle.description || '',
    },
    validateOnBlur: false,
    validateOnChange: false,
    validate: ({ displayName, description }) =>
      _pickBy({
        displayName: !isCreate
          ? validateCircleDisplayName(displayName, lang)
          : undefined,
        description: validateDescription(description, lang),
      }),
    onSubmit: async (
      { avatar, cover, displayName, description },
      { setSubmitting, setFieldError }
    ) => {
      try {
        const { data } = await update({
          variables: {
            input: {
              id: circle.id,
              ...(avatar !== UNCHANGED_FIELD ? { avatar } : {}),
              ...(cover !== UNCHANGED_FIELD ? { cover } : {}),
              ...(!isCreate ? { displayName } : {}),
              description,
            },
          },
        })

        toast.success({
          message: isCreate ? (
            <FormattedMessage
              defaultMessage="Circle successfully created"
              description="src/components/Forms/CreateCircleForm/Profile.tsx"
            />
          ) : (
            <FormattedMessage defaultMessage="Saved" />
          ),
        })

        if (data?.putCircle) {
          const path = toPath({ page: 'circleDetail', circle: data.putCircle })
          router.push(path.href)
        }

        setSubmitting(false)

        if (closeDialog) {
          closeDialog()
        }
      } catch (error) {
        setSubmitting(false)

        const [messages, codes] = parseFormSubmitErrors(error as any, lang)
        setFieldError('description', messages[codes[0]])
      }
    },
  })

  const InnerForm = (
    <Form id={formId} onSubmit={handleSubmit}>
      <section className={styles.coverField}>
        <CoverUploader
          type="circle"
          assetType={ASSET_TYPE.circleCover}
          cover={circle.cover}
          fallbackCover={CIRCLE_COVER}
          inEditor
          onUpload={(assetId) => setFieldValue('cover', assetId)}
          entityType={ENTITY_TYPE.user}
          entityId={circle.id}
        />

        <p className={styles.hint}>
          <FormattedMessage defaultMessage="Recommended size: 1600px x 900px" />
        </p>
      </section>

      <section className={styles.avatarField}>
        <AvatarUploader
          type="circle"
          circle={circle}
          onUpload={(assetId) => setFieldValue('avatar', assetId)}
          entityId={circle.id}
        />
      </section>

      {!isCreate && (
        <Form.Input
          label={<FormattedMessage defaultMessage="Circle Name" />}
          hasLabel
          type="text"
          name="displayName"
          required
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter the name of your Circle',
          })}
          value={values.displayName}
          hint={`${values.displayName.length}/${MAX_CIRCLE_DISPLAY_NAME_LENGTH}`}
          error={touched.displayName && errors.displayName}
          hintAlign={
            touched.displayName && errors.displayName ? 'left' : 'right'
          }
          maxLength={MAX_CIRCLE_DISPLAY_NAME_LENGTH}
          onBlur={handleBlur}
          onChange={handleChange}
          spacingBottom="base"
        />
      )}

      <Form.Textarea
        label={
          <FormattedMessage
            defaultMessage="Circle Description"
            description="src/components/Forms/CreateCircleForm/Profile.tsx"
          />
        }
        hasLabel
        name="description"
        required
        placeholder={intl.formatMessage({
          defaultMessage: 'Describe more about your Circle',
          description: 'src/components/Forms/CreateCircleForm/Profile.tsx',
        })}
        value={values.description}
        hint={`${values.description.length}/${MAX_DESCRIPTION_LENGTH}`}
        error={touched.description && errors.description}
        hintAlign={touched.description && errors.description ? 'left' : 'right'}
        maxLength={MAX_DESCRIPTION_LENGTH}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </Form>
  )

  const SubmitButton = (
    <Dialog.TextButton
      type="submit"
      form={formId}
      disabled={isSubmitting}
      text={<FormattedMessage defaultMessage="Confirm" />}
      loading={isSubmitting}
    />
  )

  if (isInPage) {
    return (
      <>
        <Layout.Header
          left={<Layout.Header.Title id={titleId} />}
          right={
            <>
              <span />
              <Layout.Header.RightButton
                type="submit"
                form={formId}
                disabled={isSubmitting}
                text={<FormattedMessage defaultMessage="Confirm" />}
                loading={isSubmitting}
              />
            </>
          }
        />

        <Layout.Main.Spacing>{InnerForm}</Layout.Main.Spacing>
      </>
    )
  }

  return (
    <>
      <Dialog.Header
        title={titleId}
        closeDialog={closeDialog}
        rightBtn={SubmitButton}
      />

      <Dialog.Content>{InnerForm}</Dialog.Content>

      <Dialog.Footer
        smUpBtns={
          <>
            <Dialog.TextButton
              text={<FormattedMessage defaultMessage="Cancel" />}
              color="greyDarker"
              onClick={closeDialog}
            />

            {SubmitButton}
          </>
        }
      />
    </>
  )
}

export default Init
