import { BackToHomeButton, Dialog, Layout, Translate } from '~/components'

const Complete = ({
  purpose,
  closeDialog,
}: {
  purpose: 'dialog' | 'page'
  closeDialog?: () => void
}) => {
  const isInPage = purpose === 'page'

  return (
    <>
      {isInPage && (
        <Layout.Header left={<Layout.Header.Title id="changeUserName" />} />
      )}

      {closeDialog && (
        <Dialog.Header title="changeUserName" closeDialog={closeDialog} />
      )}

      <Dialog.Message>
        <h3>
          <Translate id="successChangeUserName" />
        </h3>
        <br />
        {isInPage && <BackToHomeButton />}
      </Dialog.Message>

      {!isInPage && closeDialog && (
        <Dialog.Footer
          closeDialog={closeDialog}
          closeText={<Translate id="close" />}
        />
      )}
    </>
  )
}

export default Complete
