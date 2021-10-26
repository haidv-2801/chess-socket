import React, { useEffect, useState, useRef } from 'react';
import { gameSubject, initGame, resetGame } from './Game';
import { Drawer, Modal, Button, Radio, message } from 'antd';
import { ROOMS, PLAY_MODE } from './Constant';

import Rooms from './Rooms';
import Board from './Board';
import io from 'socket.io-client';

import '../scss/App.css';
import 'antd/dist/antd.css';

function App() {
  const [board, setBoard] = useState([]);
  const [isGameOver, setIsGameOver] = useState();
  const [result, setResult] = useState();
  const [turn, setTurn] = useState();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [playMode, setPlayMode] = useState(PLAY_MODE.PVSF);
  const [roomConnected, setRoomConnected] = useState(null);

  const socketRef = useRef();

  useEffect(() => {
    initGame();
    const subscribe = gameSubject.subscribe((game) => {
      setBoard(game.board);
      setIsGameOver(game.isGameOver);
      setResult(game.result);
      setTurn(game.turn);
    });
    return () => subscribe.unsubscribe();
  }, []);

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:4000');
    socketRef.current.on('gameObject', (gameObject) => {
      setBoard(gameObject);
    });
    return () => socketRef.current.disconnect();
  }, [board]);

  const renderDrawer = () => {
    return (
      <Drawer
        width={400}
        title="Phòng chơi"
        placement={'right'}
        closable={true}
        onClose={() => {
          setDrawerVisible(false);
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
        title="Chess"
        onOk={() => {}}
        onCancel={() => {
          setModalVisible(false);
        }}
        className="chess-modal"
        footer={[
          <Button
            key="back"
            className="chess-button-type-1"
            onClick={() => {
              setModalVisible(false);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="chess-button"
            disabled={playMode === PLAY_MODE.PVSP && !roomConnected}
            onClick={() => {
              setModalVisible(false);
            }}
          >
            Chơi
          </Button>,
        ]}
      >
        <p>Chế độ chơi:</p>
        {renderRadioButtons()}
      </Modal>
    );
  };

  const renderRadioButtons = () => {
    return (
      <Radio.Group
        onChange={(res) => {
          setPlayMode(res?.target?.value);
        }}
        name="radiogroup"
        defaultValue={playMode}
      >
        <Radio value={PLAY_MODE.PVSF}>Chơi 2 người</Radio>
        <br />
        <Radio value={PLAY_MODE.PVSE}>Chơi với máy</Radio>
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

  return (
    <>
      <div className="container">
        {isGameOver && (
          <h2 className="vertical-text">
            GAME OVER
            <button onClick={resetGame}>
              <span className="vertical-text"> NEW GAME</span>
            </button>
          </h2>
        )}
        <div className="board-container">
          <Board board={board} turn={turn} />
        </div>
        {result && <p className="vertical-text">{result}</p>}
      </div>
      {renderDrawer()}
      {renderModal()}
    </>
  );
}

export default App;
