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
  IToggleButton,
  IComboBox,
  IComboBoxItem,
} from "@onlyoffice/docspace-plugin-sdk";
import codemirror from "../Codemirror";
import {
  createToggleSetting,
  createComboBoxSetting,
  updatePropsWithButton,
} from "./Utils";

export const themeOptions: IComboBoxItem[] = [
  { key: "Auto", label: "Auto" },
  { key: "Base", label: "Light" },
  { key: "Dark", label: "Dark" },
];

export const themeComboBox: IComboBox = {
  options: themeOptions,
  selectedOption: themeOptions.find(
    (o) => o.key === codemirror.settings.theme
  ) || {
    key: "Auto",
    label: "Auto",
  },
  onSelect: (option: IComboBoxItem) => {
    themeComboBox.selectedOption = option;
    return updatePropsWithButton(themeComboBox);
  },
  scaled: true,
  dropDownMaxHeight: 400,
  directionY: "both",
  scaledOptions: true,
};

export const themeSetting = createComboBoxSetting("Theme", themeComboBox);

export const highlightWhitespaceToggle: IToggleButton = {
  isChecked: codemirror.settings.highlightWhitespace,
  style: { position: "relative", gap: "0px" },
  onChange: () => {
    highlightWhitespaceToggle.isChecked = !highlightWhitespaceToggle.isChecked;
    return updatePropsWithButton(highlightWhitespaceToggle);
  },
};

export const highlightWhitespaceSetting = createToggleSetting(
  "Highlight whitespace",
  "Display whitespaces as dots and tabs as arrows.",
  highlightWhitespaceToggle
);

export const highlightTrailingWhitespaceToggle: IToggleButton = {
  isChecked: codemirror.settings.highlightTrailingWhitespace,
  style: { position: "relative", gap: "0px" },
  onChange: () => {
    highlightTrailingWhitespaceToggle.isChecked =
      !highlightTrailingWhitespaceToggle.isChecked;
    return updatePropsWithButton(highlightTrailingWhitespaceToggle);
  },
};

export const highlightTrailingWhitespaceSetting = createToggleSetting(
  "Highlight trailing whitespace",
  "Highlight whitespaces at the end of a line.",
  highlightTrailingWhitespaceToggle
);

export const autoCloseTagsToggle: IToggleButton = {
  isChecked: codemirror.settings.autoCloseTags,
  style: { position: "relative", gap: "0px" },
  onChange: () => {
    autoCloseTagsToggle.isChecked = !autoCloseTagsToggle.isChecked;
    return updatePropsWithButton(autoCloseTagsToggle);
  },
};

export const autoCloseTagsSetting = createToggleSetting(
  "Auto close tags",
  "Automatically insert close tags when a > or / is typed in HTML-like files.",
  autoCloseTagsToggle
);
