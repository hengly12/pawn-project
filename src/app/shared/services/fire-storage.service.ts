import { Injectable } from '@angular/core';
import {
  ref,
  getStorage,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { DataService } from './data.service';
import { IUploadFile } from '../interfaces/storage.interface';

export interface IFile {
  key?: string;
  name: string;
  downloadUrl: string;
  filePath: string;
  fileType: string;
  type: string;
  fileSize: number;
}
@Injectable({
  providedIn: 'root',
})
export class FireStorageService {
  uploadPercent: Observable<any> | undefined;
  startUpload: boolean = false;
  constructor(private ds: DataService) {}
  uploadPercentage: BehaviorSubject<number> = new BehaviorSubject(0);
  async uploadSelectedFile(
    file: any,
    uploadPath: string
  ): Promise<IFile | null> {
    let selectedFiles: IFile | null = null;
    const storage = getStorage();
    const filename = `${Math.random()
      .toString(36)
      .substring(7)}_${new Date().getTime()}${file.name}`;
    const path = `${uploadPath}/${filename}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise(async (resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              this.uploadPercentage.next(progress);
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            let fileType = file.type.split('/').slice(0, -1).join('/');
            const files: IFile = {
              name: file.name,
              filePath: path,
              downloadUrl: downloadURL,
              fileType: file.type,
              type: fileType,
              fileSize: file.size,
            };
            selectedFiles = files;
            this.startUpload = false;
            resolve(files);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  async uploadSelectedFileWidthKey(
    file: any,
    uploadPath: string
  ): Promise<IFile | null> {
    let selectedFiles: IFile | null = null;
    const storage = getStorage();
    const ext = file.type.split('/').pop();
    const key = this.ds.createId('file_managers');
    const filename = `${key}.${ext}`;
    const path = `${uploadPath}/${filename}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise(async (resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              this.uploadPercentage.next(progress);
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileType = file.type.split('/').slice(0, -1).join('/');
            const files: IFile = {
              key: key,
              name: file.name,
              filePath: path,
              downloadUrl: downloadURL,
              fileType: file.type,
              type: fileType,
              fileSize: file.size,
            };
            selectedFiles = files;
            this.startUpload = false;
            resolve(files);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  async upload(file: any, uploadPath: string, callback: any) {
    this.startUpload = true;
    const filename =
      Math.random().toString(36).substring(7) +
      new Date().getTime() +
      file.name;
    const path = `${uploadPath}/${filename}`;
    const storage = getStorage();
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            this.uploadPercentage.next(progress);
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        let fileType = file.type.split('/').slice(0, -1).join('/');
        const files: IFile = {
          name: file.name,
          filePath: path,
          downloadUrl: downloadURL,
          fileType: file.type,
          type: fileType,
          fileSize: file.size,
        };
        callback(files);
        this.startUpload = false;
      }
    );
  }

  async multiUpload(fileItems: any[], uploadPath: string, callback:any) {
    const selectedFiles: any[] = [];
    for await (const file of fileItems) {
      this.startUpload = true;
      const filename =
        Math.random().toString(36).substring(7) +
        new Date().getTime() +
        file.name;
      const path = `${uploadPath}/${filename}`;
      const storage = getStorage();
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              this.uploadPercentage.next(progress);
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          let fileType = file.type.split('/').slice(0, -1).join('/');
          const files: IFile = {
            name: file.name,
            filePath: path,
            downloadUrl: downloadURL,
            fileType: file.type,
            type: fileType,
            fileSize: file.size,
          };
          selectedFiles.push(files);
          this.startUpload = false;
        }
      );
      this.startUpload = false;
    }
    return selectedFiles;
  }

  async uploadPromise(
    file: File,
    uploadPath: string
  ): Promise<IUploadFile | null> {
    let selectedFiles: IUploadFile | null = null;
    const storage = getStorage();
    const filename = `${Math.random()
      .toString(36)
      .substring(7)}_${new Date().getTime()}${file.name}`;
    const path = `${uploadPath}/${filename}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise(async (resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              this.uploadPercentage.next(progress);
              break;
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            let fileType = file.type.split('/').slice(0, -1).join('/');
            const files: IUploadFile = {
              key: this.ds.createId('file_managers'),
              name: file.name,
              downloadUrl: downloadURL,
              fileType: file.type,
              type: fileType,
              fileSize: file.size,
              filename: filename,
            };
            selectedFiles = files;
            this.startUpload = false;
            resolve(files);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  uploadsAsPromise(files: File[], path: string): Promise<IUploadFile[]> {
    return new Promise(async (resolve, reject) => {
      if (!files?.length) return resolve([]);
      const promises = files.map((file) => this.uploadPromise(file, path));
      const filesUploaded = await Promise.all(promises);
      resolve(filesUploaded.filter((file): file is IUploadFile => file !== null));
    });
  }

  async deleteFiles(files: any[]) {
    for await (const file of files) {
      const storage = getStorage();
      const storageRef = ref(storage, file.filePath);
      await deleteObject(storageRef);
    }
  }
  async deleteFile(file: any) {
    const storage = getStorage();
    const storageRef = ref(storage, file.filePath);
    await deleteObject(storageRef);
  }

  async deleteFileUrl(url: any) {
    const storage = getStorage();
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }

  async deleteFilesUrl(files: IUploadFile[]) {
    for await (const file of files) {
      const storage = getStorage();
      const storageRef = ref(storage, file.downloadUrl);
      await deleteObject(storageRef);
    }
  }
}
