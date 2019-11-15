import { useFormik } from 'formik'
import _isEmpty from 'lodash/isEmpty'
import { useContext } from 'react'

import { Form } from '~/components/Form'
import SendCodeButton from '~/components/Form/Button/SendCode'
import { getErrorCodes, useMutation } from '~/components/GQL'
import { ConfirmVerificationCode } from '~/components/GQL/mutations/__generated__/ConfirmVerificationCode'
import { CONFIRM_CODE } from '~/components/GQL/mutations/verificationCode'
import { LanguageContext, Translate } from '~/components/Language'
import { Modal } from '~/components/Modal'

import { TEXT } from '~/common/enums'
import { translate, validateCode, validateEmail } from '~/common/utils'

import styles from './styles.css'

interface FormProps {
  defaultEmail: string
  submitCallback?: (params: any) => void
}

interface FormValues {
  email: string
  code: string
}

export const EmailChangeRequestForm: React.FC<FormProps> = ({
  defaultEmail = '',
  submitCallback
}) => {
  const [confirmCode] = useMutation<ConfirmVerificationCode>(CONFIRM_CODE)
  const { lang } = useContext(LanguageContext)
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting
  } = useFormik<FormValues>({
    initialValues: {
      email: defaultEmail,
      code: ''
    },
    validate: ({ email, code }) => {
      const isInvalidEmail = validateEmail(email, lang)
      const isInvalidCode = validateCode(code, lang)
      return {
        ...(isInvalidEmail ? { email: isInvalidEmail } : {}),
        ...(isInvalidCode ? { code: isInvalidCode } : {})
      }
    },
    onSubmit: async ({ email, code }, { setFieldError, setSubmitting }) => {
      try {
        const { data } = await confirmCode({
          variables: { input: { email, type: 'email_reset', code } }
        })
        const confirmVerificationCode = data && data.confirmVerificationCode

        if (submitCallback && confirmVerificationCode) {
          submitCallback({ codeId: confirmVerificationCode })
        }
      } catch (error) {
        const errorCode = getErrorCodes(error)[0]
        const errorMessage = translate({
          zh_hant: TEXT.zh_hant.error[errorCode] || errorCode,
          zh_hans: TEXT.zh_hans.error[errorCode] || errorCode,
          lang
        })

        if (errorCode.indexOf('CODE_') >= 0) {
          setFieldError('code', errorMessage)
        } else {
          setFieldError('email', errorMessage)
        }
      }

      setSubmitting(false)
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Content>
        <Form.Input
          type="email"
          field="email"
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
          disabled
        />
        <Form.Input
          type="text"
          field="code"
          autoComplete="off"
          placeholder={translate({
            zh_hant: TEXT.zh_hant.enterVerificationCode,
            zh_hans: TEXT.zh_hans.enterVerificationCode,
            lang
          })}
          floatElement={
            <SendCodeButton
              email={values.email}
              lang={lang}
              type="email_reset"
            />
          }
          values={values}
          errors={errors}
          touched={touched}
          handleBlur={handleBlur}
          handleChange={handleChange}
        />
      </Modal.Content>

      <div className="buttons">
        <Modal.FooterButton
          width="full"
          htmlType="submit"
          disabled={!_isEmpty(errors) || isSubmitting}
          loading={isSubmitting}
        >
          <Translate
            zh_hant={TEXT.zh_hant.nextStep}
            zh_hans={TEXT.zh_hans.nextStep}
          />
        </Modal.FooterButton>
      </div>

      <style jsx>{styles}</style>
    </form>
  )
}