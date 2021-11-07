import React from 'react';
import Draggable from 'react-draggable';
import { Tabs } from 'antd';
import {
  HistoryOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import MoveHistory from './MoveHistory';

const { TabPane } = Tabs;

const ToolBoard = () => {
  return (
    <Draggable>
      <div className="tool-board">
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Tin nhắn
              </span>
            }
            key="1"
          >
            Tab 1
          </TabPane>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Lịch sử
              </span>
            }
            key="2"
          >
            <MoveHistory />
          </TabPane>
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Cài đặt
              </span>
            }
            key="3"
          >
            Tab 3
          </TabPane>
        </Tabs>
        ,
      </div>
    </Draggable>
  );
};

export default ToolBoard;
