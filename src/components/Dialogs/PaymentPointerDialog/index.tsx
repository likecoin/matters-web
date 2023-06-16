import { useState } from 'react'

import { Dialog, Translate, useDialogSwitch } from '~/components'

import SetPaymentPointerForm from './SetPaymentPointerForm'

interface PaymentPointerProps {
  children: ({ openDialog }: { openDialog: () => void }) => React.ReactNode
}

const BasePaymentPointerDialog: React.FC<PaymentPointerProps> = ({
  children,
}) => {
  const formId = `set-payment-pointer-form`
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const { show, openDialog, closeDialog } = useDialogSwitch(true)

  return (
    <>
      {children({ openDialog })}

      <Dialog isOpen={show} onDismiss={closeDialog}>
        <Dialog.Header
          title="paymentPointer"
          closeDialog={closeDialog}
          rightBtn={
            <Dialog.TextButton
              color="green"
              type="submit"
              form={formId}
              disabled={isSubmitting || !isValid}
              text={<Translate zh_hant="確認" zh_hans="确认" en="Submit" />}
              loading={isSubmitting}
            />
          }
        />

        <SetPaymentPointerForm
          setIsSubmitting={setIsSubmitting}
          setIsValid={setIsValid}
          formId={formId}
          closeDialog={closeDialog}
        />
      </Dialog>
    </>
  )
}

export const PaymentPointerDialog = (props: PaymentPointerProps) => (
  <Dialog.Lazy mounted={<BasePaymentPointerDialog {...props} />}>
    {({ openDialog }) => <>{props.children({ openDialog })}</>}
  </Dialog.Lazy>
)
