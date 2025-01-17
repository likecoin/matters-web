import { DataProxy } from 'apollo-cache'
import _omit from 'lodash/omit'

import { ERROR_CODES } from '~/common/enums'
import TAG_MAINTAINERS from '~/components/GQL/queries/tagMaintainers'
import { TagMaintainersQuery } from '~/gql/graphql'

type TagMaintainersNodeTagEditor = NonNullable<
  NonNullable<TagMaintainersQuery['node'] & { __typename: 'Tag' }>['editors']
>[0]

const update = ({
  cache,
  id,
  type,
  editors,
}: {
  cache: DataProxy
  id: string
  type: 'add' | 'remove'
  editors: any[]
}) => {
  try {
    if (!id) {
      return
    }

    const variables = { id }
    const cacheData = cache.readQuery<TagMaintainersQuery>({
      query: TAG_MAINTAINERS,
      variables,
    })

    if (!cacheData || !cacheData.node || cacheData.node.__typename !== 'Tag') {
      return
    }

    const currEditors = cacheData.node.editors || []

    switch (type) {
      case 'add': {
        const newEditors = editors.map(
          ({ node }) => _omit(node, ['selected']) as TagMaintainersNodeTagEditor
        )
        cacheData.node.editors = [...currEditors, ...newEditors]
        break
      }
      case 'remove': {
        const newEditors = currEditors.filter(
          (editor) => !editors.includes(editor.id)
        )
        cacheData.node.editors = newEditors
        break
      }
    }

    cache.writeQuery({
      query: TAG_MAINTAINERS,
      variables,
      data: cacheData,
    })
  } catch (e) {
    if ((e as any).message.startsWith("Can't find field")) {
      console.warn(ERROR_CODES.QUERY_FIELD_NOT_FOUND)
    } else {
      console.error(e)
    }
  }
}

export default update
