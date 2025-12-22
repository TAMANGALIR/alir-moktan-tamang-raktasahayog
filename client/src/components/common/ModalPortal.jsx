import ReactDOM from 'react-dom';

/**
 * Portal wrapper for modals. Renders children at document.body level
 * to escape layout containers with overflow-y-auto that create
 * stacking contexts which clip fixed-position overlays.
 */
const ModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

export default ModalPortal;
