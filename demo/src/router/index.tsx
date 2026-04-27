import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { IntroPage } from '@/pages/intro/IntroPage'
import { ExploreChoicePage } from '@/pages/onboarding/ExploreChoicePage'
import { ExploreQuickPage } from '@/pages/onboarding/ExploreQuickPage'
import { ProfileResultPage } from '@/pages/onboarding/ProfileResultPage'
import { HomePage } from '@/pages/home/HomePage'
import { SelfExplorePage } from '@/pages/self-explore/SelfExplorePage'
import { FragmentRecordPage } from '@/pages/fragment/FragmentRecordPage'
import { ScenarioChoicePage } from '@/pages/scenario/ScenarioChoicePage'
import { ScenarioDialoguePage } from '@/pages/scenario/ScenarioDialoguePage'
import { ComicPlayPage } from '@/pages/scenario/ComicPlayPage'
import { WorldlinePage } from '@/pages/worldline/WorldlinePage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // 开屏动画
      {
        path: 'intro',
        element: <IntroPage />,
      },

      // 冷启动流程
      {
        path: 'onboarding',
        children: [
          { path: 'explore-choice', element: <ExploreChoicePage /> },
          { path: 'explore-quick', element: <ExploreQuickPage /> },
          { path: 'profile-result', element: <ProfileResultPage /> },
        ],
      },

      // 主页面
      {
        path: 'home',
        element: <HomePage />,
      },

      // 自我探索
      {
        path: 'self-explore',
        element: <SelfExplorePage />,
      },

      // 碎片记录
      {
        path: 'fragment',
        element: <FragmentRecordPage />,
      },

      // 平行推演
      {
        path: 'scenario',
        children: [
          { index: true, element: <ScenarioChoicePage /> },
          { path: 'dialogue', element: <ScenarioDialoguePage /> },
          { path: 'comic', element: <ComicPlayPage /> },
        ],
      },

      // 世界线
      {
        path: 'worldline',
        element: <WorldlinePage />,
      },

      // 用户画像
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      // 默认跳转
      {
        index: true,
        element: <IntroPage />,
      },
    ],
  },
])