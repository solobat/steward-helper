import * as React from 'react';
import { useEffect, useReducer } from 'react';
import './Popup.scss';
import { getTabs } from '../helper/tab'
import Tabs from 'antd/es/tabs'
import { ACTIONS, pageReducer, PageContext, getInitialState, useModel } from '../store/modules/popup.store'
import { TabMeta } from '../common/types';
import { AutomationsPanel } from './components/Automation';
import { Records } from './components/Record';
import { onDbUpdate } from '../helper/db.helper';
import { noticeBg } from '../helper/event';
import { APP_ACTIONS } from '../common/const';
import { isAutoSync } from '../helper/sync';

export default function (props) {
  const [state, dispatch] = useReducer(pageReducer, getInitialState())

  useEffect(() => {
    getTabs((result) => {
      dispatch({ type: ACTIONS.TAB_META, payload: result })
    })
    const unbindFns = onDbUpdate(() => {
      if (isAutoSync()) {
        noticeBg({
          action: APP_ACTIONS.START_SYNC
        })
      }
    });

    return (() => {
      unbindFns.forEach(fn => fn());
    });
  }, [])

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      <Popup />
    </PageContext.Provider>
  )
}

function Popup() {
  const { state } = useModel()

  return (
    <div className="popupContainer">
      {state.tab ? <TabInfo tab={state.tab} /> : null}
    </div>
  )
}

interface TabInfoProps {
  tab: TabMeta;
}

const { TabPane } = Tabs;
function TabInfo(props: TabInfoProps) {
  const { host } = props.tab
  const { dispatch, state } = useModel()

  return (
    <div className="tab-info">
      <Tabs activeKey={ state.tabKey } onChange={(activeKey) => dispatch({ type: ACTIONS.TAB_CHANGE, payload: activeKey})}>
        <TabPane tab="Automations" key="automation">
          <AutomationsPanel />
        </TabPane>
        <TabPane tab="Records" key="records">
          <Records host={host} />
        </TabPane>
      </Tabs>
    </div>
  )
}
