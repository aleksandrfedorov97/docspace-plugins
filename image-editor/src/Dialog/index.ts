/*
 * (c) Copyright Ascensio System SIA 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Actions,
  IModalDialog,
  IMessage,
  IFrame,
  IBox,
  Components,
  ModalDisplayType,
  ButtonSize,
  IButton,
} from "@onlyoffice/docspace-plugin-sdk";

const closeDialog = () => {
  const message: IMessage = {
    actions: [Actions.closeModal],
  };

  return message;
};

export const saveExitButton: IButton = {
  label: "Save and Exit",
  size: ButtonSize.small,
  primary: true,
  withLoadingAfterClick: true,
  disableWhileRequestRunning: true,
  onClick: closeDialog,
};

const imageEditorFrame: IFrame = {
  name: "image-editor-plugin-iframe",
  id: "image-editor-plugin-iframe",
  src: "",
  style: {
    height: "100%",
    width: "100%",
  },
};

const iframeBox: IBox = {
  widthProp: "100%",
  heightProp: "100%",
  children: [
    {
      component: Components.iFrame,
      props: imageEditorFrame,
    },
  ],
};

const dialogBody: IBox = {
  widthProp: "80vw",
  heightProp: "80vh",
  displayProp: "flex",
  flexDirection: "column",
  children: [
    {
      component: Components.box,
      props: iframeBox,
    },
    {
      component: Components.button,
      props: saveExitButton,
    },
  ],
};

export const imageEditorModalDialogProps: IModalDialog = {
  dialogHeader: "",
  dialogBody: dialogBody,
  displayType: ModalDisplayType.modal,
  onClose: () => {
    const message: IMessage = {
      actions: [Actions.closeModal],
    };

    return message;
  },
  onLoad: async () => {
    return {
      newDialogHeader: imageEditorModalDialogProps.dialogHeader || "",
      newDialogBody: imageEditorModalDialogProps.dialogBody,
    };
  },
  autoMaxHeight: true,
  autoMaxWidth: true,
};
