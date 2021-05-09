/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ModalExample = () => {
  const [modal, setModal] = useState(true);

  const toggle = () => setModal(!modal);

  const reload = () => window.location.reload();
  return (
    <Modal onClosed={ reload } isOpen={ modal } toggle={ toggle }>
      <ModalHeader toggle={ toggle }>ERROR 403</ModalHeader>
      <ModalBody>
        GitHub API calls limit exceeded.
        Wait a moment for more queries.
        Click OK to go back to home.
      </ModalBody>
      <ModalFooter>
        <Button color="dark" onClick={ toggle }>OK</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalExample;
