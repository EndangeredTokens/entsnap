import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
    this.storage.create()
  }

  async set(key: string, value: any) {
    await this.storage.set(key, value)
  }

  async get(key: string) {
    return this.storage.get(key)
  }

  async delete(key: string) {
    await this.storage.remove(key)
  }

  async clear() {
    await this.storage.clear()
  }
}
