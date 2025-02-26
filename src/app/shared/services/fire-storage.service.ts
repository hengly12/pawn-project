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

}
