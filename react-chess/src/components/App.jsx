import React, { useEffect, useState, useRef } from 'react';
import { Drawer, Modal, Button, Radio, message, Select } from 'antd';
import { ROOMS, PLAY_MODE } from './Constant';

import Rooms from './Rooms';
import ToolBoard from './ToolBoard';

import io from 'socket.io-client';
import $ from 'jquery';

import '../scss/App.css';
import 'antd/dist/antd.css';

const { Option } = Select;
const socket = io.connect('http://localhost:4000');

function App() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [playMode, setPlayMode] = useState(PLAY_MODE.PVSF);
  const [roomConnected, setRoomConnected] = useState(null);

  const socketRef = useRef();

  useEffect(() => {
    // socketRef.current = io.connect('http://localhost:4000');
    // socketRef.current.on('message', (message) => {
    //   console.log(message);
    // });
    // return () => socketRef.current.disconnect();
  });

  const renderDrawer = () => {
    return (
      <Drawer
        width={400}
        title="Phòng chơi"
        placement={'right'}
        closable={true}
        onClose={() => {
          setDrawerVisible(false);
          setPlayMode(PLAY_MODE.PVSF);
        }}
        visible={drawerVisible}
        key={'right'}
      >
        <Rooms
          onConnect={() => {
            setRoomConnected(true);
            setTimeout(() => {
              setDrawerVisible(false);
              setModalVisible(false);
              setRoomConnected(false);
              message.success('Kết nối thành công!');
            }, 1000);
          }}
          connectStatus={roomConnected}
        />
      </Drawer>
    );
  };

  const renderModal = () => {
    return (
      <Modal
        visible={modalVisible}
        title="Chọn chế độ chơi"
        className="chess-modal"
        closable={false}
        keyboard={true}
        footer={[
          <Button
            key="submit"
            type="primary"
            className="chess-button"
            disabled={playMode === PLAY_MODE.PVSP && !roomConnected}
            onClick={onPlay}
          >
            Chơi
          </Button>,
        ]}
      >
        {renderRadioButtons()}
      </Modal>
    );
  };

  const renderToolBoard = () => {
    return <ToolBoard />;
  };

  const renderRadioButtons = () => {
    return (
      <Radio.Group
        onChange={handleChangePlayMode}
        name="radiogroup"
        defaultValue={playMode}
        value={playMode}
      >
        <Radio value={PLAY_MODE.PVSF}>Chơi 2 người</Radio>
        <br />
        <Radio value={PLAY_MODE.PVSE}>Chơi với máy</Radio>
        {playMode === PLAY_MODE.PVSE ? (
          <Select defaultValue="3" style={{ width: 120 }}>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
          </Select>
        ) : null}
        <br />
        <Radio
          onClick={() => {
            setDrawerVisible(true);
          }}
          value={PLAY_MODE.PVSP}
        >
          Kết nối tới phòng
        </Radio>
      </Radio.Group>
    );
  };

  const handleChangePlayMode = (res) => {
    setPlayMode(res?.target?.value);
  };

  const onPlay = () => {
    setModalVisible(false);
    // socket.emit('message', { name: 'test', message: 'test' });
    $('#play-mode').attr('mode', playMode);
  };

  return (
    <>
      {renderToolBoard()}
      {renderDrawer()}
      {renderModal()}
    </>
  );
}

export default App;
