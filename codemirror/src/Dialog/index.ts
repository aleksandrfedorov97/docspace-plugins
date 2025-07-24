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
  IBox,
  IModalDialog,
  ModalDisplayType,
  Components,
  Actions,
  IMessage,
  IText,
  IButton,
  ButtonSize,
  Component,
} from "@onlyoffice/docspace-plugin-sdk";

const closeDialog = () => {
  const message: IMessage = {
    actions: [Actions.closeModal],
  };

  return message;
};

const titleText: IText = {
  text: "",
  isBold: true,
  fontSize: "2vh",
  lineHeight: "5vh",
};

const autoMarginBox: IBox = {
  marginProp: "auto",
};

const saveExitButton: IButton = {
  label: "Save",
  size: ButtonSize.small,
  primary: true,
  withLoadingAfterClick: true,
  disableWhileRequestRunning: true,
  onClick: closeDialog,
};

const intendBox: IBox = {
  widthProp: "1vw",
};

const exitButton: IButton = {
  label: "Exit",
  size: ButtonSize.small,
  onClick: closeDialog,
};

const headerBox: IBox = {
  widthProp: "98vw",
  heightProp: "5vh",
  paddingProp: "1vh 1vw",
  displayProp: "flex",
  flexDirection: "row",
  borderProp: "1px solid #ddd",
  children: [],
};

const iframeBox: IBox = {
  widthProp: "100%",
  heightProp: "93vh",
  children: [
    {
      component: Components.iFrame,
      props: {
        width: "100%",
        height: "100%",
        name: "codemirror-plugin-iframe",
        id: "codemirror-plugin-iframe",
        src: "",
      },
    },
  ],
};

export const codemirrorBox = (
  title: string = "",
  withSaveButton: boolean = true,
  saveHandler: () => Promise<IMessage> | IMessage | void = () => {},
  closeHandler: () => Promise<IMessage> | IMessage | void = closeDialog,
  theme: any[] = []
): IBox => {
  return {
    widthProp: "100%",
    heightProp: "100%",
    children: [
      {
        component: Components.box,
        props: {
          ...headerBox,
          borderProp: theme.length > 0 ? "none" : "1px solid #ddd",
          children: [
            {
              component: Components.text,
              props: { ...titleText, text: title },
            },
            {
              component: Components.box,
              props: autoMarginBox,
            },
            ...(withSaveButton
              ? ([
                  {
                    component: Components.button,
                    props: { ...saveExitButton, onClick: saveHandler },
                  },
                  {
                    component: Components.box,
                    props: intendBox,
                  },
                ] as Component[])
              : []),
            {
              component: Components.button,
              props: { ...exitButton, onClick: closeHandler },
            },
          ],
        },
      },
      {
        component: Components.box,
        props: iframeBox,
      },
    ],
  };
};

export const codemirrorModalDialogProps: IModalDialog = {
  dialogHeader: "",
  dialogBody: codemirrorBox(),
  displayType: ModalDisplayType.modal,
  fullScreen: true,
  onClose: closeDialog,
  onLoad: async () => {
    return {
      newDialogHeader: codemirrorModalDialogProps.dialogHeader || "",
      newDialogBody: codemirrorModalDialogProps.dialogBody,
    };
  },
  autoMaxHeight: true,
  autoMaxWidth: true,
};
