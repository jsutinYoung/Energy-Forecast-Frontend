import {Injectable} from '@angular/core';
import * as firebase from 'firebase';

@Injectable({providedIn: 'root'})

export class AuthService {
  private token = '';

  async signupUser(email: string, password: string): Promise<boolean> {
    // firebase.auth()
    //     .createUserWithEmailAndPassword(email, password)
    //   .catch(error => console.log(error))
    try {
      const result =
          await firebase.auth().createUserWithEmailAndPassword(email, password);
      return true;
    } catch (error) {
      console.log('Sign up user failed.' + error);
      return false;
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {

      const result =
          await firebase.auth().signInWithEmailAndPassword(email, password);
      this.token = await firebase.auth().currentUser.getIdToken();
      return true;
    } catch (error) {
      console.log('Authentication failed.' + error);
      return false;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      const result = firebase.auth().signOut();
      return true;
      this.token = '';
    } catch (error) {
      this.token = '';
      console.log('Signout failed.' + error);
      return false;
    }
  }


  isAuthenticated(): Promise<boolean> | boolean {

    // const promise = new Promise<boolean>((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(this.token !== '');
    //   }, 5000);
    // });

    // return promise;
    return this.token !== '';
  }

  getToken() {
    return this.token;
  }
}
