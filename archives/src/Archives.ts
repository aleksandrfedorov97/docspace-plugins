import { Actions, Components, IMessage, IToast, ToastType } from "@onlyoffice/docspace-plugin-sdk";
import plugin from ".";
import * as fflate from "fflate";
import { modalDialogProps, frameProps, extractButton } from "./ModalDialog";
import { drawInIframe, loader, viewer } from "./ModalDialog/Viewer";

class Archives {
  apiURL: string = "";
  currentFolderId: number | null = null;
  saveRequestRunning: boolean = false;
  currentFileId: number | null = null;
  archiveBuffer: fflate.Zippable = {};
  root: FileTreeItem[] = [];

  setCurrentFolderId = (id: number | null) => {
    this.currentFolderId = id;
  };

  createAPIUrl = () => {
    const api = plugin.getAPI();

    this.apiURL = api.origin.replace(/\/+$/, "");

    const params = [api.proxy, api.prefix];

    if (this.apiURL) {
      params.forEach((part) => {
        if (!part) return;
        const newPart = part.trim().replace(/^\/+/, "");
        this.apiURL += newPart
          ? this.apiURL.length > 0 && this.apiURL[this.apiURL.length - 1] === "/"
            ? newPart
            : `/${newPart}`
          : "";
      });
    }
  };

  setAPIUrl = (url: string) => {
    this.apiURL = url;
  };

  getAPIUrl = () => {
    return this.apiURL;
  };

  openZip = async (id: File | any) => {
    if (!this.apiURL) this.createAPIUrl();

    let file = id;

    if (!id.fileExst) {
      file = (await (await fetch(`${this.apiURL}/files/file/${id}`)).json()).response;
    }

    const userRes = (await (await fetch(`${this.apiURL}/people/@self`)).json()).response;
    var { theme } = userRes;
    if (theme === "System") theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Base";

    const { access, security } = file;

    if (!security?.Download) {
      return {
        actions: [Actions.showToast],
        toastProps: [{ type: ToastType.error, title: "You don't have permission to view this file" } as IToast],
      };
    }

    // TODO: showSaveButton?

    this.currentFileId = file.id;

    fetch(file.viewUrl)
      .then((data) => {
        if (data.status !== 200) {
          // TODO: error to dialog
        }
        return data.arrayBuffer();
      })
      .then((dataArrayBuffer) => {
        const dataUint8Array = new Uint8Array(dataArrayBuffer);
        fflate.unzip(dataUint8Array, (err, unzipped) => {
          if (err) console.log(err);
          this.root = buildFileTree(unzipped);
          drawInIframe(frameProps.id!, viewer, this.root, file.title, theme === "Dark");
        });
      });

    extractButton.onClick = async () => {
      await this.unzip(file.folderId, this.root, file.title.split(".").slice(0, -1).join("."));

      return {
        actions: [Actions.closeModal],
      };
    };

    const message: IMessage = {
      actions: [Actions.showModal],
      modalDialogProps: modalDialogProps,
    };

    drawInIframe(frameProps.id!, loader);
    return message;
  };

