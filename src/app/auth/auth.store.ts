import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  EmailAuthProvider,
  OAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
} from '@angular/fire/auth';
import { TranslateStore } from '@ngx-translate/core';
import { DataService } from '../shared/services/data.service';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from '@angular/fire/firestore';
import { docsToObject, mapUser, UserMap } from '../shared/services/mapping.service';
import { IProfile } from '../shared/interfaces/profile.interface';
import { ROLE_OBJ } from '../shared/dummy/config';
import { ResidenceChangeService } from '../shared/services/resident.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  auth = getAuth();
  user: User | null = null;
  profile: IProfile | null = null;
  ownerHomeAccount: any | null = null;
  readonly residence = signal<any | null>(null);
  loading: boolean = false;

  constructor(public lang: TranslateStore, private readonly ds: DataService,     private residenceChangeService: ResidenceChangeService,private router: Router) {
    this.auth.onAuthStateChanged(async (user) => {
      this.loading = true;
      this.user = user;
      if (user) {
        this.profile = await this.fetchUser(user);
 
      }
      this.loading = false;
    });
  }

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  async register(email: string, password: string ): Promise<void> {
  
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async fetchEnvironment(user: User) {
    const profileDos = await getDoc(doc(this.ds.userRef(), user.uid));
    const profile = docsToObject(profileDos);
    this.profile = profile;
    // console.log('profile', profile);
  }
  // signInWithGoogle() {
  //   const provider = new OAuthProvider('google.com');
  //   return signInWithPopup(this.auth, provider);
  // }
  async signInWithGoogle() {
    const provider = new OAuthProvider('google.com');
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      this.user = user;

      const userRef = doc(this.ds.userRef(), user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber || null,
          login_at: serverTimestamp(),
          updated_by: mapUser(this.user),
          updated_at: serverTimestamp(),
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          key: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber || null,
          role: ROLE_OBJ.OWNER,
          passCode: null,
          passKey: null,
          phone: null,
          file: null,
          full_name: user.displayName || null,
          login_at: serverTimestamp(),
          created_at: serverTimestamp(),
          created_by: UserMap(this.user),
          updated_by: UserMap(this.user),
          updated_at: serverTimestamp(),
          register_type: {
            key: 2,
            name: 'Google',
          },
          selectedHomeKey: null,
          country: null,
        });
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  }

  async loginApple() {
    const auth = getAuth();
    const appleAuthProvider = new OAuthProvider('apple.com');
    appleAuthProvider.addScope('email');
    appleAuthProvider.addScope('name');
    const result = await signInWithPopup(auth, appleAuthProvider);
    const user = result.user;
  }

  async fetchUser(user: any) {
    return docsToObject(await getDoc(doc(this.ds.userRef(), user.uid)));
  }

  async fetchUserDoc(key: any) {
    return docsToObject(await getDoc(doc(this.ds.userRef(), key)));
  }

  

  async fetchResidence(user: any) {
    return docsToObject(await getDoc(doc(this.ds.residenceRef(), user.selectedHomeKey)));
  }


  signOut() {
    return this.auth.signOut().then(() =>{
      this.router.navigate(['/auth/login'])
    })
  }

  changePassword(
    currentPassword: string,
    emailLog: any,
    newPassword: string,
    callback: (success: boolean, err: string | null) => void
  ) {
    signInWithEmailAndPassword(this.auth, emailLog, currentPassword)
      .then((user) => {
        
        const userRef = doc(this.ds.userRef(), this.profile?.key);
        setDoc(userRef, {
          passCode: newPassword,
        }, { merge: true }); 

        updatePassword(user.user, newPassword)
          .then(() => {
            callback(true, null);
          })
          .catch((err) => {
            alert(err);
            callback(false, err);
          });
      })
      .catch((err) => {
        alert('Your current password incorrect.');
        callback(false, err);
      });

  }

  changePasswordAccount(
    newPassword: string,
    data: any,
    callback: (success: boolean, err: string | null) => void
  ) {
    const accountRef = doc(this.ds.userRef(), data?.key);
    setDoc(
      accountRef,
      {
        passCode: newPassword || null,
        resetPassword: true,
        updated_at: serverTimestamp(),
        updated_by: mapUser(this.profile),
      },
      { merge: true }
    )
      .then(() => {
        callback(true, null);
      })
      .catch((error) => {
        console.error("Failed to update the account:", error);
        callback(false, error.message || "An error occurred.");
      });
  }


}
