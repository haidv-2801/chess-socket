import React, { useState, useEffect } from 'react';

const MoveHistory = () => {
  useEffect(() => {
    let moveHis = document.getElementById('move-history'),
      moveHis2 = document.getElementById('move-his-2');

    if (moveHis && moveHis.hasChildNodes) {
      moveHis2.innerHTML = moveHis.innerHTML;
    }
  }, []);

  return <div id="move-his-2" class="move-history"></div>;
};

export default MoveHistory;