  unzip = async (folderId: number, content: FileTreeItem[], wrapperFolder?: string) => {
    const createFolder = async (f: FileTreeItem) => {
      const folderRes = await fetch(`${this.apiURL}/files/folder/${folderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          title: f.title,
        }),
      });

      const fId = (await folderRes.json()).response.id;

      await this.unzip(fId, f.content as FileTreeItem[]);
    };

    if (wrapperFolder) {
      await createFolder({ type: "folder", title: wrapperFolder, content: content });
      return;
    }

    for (const f of content) {
      if (f.type === "file") {
        const blob = new Blob([f.content as Uint8Array]);
        const file = new File([blob], `blob`, {
          type: "",
          lastModified: new Date().getTime(),
        });

        const formData = new FormData();
        formData.append("file", file);

        const sessionRes = await fetch(`${this.apiURL}/files/${folderId}/upload/create_session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            createOn: new Date(),
            fileName: f.title,
            fileSize: file.size,
            relativePath: "",
            CreateNewIfExist: true,
          }),
        });

        const sessionData = (await sessionRes.json()).response.data;

        await (
          await fetch(`${sessionData.location}`, {
            method: "POST",
            body: formData,
          })
        ).json();
      } else {
        await createFolder(f);
      }
    }
  };

  zipFolder = async (id: number) => {
    if (!this.apiURL) this.createAPIUrl();

    this.archiveBuffer = {};
    const folder = await this.fetchContent(id);

    const zip = fflate.zipSync(this.archiveBuffer);

    const blob = new Blob([zip]);

    const file = new File([blob], `blob`, {
      type: "",
      lastModified: new Date().getTime(),
    });

    const formData = new FormData();
    formData.append("file", file);

    const sessionRes = await fetch(`${this.apiURL}/files/${folder.current.parentId}/upload/create_session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        createOn: new Date(),
        fileName: `${folder.current.title}.zip`,
        fileSize: file.size,
        relativePath: "",
        CreateNewIfExist: true,
      }),
    });

    const sessionData = (await sessionRes.json()).response.data;

    const data = await (
      await fetch(`${sessionData.location}`, {
        method: "POST",
        body: formData,
      })
    ).json();

    const message: IMessage = {
      actions: [Actions.showToast],
      toastProps: [{ type: ToastType.success, title: "Zip is saved" } as IToast],
    };

    if (!data.success) {
      message.toastProps = [{ type: ToastType.error, title: "Failed to save zip" } as IToast];
      return message;
    }

    return message;
  };

  fetchContent = async (id: number, path: string = "") => {
    const folder = await this.getFolder(id);
    if (path !== "") {
      this.archiveBuffer[path] = new Uint8Array();
    }

    const filePromises = [];
    for (const file of folder.files) {
      filePromises.push(
        fetch(file.viewUrl)
          .then((data) => {
            if (data.status !== 200) {
              // TODO: error
            }
            return data.arrayBuffer();
          })
          .then((dataArrayBuffer) => {
            this.archiveBuffer[`${path}${file.title}`] = new Uint8Array(dataArrayBuffer);
          })
      );
    }

    const recursivePromises = [];
    for (const f of folder.folders) {
      recursivePromises.push(this.fetchContent(f.id, `${path}${f.title}/`));
    }

    await Promise.all([...filePromises, ...recursivePromises]);
    return folder;
  };

  getFolder = async (id?: number) => {
    return (await (await fetch(`${this.apiURL}/files/${id ? id : "rooms"}`)).json()).response;
  };
}

export interface FileTreeItem {
  type: "file" | "folder";
  title: string;
  content: Uint8Array | FileTreeItem[];
}

function buildFileTree(flatStructure: fflate.Unzipped): FileTreeItem[] {
  const root: { [key: string]: any } = {};

  for (const [path, data] of Object.entries(flatStructure)) {
    const isDirectory = path.endsWith("/");
    const normalizedPath = path.replace(/^\/+|\/+$/g, "");
    const parts = normalizedPath ? normalizedPath.split("/") : [];

    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        if (isDirectory) {
          currentNode[part + "/"] = { type: "folder", content: [] };
        } else {
          currentNode[part] = { type: "file", content: data };
        }
      } else {
        if (!currentNode[part + "/"]) {
          currentNode[part + "/"] = { type: "folder", content: {} };
        }
        currentNode = currentNode[part + "/"].content;
      }
    }
  }

  return convertToFinalStructure(root);
}

function convertToFinalStructure(node: any): FileTreeItem[] {
  const result: FileTreeItem[] = [];

  for (const [title, item] of Object.entries<FileTreeItem>(node)) {
    if (item.type === "folder") {
      const children = convertToFinalStructure(item.content);
      result.push({
        type: "folder",
        title: title.replace("/", ""),
        content: children,
      });
    } else if (item.type === "file") {
      result.push({
        type: "file",
        title,
        content: item.content,
      });
    }
  }

  result.sort((a, b) => {
    if (a.type === b.type) {
      return a.title.localeCompare(b.title);
    }
    return a.type === "folder" ? -1 : 1;
  });

  return result;
}

const archives = new Archives();

export default archives;
