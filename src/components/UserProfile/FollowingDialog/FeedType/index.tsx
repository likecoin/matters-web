import { SegmentedTabs, Translate } from '~/components'

export type FollowingFeedType = 'user' | 'circle' | 'tag'

import styles from './styles.module.css'

interface FeedTypeProps {
  type: FollowingFeedType
  setFeedType: (type: FollowingFeedType) => void
}

const FeedType = ({ type, setFeedType }: FeedTypeProps) => {
  const isCircle = type === 'circle'
  const isTag = type === 'tag'
  const isUser = type === 'user'

  return (
    <section className={styles.container}>
      <SegmentedTabs sticky>
        <SegmentedTabs.Tab
          onClick={() => setFeedType('user')}
          selected={isUser}
        >
          <Translate zh_hant="作者" zh_hans="作者" en="Authors" />
        </SegmentedTabs.Tab>

        <SegmentedTabs.Tab
          onClick={() => setFeedType('circle')}
          selected={isCircle}
        >
          <Translate zh_hant="圍爐" zh_hans="围炉" en="Circles" />
        </SegmentedTabs.Tab>

        <SegmentedTabs.Tab onClick={() => setFeedType('tag')} selected={isTag}>
          <Translate id="tags" />
        </SegmentedTabs.Tab>
      </SegmentedTabs>
    </section>
  )
}

export default FeedType
