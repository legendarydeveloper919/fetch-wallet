import { Key } from "./key";
import { Crypto } from "./crypto";
import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export interface KeyRingData {
  chiper: string;
}

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, Key> = new Map();

  private loaded: boolean;

  private _mnemonic: string;

  private cipher: string;

  constructor() {
    this.loaded = false;
    this._mnemonic = "";
    this.cipher = "";
  }

  private get mnemonic(): string {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic;
    this.cached = new Map();
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (this.cipher === "") {
      return KeyRingStatus.EMPTY;
    } else if (this.mnemonic) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public bech32Address(path: string, prefix: string): string {
    return this.loadKey(path).bech32Address(prefix);
  }

  public async createKey(mnemonic: string, password: string) {
    this.mnemonic = mnemonic;
    this.cipher = await Crypto.encrypt(this.mnemonic, password);
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = "";
  }

  public async unlock(password: string) {
    // If password is invalid, error will be thrown.
    this.mnemonic = await Crypto.decrypt(this.cipher, password);
  }

  public async save() {
    const data: KeyRingData = {
      chiper: this.cipher
    };
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  public async restore() {
    const get = () => {
      return new Promise<KeyRingData>((resolve, reject) => {
        chrome.storage.local.get(data => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(data as KeyRingData);
        });
      });
    };

    const data = await get();

    if (data.chiper) {
      this.cipher = data.chiper;
    }
    this.loaded = true;
  }

  private loadKey(path: string): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const cachedKey = this.cached.get(path);
    if (cachedKey) {
      return cachedKey;
    }

    const privKey = generateWalletFromMnemonic(this.mnemonic, path);

    const key = new Key(privKey);
    this.cached.set(path, key);
    return key;
  }
}
