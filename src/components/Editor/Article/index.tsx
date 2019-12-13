import { QueryResult } from '@apollo/react-common'
import { QueryLazyOptions, useLazyQuery } from '@apollo/react-hooks'
import { MattersArticleEditor } from '@matters/matters-editor'
import getConfig from 'next/config'
import { FC, useContext, useState } from 'react'

import {
  SearchUsers,
  SearchUsers_search_edges_node_User
} from '~/components/GQL/queries/__generated__/SearchUsers'
import SEARCH_USERS from '~/components/GQL/queries/searchUsers'
import { LanguageContext } from '~/components/Language'

import { ADD_TOAST } from '~/common/enums'
import editorStyles from '~/common/styles/utils/content.article.css'
import themeStyles from '~/common/styles/vendors/quill.bubble.css'

import { EditorDraft } from '../__generated__/EditorDraft'
import MentionUserList from '../MentionUserList'
import styles from './styles.css'

const {
  publicRuntimeConfig: { ASSET_DOMAIN }
} = getConfig()

interface Props {
  draft: EditorDraft
  search: (options?: QueryLazyOptions<Record<string, any>> | undefined) => void
  searchResult: QueryResult<SearchUsers, Record<string, any>>
  update: (draft: {
    title?: string | null
    content?: string | null
    coverAssetId?: string | null
  }) => Promise<void>
  upload: DraftAssetUpload
}

const ArticleEditor: FC<Props> = ({
  draft,
  search,
  searchResult,
  update,
  upload
}) => {
  const { lang } = useContext(LanguageContext)
  const [mentionKeyword, setMentionKeyword] = useState<string>('')

  const { id, content, publishState, title } = draft
  const isPending = publishState === 'pending'
  const isPublished = publishState === 'published'
  const readyOnly = isPending || isPublished
  const { data, loading } = searchResult

  const mentionUsers = (data?.search.edges || []).map(
    ({ node }: any) => node
  ) as SearchUsers_search_edges_node_User[]

  const mentionKeywordChange = (keyword: string) => {
    if (mentionKeyword === keyword) {
      return
    }
    search({ variables: { search: keyword } })
    setMentionKeyword(keyword)
  }

  return (
    <>
      <div className="container">
        <MattersArticleEditor
          editorContent={content || ''}
          editorContentId={id}
          editorUpdate={update}
          editorUpload={upload}
          eventName={ADD_TOAST}
          language={lang.toUpperCase()}
          mentionLoading={loading}
          mentionKeywordChange={mentionKeywordChange}
          mentionUsers={mentionUsers}
          mentionListComponent={MentionUserList}
          readOnly={readyOnly}
          siteDomain="matters.news"
          theme="bubble"
          titleDefaultValue={title || ''}
          uploadAssetDomain={ASSET_DOMAIN}
        />
      </div>
      <style jsx>{themeStyles}</style>
      <style jsx>{editorStyles}</style>
      <style jsx>{styles}</style>
    </>
  )
}

const ArticleEditorWrap: FC<Omit<Props, 'search' | 'searchResult'>> = props => {
  const [search, searchResult] = useLazyQuery<SearchUsers>(SEARCH_USERS)

  return (
    <ArticleEditor search={search} searchResult={searchResult} {...props} />
  )
}

export default ArticleEditorWrap
