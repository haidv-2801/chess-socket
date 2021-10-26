import React, { useState } from 'react';
import { Drawer, Modal, Button, Radio, message } from 'antd';
import { ROOMS } from './Constant';
import DotStatus from './DotStatus';

const Rooms = (props) => {
  const { onConnect, connectStatus } = props;

  const [roomItemHover, setRoomItemHover] = useState(false);

  return (
    <>
      {ROOMS?.map((item) => (
        <React.Fragment key={item?.id}>
          <div
            onMouseOver={() => {
              !connectStatus && setRoomItemHover(item?.id);
            }}
            onMouseLeave={() => {
              setRoomItemHover(false);
            }}
            className="room-item"
          >
            <div className="room-item">
              <DotStatus />
              <p>Phòng {item?.id}</p>
            </div>

            {roomItemHover === item?.id ? (
              <Button
                loading={connectStatus === true}
                onClick={() => {
                  onConnect && onConnect();
                }}
              >
                Kết nối
              </Button>
            ) : null}
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default Rooms;
