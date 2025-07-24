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

import { EditorState, Extension } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightTrailingWhitespace,
  highlightWhitespace,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
// import { lintKeymap, linter, lintGutter } from "@codemirror/lint"; // TODO: ?linters only for JS/TS and JSON
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { sass } from "@codemirror/lang-sass";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { json } from "@codemirror/lang-json";
import { liquid } from "@codemirror/lang-liquid";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { yaml } from "@codemirror/lang-yaml";
import { wast } from "@codemirror/lang-wast";
import {
  sql,
  StandardSQL,
  PostgreSQL,
  MySQL,
  MariaSQL,
  MSSQL,
  SQLite,
  Cassandra,
  PLSQL,
} from "@codemirror/lang-sql";

const customEditorHeight = EditorView.theme({
  "&.cm-editor": {
    height: "100%",
  },
});

function langExtension(fileExt: string, settings: any) {
  switch (fileExt) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      const js = javascript({
        typescript: fileExt.includes("ts"),
        jsx: fileExt.includes("x"),
      });
      // @ts-ignore
      if (js.extension[1].length == 3 && !settings.autoCloseTags) {
        // @ts-ignore
        js.extension[1] = js.extension[1].slice(0, -1);
      }

      return [js];
    case "css":
      return [css()];
    case "sass":
      return [sass({ indented: true })];
    case "scss":
      return [sass({ indented: false })];
    case "cpp":
    case "cc":
    case "h":
    case "hpp":
      return [cpp()];
    case "go":
      return [go()];
    case "html":
    case "htm":
      return [
        html({
          matchClosingTags: true,
          selfClosingTags: true,
          autoCloseTags: settings.autoCloseTags,
        }),
      ];
    case "java":
    case "class":
      return [java()];
    case "py":
      return [python()];
    case "json":
      return [json()];
    case "liquid":
      return [liquid()];
    case "php":
      return [php()];
    case "rs":
      return [rust()];
    case "yaml":
    case "yml":
      return [yaml()];
    case "wast":
    case "wat":
      return [wast()];
    case "sql":
      return [sql({ dialect: StandardSQL })];
    case "mysql":
      return [sql({ dialect: MySQL })];
    case "pgsql":
    case "postgresql":
      return [sql({ dialect: PostgreSQL })];
    case "sqlite":
    case "db":
      return [sql({ dialect: SQLite })];
    case "mssql":
      return [sql({ dialect: MSSQL })];
    case "cql":
      return [sql({ dialect: Cassandra })];
    case "plsql":
      return [sql({ dialect: PLSQL })];
    case "mariadb":
      return [sql({ dialect: MariaSQL })];
    default:
      return [];
  }
}

function coreExtensions(settings: any) {
  const coreExtensions: Extension[] = [
    history(),
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    rectangularSelection(),
    drawSelection(),
    bracketMatching(),
    foldGutter(),
    dropCursor(),
    crosshairCursor(),
    closeBrackets(),
    indentOnInput(),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    EditorState.allowMultipleSelections.of(true),
    customEditorHeight,

    // EditorState.tabSize.of(), // TODO: [ifbug] tab size = what??
    // EditorState.lineSeparator.of(), // TODO: [ifbug] correct line separator

    // TODO: ?export keymaps to description/settings?
    keymap.of([
      ...defaultKeymap,
      ...closeBracketsKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab, // TODO: [ifbug] tab = what? now "  ", not "\t"
    ]),
  ];

  if (settings.highlightWhitespace) coreExtensions.push(highlightWhitespace());
  if (settings.highlightTrailingWhitespace)
    coreExtensions.push(highlightTrailingWhitespace());

  return coreExtensions;
}

export function getExtensions(fileExt: string, settings: any) {
  return [...coreExtensions(settings), ...langExtension(fileExt, settings)];
}
