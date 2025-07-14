import {
  Actions,
  ButtonSize,
  Components,
  IBox,
  IButton,
  IFrame,
  IMessage,
  IModalDialog,
  ModalDisplayType,
} from "@onlyoffice/docspace-plugin-sdk";

export const frameProps: IFrame = {
  width: "100%",
  height: "100%",
  name: "archives-iframe",
  id: "archives-iframe",
  src: "",
};

export const iframeBox: IBox = {
  widthProp: "800px",
  heightProp: "60vh",
  marginProp: "-16px -15px -8px -16px",
  children: [
    {
      component: Components.iFrame,
      props: frameProps,
    },
  ],
};

export const extractButton: IButton = {
  label: "Extract the archive",
  size: ButtonSize.small,
  primary: true,
  withLoadingAfterClick: true,
  disableWhileRequestRunning: true,
  onClick: () => {},
};

const intendBox: IBox = {
  widthProp: "8px",
};

const cancelButton: IButton = {
  label: "Cancel",
  size: ButtonSize.small,
  onClick: () => {
    return {
      actions: [Actions.closeModal],
    };
  },
};

const footerBox: IBox = {
  displayProp: "flex",
  flexDirection: "row",
  children: [
    {
      component: Components.button,
      props: extractButton,
    },
    {
      component: Components.box,
      props: intendBox,
    },
    {
      component: Components.button,
      props: cancelButton,
    },
  ],
};

export const modalDialogProps: IModalDialog = {
  dialogHeader: "Archive viewer",
  dialogBody: iframeBox,
  dialogFooter: footerBox,
  displayType: ModalDisplayType.modal,
  fullScreen: false,
  onClose: () => {
    const message: IMessage = {
      actions: [Actions.closeModal],
    };

    return message;
  },
  onLoad: async () => {
    return {
      newDialogHeader: modalDialogProps.dialogHeader || "",
      newDialogBody: modalDialogProps.dialogBody,
      newDialogFooter: modalDialogProps.dialogFooter,
    };
  },
  autoMaxHeight: true,
  autoMaxWidth: true,
};
